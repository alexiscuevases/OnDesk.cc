import type {
	ActionContentType,
	ActionParameter,
	AuthConfig,
	ParamType,
	PublicProduct,
	PublicProductAction,
	PublicWorkspaceProduct,
	ToolCallResult,
} from "./types";

// ─── Limits ───────────────────────────────────────────────────────────────────

/** Hard timeout for any outbound connector call. */
const REQUEST_TIMEOUT_MS = 15_000;
/** Max bytes read from the upstream response body. */
const MAX_RESPONSE_BYTES = 256_000;
/** Max characters of response data handed back to the model. */
const MAX_MODEL_CHARS = 6_000;

export class ToolValidationError extends Error {}

// ─── Tool identity ────────────────────────────────────────────────────────────

function sanitizeToolSegment(value: string): string {
	return value
		.trim()
		.replace(/[^a-zA-Z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");
}

/** Stable id the AI uses to call one endpoint, e.g. `Stripe_find_customer_by_email`. */
export function toolIdFor(productName: string, actionName: string): string {
	return `${sanitizeToolSegment(productName)}_${actionName}`;
}

export interface ResolvedTool {
	product: PublicWorkspaceProduct;
	action: PublicProductAction;
}

/**
 * Finds the product + action an actionId refers to, honouring per-agent action
 * allowlists and the enabled flags on both the install and the action.
 */
export function resolveTool(actionId: string, tools: PublicWorkspaceProduct[]): ResolvedTool | null {
	const wanted = actionId.trim();
	const wantedLower = wanted.toLowerCase();

	for (const product of tools) {
		const allowed = product.allowed_actions;
		for (const action of product.actions) {
			if (!action.enabled) continue;
			if (allowed && allowed.length > 0 && !allowed.includes(action.name)) continue;

			const id = toolIdFor(product.name, action.name);
			if (id === wanted || id.toLowerCase() === wantedLower) {
				return { product, action };
			}
		}
	}

	return null;
}

// ─── SSRF guard ───────────────────────────────────────────────────────────────

const BLOCKED_HOSTNAMES = new Set([
	"localhost",
	"metadata.google.internal",
	"metadata.goog",
	"instance-data",
]);

function isPrivateIpv4(host: string): boolean {
	const parts = host.split(".");
	if (parts.length !== 4) return false;
	const nums = parts.map((p) => Number(p));
	if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;

	const [a, b] = nums;
	if (a === 10 || a === 127 || a === 0) return true;
	if (a === 172 && b >= 16 && b <= 31) return true;
	if (a === 192 && b === 168) return true;
	if (a === 169 && b === 254) return true; // link-local / cloud metadata
	if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
	return false;
}

function isPrivateIpv6(host: string): boolean {
	const h = host.replace(/^\[|\]$/g, "").toLowerCase();
	if (h === "::1" || h === "::") return true;
	if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique-local
	if (h.startsWith("fe80")) return true; // link-local
	return false;
}

/**
 * Connectors are configured by workspace admins but executed by our worker with
 * our egress — so the target must be a public HTTPS host. Internal APIs are
 * reachable by publishing them (Cloudflare Tunnel / API gateway), never by
 * pointing at a private address.
 */
export function assertPublicHttpsUrl(rawUrl: string): URL {
	let url: URL;
	try {
		url = new URL(rawUrl);
	} catch {
		throw new ToolValidationError(`Invalid request URL: "${rawUrl}"`);
	}

	if (url.protocol !== "https:") {
		throw new ToolValidationError(`Only https:// endpoints are allowed (got "${url.protocol}//").`);
	}

	const host = url.hostname.toLowerCase();
	if (BLOCKED_HOSTNAMES.has(host) || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) {
		throw new ToolValidationError(`Host "${url.hostname}" is not reachable. Expose the API on a public HTTPS hostname.`);
	}
	if (isPrivateIpv4(host) || isPrivateIpv6(host)) {
		throw new ToolValidationError(`Private addresses are not allowed ("${url.hostname}"). Use a public HTTPS hostname.`);
	}

	return url;
}

// ─── Template + parameter handling ────────────────────────────────────────────

/** Replaces {{config_key}} placeholders from the install's settings/credentials. */
function applyTemplate(value: string, config: Record<string, string>): string {
	return value.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => config[key] ?? "");
}

function coerceParam(param: ActionParameter, raw: unknown): unknown {
	const type: ParamType = param.type ?? "string";

	if (type === "number") {
		const num = typeof raw === "number" ? raw : Number(String(raw).trim());
		if (!Number.isFinite(num)) throw new ToolValidationError(`Parameter "${param.name}" must be a number (got "${String(raw)}").`);
		return num;
	}

	if (type === "boolean") {
		if (typeof raw === "boolean") return raw;
		const text = String(raw).trim().toLowerCase();
		if (["true", "1", "yes"].includes(text)) return true;
		if (["false", "0", "no"].includes(text)) return false;
		throw new ToolValidationError(`Parameter "${param.name}" must be a boolean (got "${String(raw)}").`);
	}

	if (type === "object" || type === "array") {
		if (typeof raw === "string") {
			try {
				return JSON.parse(raw);
			} catch {
				throw new ToolValidationError(`Parameter "${param.name}" must be valid JSON for type ${type}.`);
			}
		}
		return raw;
	}

	return typeof raw === "string" ? raw : String(raw);
}

/** Placeholder values models like to emit when they don't actually have a value. */
const PLACEHOLDER_PATTERN = /^(?:\{.*\}|<.*>|null|undefined|todo|tbd|n\/a|xxx+|\.\.\.)$/i;

function isMissing(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed === "" || PLACEHOLDER_PATTERN.test(trimmed);
	}
	return false;
}

