import type { ActionContentType, ActionParameter, HttpMethod, ParamType } from "./types";
import { HTTP_METHODS } from "./types";

/**
 * Turns a cURL command or an OpenAPI document into action drafts, so a
 * connector with dozens of endpoints doesn't have to be typed in by hand.
 * The drafts still go through validateActionPayload before they are stored.
 */

export interface ActionDraft {
	name: string;
	description: string;
	method: HttpMethod;
	path: string;
	content_type: ActionContentType;
	parameters: ActionParameter[];
	headers: Record<string, string>;
	response_path: string | null;
	requires_confirmation: boolean;
	is_read_only: boolean;
	enabled: boolean;
	sort_order: number;
}

export interface ImportResult {
	base_url: string | null;
	actions: ActionDraft[];
	warnings: string[];
}

const MAX_IMPORTED_ACTIONS = 100;

function snakeCase(value: string): string {
	return value
		.replace(/([a-z0-9])([A-Z])/g, "$1_$2")
		.replace(/[^a-zA-Z0-9]+/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_+|_+$/g, "")
		.toLowerCase();
}

function actionNameFrom(method: string, path: string, fallbackIndex: number): string {
	const segments = path
		.split("/")
		.filter(Boolean)
		.map((segment) => (segment.startsWith("{") ? `by_${snakeCase(segment)}` : snakeCase(segment)))
		.filter(Boolean);

	const verb = method.toLowerCase() === "get" ? "get" : method.toLowerCase();
	const name = snakeCase(`${verb}_${segments.join("_")}`) || `action_${fallbackIndex + 1}`;
	// Action names must start with a letter and stay within 64 chars.
	return name.replace(/^[^a-z]+/, "").slice(0, 63) || `action_${fallbackIndex + 1}`;
}

function isWrite(method: string): boolean {
	return method.toUpperCase() !== "GET";
}

function inferType(value: unknown): ParamType {
	if (typeof value === "number") return "number";
	if (typeof value === "boolean") return "boolean";
	if (Array.isArray(value)) return "array";
	if (value && typeof value === "object") return "object";
	return "string";
}

// ─── cURL ─────────────────────────────────────────────────────────────────────

/** Splits a shell command into tokens, honouring quotes and line continuations. */
function tokenizeShell(input: string): string[] {
	const normalised = input.replace(/\\\r?\n/g, " ").trim();
	const tokens: string[] = [];
	let current = "";
	let quote: '"' | "'" | null = null;

	for (let i = 0; i < normalised.length; i++) {
		const char = normalised[i];

		if (quote) {
			if (char === quote) quote = null;
			else if (char === "\\" && quote === '"' && i + 1 < normalised.length) current += normalised[++i];
			else current += char;
			continue;
		}

		if (char === '"' || char === "'") {
			quote = char;
			continue;
		}
		if (/\s/.test(char)) {
			if (current) tokens.push(current);
			current = "";
			continue;
		}
		current += char;
	}

	if (current) tokens.push(current);
	return tokens;
}