function appendEncoded(target: URLSearchParams, key: string, value: unknown): void {
	if (value === null || value === undefined) return;
	if (Array.isArray(value)) {
		value.forEach((item, index) => appendEncoded(target, `${key}[${index}]`, item));
		return;
	}
	if (typeof value === "object") {
		for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
			appendEncoded(target, `${key}[${childKey}]`, childValue);
		}
		return;
	}
	target.append(key, String(value));
}

export interface BuiltRequest {
	url: string;
	/** Same URL with secret values masked — safe to persist and display. */
	safeUrl: string;
	method: string;
	headers: Record<string, string>;
	body?: string;
	/** Parameters actually sent, with secrets masked. */
	safeParams: Record<string, unknown>;
}

interface BuildRequestInput {
	product: PublicProduct;
	action: PublicProductAction;
	params: Record<string, unknown>;
	credentials: Record<string, string>;
	settings: Record<string, string>;
}

function maskSecrets(text: string, secrets: string[]): string {
	let masked = text;
	for (const secret of secrets) {
		if (secret && secret.length >= 4) masked = masked.split(secret).join("••••");
	}
	return masked;
}

/**
 * Turns a registered action + the model's parameters into a concrete HTTP
 * request: path templating, parameter placement, auth injection, body encoding.
 */
export function buildToolRequest(input: BuildRequestInput): BuiltRequest {
	const { product, action, params, credentials, settings } = input;
	const config = { ...settings, ...credentials };
	const secretValues = Object.values(credentials).filter(Boolean);

	// ── Path ────────────────────────────────────────────────────────────────
	const base = applyTemplate(product.base_url ?? "", config).trim().replace(/\/+$/, "");
	let path = applyTemplate(action.path ?? "", config).trim();
	const isAbsolute = /^https?:\/\//i.test(path);
	if (!isAbsolute && path && !path.startsWith("/")) path = `/${path}`;
	if (!isAbsolute && !base) {
		throw new ToolValidationError(`Connector "${product.name}" has no base URL configured.`);
	}

	const declared = Array.isArray(action.parameters) ? action.parameters : [];
	const query = new URLSearchParams();
	const bodyObject: Record<string, unknown> = {};
	const headers: Record<string, string> = {};
	const safeParams: Record<string, unknown> = {};

	// ── Declared parameters ─────────────────────────────────────────────────
	for (const param of declared) {
		let raw = params[param.name];

		// Defaults come from the connector definition, so they may reference the
		// install's config ({{user_uri}}). Values supplied by the model never are
		// templated — that would let a prompt injection read stored credentials.
		if (isMissing(raw) && param.default !== undefined) {
			raw = typeof param.default === "string" ? applyTemplate(param.default, config) : param.default;
		}

		if (isMissing(raw)) {
			if (param.required) {
				throw new ToolValidationError(
					`Missing required parameter "${param.name}" for action "${action.name}". Retrieve the real value first — placeholders are not accepted.`,
				);
			}
			continue;
		}

		const value = coerceParam(param, raw);

		if (Array.isArray(param.enum) && param.enum.length > 0 && !param.enum.includes(String(value))) {
			throw new ToolValidationError(
				`Parameter "${param.name}" must be one of: ${param.enum.join(", ")} (got "${String(value)}").`,
			);
		}

		safeParams[param.name] = value;

		switch (param.in) {
			case "path": {
				const token = `{${param.name}}`;
				if (!path.includes(token)) {
					throw new ToolValidationError(`Path parameter "${param.name}" does not appear in the path "${action.path}".`);
				}
				path = path.split(token).join(encodeURIComponent(String(value)));
				break;
			}
			case "query":
				appendEncoded(query, param.name, value);
				break;
			case "header":
				headers[param.name] = String(value);
				break;
			case "body":
			default:
				bodyObject[param.name] = value;
				break;
		}
	}

	const unresolved = path.match(/\{([a-zA-Z0-9_]+)\}/);
	if (unresolved) {
		throw new ToolValidationError(`Path placeholder "{${unresolved[1]}}" was never provided as a path parameter.`);
	}

	// ── Headers: connector defaults → action headers → auth ─────────────────
	for (const [key, value] of Object.entries(product.default_headers ?? {})) {
		headers[key] = applyTemplate(String(value), config);
	}
	for (const [key, value] of Object.entries(action.headers ?? {})) {
		headers[key] = applyTemplate(String(value), config);
	}
	applyAuth(product.auth_config, config, headers, query);

	// ── Body ────────────────────────────────────────────────────────────────
	const method = (action.method ?? "GET").toUpperCase();
	const contentType: ActionContentType = action.content_type ?? "json";
	let body: string | undefined;
	const hasBody = method !== "GET" && method !== "DELETE" && Object.keys(bodyObject).length > 0;

	if (hasBody && contentType === "json") {
		headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
		body = JSON.stringify(bodyObject);
	} else if (hasBody && contentType === "form") {
		// Stripe-style bracket notation for nested values.
		const form = new URLSearchParams();
		for (const [key, value] of Object.entries(bodyObject)) appendEncoded(form, key, value);
		headers["Content-Type"] = headers["Content-Type"] ?? "application/x-www-form-urlencoded";
		body = form.toString();
	} else if (hasBody && contentType === "none") {
		// Body params on a bodyless action fall back to the query string.
		for (const [key, value] of Object.entries(bodyObject)) appendEncoded(query, key, value);
	}

	const queryString = query.toString();
	const url = `${isAbsolute ? path : `${base}${path}`}${queryString ? `?${queryString}` : ""}`;

	return {
		url,
		safeUrl: maskSecrets(url, secretValues),
		method,
		headers,
		body,
		safeParams,
	};
}

function applyAuth(
	authConfig: AuthConfig | undefined,
	config: Record<string, string>,
	headers: Record<string, string>,
	query: URLSearchParams,
): void {
	if (!authConfig || authConfig.type === "none") return;

	const requireField = (field: string): string => {
		const value = config[field];
		if (!value) {
			throw new ToolValidationError(`This connector is not configured yet — missing credential "${field}".`);
		}
		return value;
	};

	switch (authConfig.type) {
		case "bearer":
			headers["Authorization"] = `Bearer ${requireField(authConfig.token_field)}`;
			break;
		case "api_key_header": {
			const prefix = authConfig.prefix ? `${authConfig.prefix.trim()} ` : "";
			headers[authConfig.header || "Authorization"] = `${prefix}${requireField(authConfig.token_field)}`;
			break;
		}
		case "api_key_query":
			query.set(authConfig.param || "api_key", requireField(authConfig.token_field));
			break;
		case "basic": {
			const user = requireField(authConfig.username_field);
			const pass = config[authConfig.password_field] ?? "";
			headers["Authorization"] = `Basic ${btoa(`${user}:${pass}`)}`;
			break;
		}
		case "custom":
			for (const [key, value] of Object.entries(authConfig.headers ?? {})) {
				headers[key] = applyTemplate(String(value), config);
			}
			break;
	}
}