/** Parses one `curl` invocation into a single action draft. */
export function importFromCurl(command: string, knownBaseUrl?: string): ImportResult {
	const warnings: string[] = [];
	const tokens = tokenizeShell(command);
	if (tokens.length === 0 || !tokens[0].toLowerCase().includes("curl")) {
		return { base_url: null, actions: [], warnings: ["The command must start with `curl`."] };
	}

	let method = "";
	let url = "";
	const headers: Record<string, string> = {};
	const dataParts: string[] = [];
	let isJsonFlag = false;

	for (let i = 1; i < tokens.length; i++) {
		const token = tokens[i];
		const next = () => tokens[++i] ?? "";

		if (token === "-X" || token === "--request") method = next().toUpperCase();
		else if (token === "-H" || token === "--header") {
			const raw = next();
			const separator = raw.indexOf(":");
			if (separator > 0) headers[raw.slice(0, separator).trim()] = raw.slice(separator + 1).trim();
		} else if (token === "-d" || token === "--data" || token === "--data-raw" || token === "--data-binary") {
			dataParts.push(next());
		} else if (token === "--data-urlencode") {
			dataParts.push(next());
		} else if (token === "--json") {
			isJsonFlag = true;
			dataParts.push(next());
		} else if (token === "--url") url = next();
		else if (token === "-u" || token === "--user") {
			next();
			warnings.push("Basic auth credentials were ignored — configure auth on the connector instead.");
		} else if (token.startsWith("-")) {
			// Flags that carry no payload we care about (-s, -L, --compressed…).
			continue;
		} else if (!url) url = token;
	}

	if (!url) return { base_url: null, actions: [], warnings: ["No URL found in the command."] };

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(url);
	} catch {
		return { base_url: null, actions: [], warnings: [`"${url}" is not a valid absolute URL.`] };
	}

	const body = dataParts.join("&");
	if (!method) method = body ? "POST" : "GET";
	if (!HTTP_METHODS.includes(method as HttpMethod)) {
		return { base_url: null, actions: [], warnings: [`Unsupported HTTP method "${method}".`] };
	}

	const parameters: ActionParameter[] = [];

	// Query string → query parameters, seeded with the sample value as default.
	for (const [name, value] of parsedUrl.searchParams.entries()) {
		if (parameters.some((p) => p.name === name)) continue;
		parameters.push({
			name,
			in: "query",
			type: "string",
			required: false,
			description: `Imported from cURL (example: ${value})`,
		});
	}

	// Body → body parameters. JSON objects give us names and types for free.
	let contentType: ActionContentType = "none";
	const declaredContentType = Object.entries(headers).find(([key]) => key.toLowerCase() === "content-type")?.[1] ?? "";

	if (body) {
		const looksJson = isJsonFlag || declaredContentType.includes("json") || /^\s*[{[]/.test(body);
		if (looksJson) {
			contentType = "json";
			try {
				const parsedBody = JSON.parse(body);
				if (parsedBody && typeof parsedBody === "object" && !Array.isArray(parsedBody)) {
					for (const [name, value] of Object.entries(parsedBody as Record<string, unknown>)) {
						parameters.push({ name, in: "body", type: inferType(value), required: false });
					}
				} else {
					warnings.push("The JSON body was not an object — declare its fields manually.");
				}
			} catch {
				warnings.push("The request body could not be parsed as JSON — declare its fields manually.");
			}
		} else {
			contentType = "form";
			for (const [name] of new URLSearchParams(body).entries()) {
				if (parameters.some((p) => p.name === name)) continue;
				parameters.push({ name, in: "body", type: "string", required: false });
			}
		}
	}

	// Auth headers belong to the connector's auth config, not to one endpoint.
	const actionHeaders: Record<string, string> = {};
	for (const [key, value] of Object.entries(headers)) {
		const lower = key.toLowerCase();
		if (lower === "authorization" || lower === "content-type" || lower === "accept" || lower === "content-length") continue;
		if (/bearer\s|sk_live|sk_test|api[-_]?key/i.test(value)) {
			warnings.push(`Header "${key}" looked like a credential and was skipped — add it as a config field.`);
			continue;
		}
		actionHeaders[key] = value;
	}

	const origin = parsedUrl.origin;
	const path = parsedUrl.pathname || "/";
	if (knownBaseUrl && !knownBaseUrl.includes("{{") && !knownBaseUrl.startsWith(origin)) {
		warnings.push(`The command targets ${origin}, which differs from the connector's base URL.`);
	}

	return {
		base_url: origin,
		warnings,
		actions: [
			{
				name: actionNameFrom(method, path, 0),
				description: `${method} ${path} — imported from cURL. Describe when the agent should use it.`,
				method: method as HttpMethod,
				path,
				content_type: contentType,
				parameters,
				headers: actionHeaders,
				response_path: null,
				requires_confirmation: isWrite(method),
				is_read_only: !isWrite(method),
				enabled: true,
				sort_order: 0,
			},
		],
	};
}

// ─── OpenAPI ──────────────────────────────────────────────────────────────────

type Json = Record<string, unknown>;

function resolveRef(spec: Json, node: unknown, depth = 0): Json | null {
	if (!node || typeof node !== "object" || depth > 10) return (node as Json) ?? null;
	const record = node as Json;

	if (typeof record.$ref === "string") {
		const ref = record.$ref;
		if (!ref.startsWith("#/")) return null;
		let current: unknown = spec;
		for (const segment of ref.slice(2).split("/")) {
			const key = segment.replace(/~1/g, "/").replace(/~0/g, "~");
			if (!current || typeof current !== "object") return null;
			current = (current as Json)[key];
		}
		return resolveRef(spec, current, depth + 1);
	}

	// Flatten a single level of allOf so composed schemas still yield properties.
	if (Array.isArray(record.allOf)) {
		const merged: Json = { type: "object", properties: {}, required: [] };
		for (const part of record.allOf) {
			const resolved = resolveRef(spec, part, depth + 1);
			if (!resolved) continue;
			Object.assign(merged.properties as Json, (resolved.properties as Json) ?? {});
			if (Array.isArray(resolved.required)) {
				(merged.required as string[]).push(...(resolved.required as string[]));
			}
		}
		return merged;
	}

	return record;
}

function schemaType(schema: Json | null): ParamType {
	const type = typeof schema?.type === "string" ? schema.type : "string";
	if (type === "integer" || type === "number") return "number";
	if (type === "boolean") return "boolean";
	if (type === "array") return "array";
	if (type === "object") return "object";
	return "string";
}

function schemaEnum(schema: Json | null): string[] | undefined {
	if (!schema || !Array.isArray(schema.enum)) return undefined;
	const values = schema.enum.map((v) => String(v)).filter(Boolean);
	return values.length > 0 ? values : undefined;
}

export interface OpenApiImportOptions {
	/** Only import these operations, keyed as "GET /v1/customers". */
	include?: string[];
}

/** Extracts a connector's base URL and endpoint list from an OpenAPI 3.x document. */
export function importFromOpenApi(rawSpec: unknown, options: OpenApiImportOptions = {}): ImportResult {
	const warnings: string[] = [];

	let spec: Json;
	if (typeof rawSpec === "string") {
		try {
			spec = JSON.parse(rawSpec) as Json;
		} catch {
			return { base_url: null, actions: [], warnings: ["The spec is not valid JSON (YAML is not supported)."] };
		}
	} else if (rawSpec && typeof rawSpec === "object") {
		spec = rawSpec as Json;
	} else {
		return { base_url: null, actions: [], warnings: ["No spec provided."] };
	}

	const paths = spec.paths;
	if (!paths || typeof paths !== "object") {
		return { base_url: null, actions: [], warnings: ["The spec has no `paths` object."] };
	}

	// servers[0].url — may be relative, in which case the caller keeps its base URL.
	let baseUrl: string | null = null;
	if (Array.isArray(spec.servers) && spec.servers.length > 0) {
		const first = spec.servers[0] as Json;
		if (typeof first?.url === "string" && /^https?:\/\//i.test(first.url)) {
			baseUrl = first.url.replace(/\/+$/, "");
		}
	}

	const include = options.include && options.include.length > 0 ? new Set(options.include) : null;
	const actions: ActionDraft[] = [];
	const usedNames = new Set<string>();
	let skipped = 0;

	for (const [path, pathItemRaw] of Object.entries(paths as Json)) {
		const pathItem = resolveRef(spec, pathItemRaw);
		if (!pathItem) continue;

		const sharedParams = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];

		for (const method of HTTP_METHODS) {
			const operationRaw = pathItem[method.toLowerCase()];
			if (!operationRaw || typeof operationRaw !== "object") continue;

			const key = `${method} ${path}`;
			if (include && !include.has(key)) continue;
			if (actions.length >= MAX_IMPORTED_ACTIONS) {
				skipped++;
				continue;
			}

			const operation = operationRaw as Json;
			const parameters: ActionParameter[] = [];

			for (const paramRaw of [...sharedParams, ...(Array.isArray(operation.parameters) ? operation.parameters : [])]) {
				const param = resolveRef(spec, paramRaw);
				if (!param || typeof param.name !== "string") continue;
				const location = String(param.in ?? "query");
				if (location !== "path" && location !== "query" && location !== "header") continue;
				if (parameters.some((p) => p.name === param.name)) continue;

				const schema = resolveRef(spec, param.schema);
				parameters.push({
					name: param.name,
					in: location,
					type: schemaType(schema),
					required: location === "path" ? true : !!param.required,
					description: typeof param.description === "string" ? param.description.slice(0, 200) : undefined,
					enum: schemaEnum(schema),
				});
			}

			// Request body → body parameters (JSON or form-encoded).
			let contentType: ActionContentType = "none";
			const requestBody = resolveRef(spec, operation.requestBody);
			const content = requestBody?.content as Json | undefined;
			if (content) {
				const jsonEntry = content["application/json"] as Json | undefined;
				const formEntry = content["application/x-www-form-urlencoded"] as Json | undefined;
				const chosen = jsonEntry ?? formEntry;
				if (chosen) {
					contentType = jsonEntry ? "json" : "form";
					const schema = resolveRef(spec, chosen.schema);
					const properties = (schema?.properties as Json | undefined) ?? {};
					const required = new Set(Array.isArray(schema?.required) ? (schema?.required as string[]) : []);
					for (const [name, propRaw] of Object.entries(properties)) {
						if (parameters.some((p) => p.name === name)) continue;
						const prop = resolveRef(spec, propRaw);
						parameters.push({
							name,
							in: "body",
							type: schemaType(prop),
							required: required.has(name),
							description: typeof prop?.description === "string" ? prop.description.slice(0, 200) : undefined,
							enum: schemaEnum(prop),
						});
					}
				}
			}

			// Path placeholders must exist as path params even if the spec omitted them.
			for (const match of path.matchAll(/\{([^}]+)\}/g)) {
				const name = match[1];
				if (!parameters.some((p) => p.name === name && p.in === "path")) {
					parameters.push({ name, in: "path", type: "string", required: true });
				}
			}

			const rawName =
				typeof operation.operationId === "string" && operation.operationId.trim()
					? snakeCase(operation.operationId).slice(0, 63)
					: actionNameFrom(method, path, actions.length);
			let name = rawName.replace(/^[^a-z]+/, "") || actionNameFrom(method, path, actions.length);
			let suffix = 2;
			while (usedNames.has(name)) name = `${rawName.slice(0, 58)}_${suffix++}`;
			usedNames.add(name);

			const summary =
				(typeof operation.summary === "string" && operation.summary.trim()) ||
				(typeof operation.description === "string" && operation.description.trim()) ||
				`${method} ${path}`;

			actions.push({
				name,
				description: summary.slice(0, 400),
				method,
				path,
				content_type: contentType,
				parameters,
				headers: {},
				response_path: null,
				requires_confirmation: isWrite(method),
				is_read_only: !isWrite(method),
				enabled: true,
				sort_order: actions.length,
			});
		}
	}

	if (skipped > 0) warnings.push(`Only the first ${MAX_IMPORTED_ACTIONS} operations were imported (${skipped} skipped).`);
	if (actions.length === 0) warnings.push("No operations matched — nothing to import.");

	return { base_url: baseUrl, actions, warnings };
}