// ─── Response shaping ─────────────────────────────────────────────────────────

/** Walks a dot path (`data.items`) so only the useful slice reaches the model. */
function project(data: unknown, path: string | null): unknown {
	if (!path) return data;
	let current: unknown = data;
	for (const segment of path.split(".")) {
		if (current === null || current === undefined) return current;
		if (Array.isArray(current)) {
			const index = Number(segment);
			current = Number.isInteger(index) ? current[index] : undefined;
		} else if (typeof current === "object") {
			current = (current as Record<string, unknown>)[segment];
		} else {
			return undefined;
		}
	}
	return current;
}

/** Keeps tool results from flooding the model's context window. */
export function truncateForModel(data: unknown): unknown {
	let serialized: string;
	try {
		serialized = JSON.stringify(data);
	} catch {
		return { _error: "Response could not be serialized." };
	}
	if (serialized === undefined) return null;
	if (serialized.length <= MAX_MODEL_CHARS) return data;

	if (Array.isArray(data)) {
		const kept: unknown[] = [];
		let size = 0;
		for (const item of data) {
			const itemSize = JSON.stringify(item)?.length ?? 0;
			if (size + itemSize > MAX_MODEL_CHARS) break;
			kept.push(item);
			size += itemSize;
		}
		return { _truncated: true, _total_items: data.length, items: kept };
	}

	return { _truncated: true, preview: serialized.slice(0, MAX_MODEL_CHARS) };
}

// ─── Execution ────────────────────────────────────────────────────────────────

export interface ExecuteToolInput {
	product: PublicWorkspaceProduct;
	action: PublicProductAction;
	params: Record<string, unknown>;
	credentials: Record<string, string>;
}

/**
 * Performs one connector call. Never throws: validation and transport problems
 * come back as `{ ok: false, error }` so the agent can recover or escalate.
 */
export async function executeToolCall(input: ExecuteToolInput): Promise<ToolCallResult> {
	const { product, action, params, credentials } = input;
	const started = Date.now();

	let built: BuiltRequest;
	try {
		built = buildToolRequest({
			product,
			action,
			params,
			credentials,
			settings: product.settings ?? {},
		});
		assertPublicHttpsUrl(built.url);
	} catch (error) {
		return {
			ok: false,
			status: null,
			error: error instanceof Error ? error.message : String(error),
			duration_ms: Date.now() - started,
		};
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(built.url, {
			method: built.method,
			headers: { Accept: "application/json", ...built.headers },
			body: built.body,
			signal: controller.signal,
			redirect: "follow",
		});

		const rawText = (await response.text()).slice(0, MAX_RESPONSE_BYTES);
		let parsed: unknown = rawText;
		try {
			parsed = rawText ? JSON.parse(rawText) : null;
		} catch {
			/* non-JSON upstream — keep the text */
		}

		const duration = Date.now() - started;
		const request = { method: built.method, url: built.safeUrl };

		if (!response.ok) {
			return {
				ok: false,
				status: response.status,
				error: `Upstream responded ${response.status} ${response.statusText}`.trim(),
				data: truncateForModel(parsed),
				duration_ms: duration,
				request,
			};
		}

		return {
			ok: true,
			status: response.status,
			data: truncateForModel(project(parsed, action.response_path ?? null)),
			duration_ms: duration,
			request,
		};
	} catch (error) {
		const aborted = error instanceof Error && error.name === "AbortError";
		return {
			ok: false,
			status: null,
			error: aborted
				? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s.`
				: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
			duration_ms: Date.now() - started,
			request: { method: built.method, url: built.safeUrl },
		};
	} finally {
		clearTimeout(timer);
	}
}
