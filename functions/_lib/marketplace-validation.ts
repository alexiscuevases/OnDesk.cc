import type {
	ActionContentType,
	ActionParameter,
	AuthConfig,
	AuthType,
	ConfigField,
	HttpMethod,
	ParamLocation,
	ParamType,
	ProductCategory,
} from "./types";
import {
	ACTION_CONTENT_TYPES,
	AUTH_TYPES,
	HTTP_METHODS,
	PARAM_LOCATIONS,
	PARAM_TYPES,
	PRODUCT_CATEGORIES,
} from "./types";

export type Validated<T> = { ok: true; value: T } | { ok: false; error: string };

const ok = <T>(value: T): Validated<T> => ({ ok: true, value });
const fail = <T>(error: string): Validated<T> => ({ ok: false, error });

const ACTION_NAME_PATTERN = /^[a-z][a-z0-9_]{1,63}$/;
const CONFIG_KEY_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;

function asRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value as Record<string, unknown>;
}

/** Header maps are string→string; anything else is rejected outright. */
export function validateHeaderMap(value: unknown, label: string): Validated<Record<string, string>> {
	if (value === undefined || value === null) return ok({});
	const record = asRecord(value);
	if (!record) return fail(`${label} must be an object of header name → value`);

	const result: Record<string, string> = {};
	for (const [key, raw] of Object.entries(record)) {
		if (!/^[A-Za-z0-9-]{1,64}$/.test(key)) return fail(`${label}: "${key}" is not a valid header name`);
		if (typeof raw !== "string") return fail(`${label}: value of "${key}" must be a string`);
		result[key] = raw;
	}
	return ok(result);
}

export function validateCategory(value: unknown): Validated<ProductCategory> {
	if (value === undefined || value === null || value === "") return ok("other");
	if (typeof value !== "string" || !PRODUCT_CATEGORIES.includes(value as ProductCategory)) {
		return fail(`category must be one of: ${PRODUCT_CATEGORIES.join(", ")}`);
	}
	return ok(value as ProductCategory);
}

export function validateBaseUrl(value: unknown): Validated<string> {
	if (typeof value !== "string" || value.trim() === "") return fail("base_url is required (e.g. https://api.stripe.com)");
	const trimmed = value.trim().replace(/\/+$/, "");

	// Templated hosts ({{tenant_host}}) are resolved per install, so they can only
	// be checked for shape here — the executor re-validates the final URL.
	if (trimmed.includes("{{")) {
		if (!/^https:\/\//i.test(trimmed)) return fail("base_url must start with https://");
		return ok(trimmed);
	}

	let url: URL;
	try {
		url = new URL(trimmed);
	} catch {
		return fail(`base_url is not a valid URL: "${trimmed}"`);
	}
	if (url.protocol !== "https:") return fail("base_url must use https://");
	return ok(trimmed);
}

export function validateConfigFields(value: unknown): Validated<ConfigField[]> {
	if (value === undefined || value === null) return ok([]);
	if (!Array.isArray(value)) return fail("config_fields must be an array");
	if (value.length > 20) return fail("config_fields supports at most 20 fields");

	const fields: ConfigField[] = [];
	const seen = new Set<string>();

	for (const raw of value) {
		const field = asRecord(raw);
		if (!field) return fail("each config field must be an object");

		const key = typeof field.key === "string" ? field.key.trim() : "";
		if (!CONFIG_KEY_PATTERN.test(key)) {
			return fail(`config field key "${key}" must be lowercase snake_case (e.g. secret_key)`);
		}
		if (seen.has(key)) return fail(`duplicate config field key "${key}"`);
		seen.add(key);

		const type = field.type === "password" || field.type === "url" ? field.type : "text";

		fields.push({
			key,
			label: typeof field.label === "string" && field.label.trim() ? field.label.trim() : key,
			type,
			secret: field.secret === undefined ? type === "password" : !!field.secret,
			required: !!field.required,
			placeholder: typeof field.placeholder === "string" ? field.placeholder : undefined,
			help: typeof field.help === "string" ? field.help : undefined,
		});
	}

	return ok(fields);
}

export function validateAuth(
	authTypeRaw: unknown,
	authConfigRaw: unknown,
	configFields: ConfigField[],
): Validated<{ auth_type: AuthType; auth_config: AuthConfig }> {
	const authType = typeof authTypeRaw === "string" ? authTypeRaw : "none";
	if (!AUTH_TYPES.includes(authType as AuthType)) {
		return fail(`auth_type must be one of: ${AUTH_TYPES.join(", ")}`);
	}

	const keys = new Set(configFields.map((f) => f.key));
	const config = asRecord(authConfigRaw) ?? {};

	const requireField = (name: string, label: string): string | null => {
		const value = typeof config[name] === "string" ? (config[name] as string).trim() : "";
		if (!value) return null;
		if (!keys.has(value)) {
			throw new Error(`auth_config.${name} points at "${value}", which is not one of the ${label} config fields`);
		}
		return value;
	};

	try {
		switch (authType as AuthType) {
			case "none":
				return ok({ auth_type: "none", auth_config: { type: "none" } });

			case "bearer": {
				const tokenField = requireField("token_field", "declared");
				if (!tokenField) return fail("auth_config.token_field is required for bearer auth");
				return ok({ auth_type: "bearer", auth_config: { type: "bearer", token_field: tokenField } });
			}

			case "api_key_header": {
				const tokenField = requireField("token_field", "declared");
				if (!tokenField) return fail("auth_config.token_field is required for header auth");
				const header = typeof config.header === "string" ? config.header.trim() : "";
				if (!/^[A-Za-z0-9-]{1,64}$/.test(header)) return fail("auth_config.header must be a valid header name");
				const prefix = typeof config.prefix === "string" ? config.prefix.trim() : undefined;
				return ok({
					auth_type: "api_key_header",
					auth_config: { type: "api_key_header", header, prefix: prefix || undefined, token_field: tokenField },
				});
			}

			case "api_key_query": {
				const tokenField = requireField("token_field", "declared");
				if (!tokenField) return fail("auth_config.token_field is required for query auth");
				const param = typeof config.param === "string" ? config.param.trim() : "";
				if (!param) return fail("auth_config.param is required for query auth");
				return ok({ auth_type: "api_key_query", auth_config: { type: "api_key_query", param, token_field: tokenField } });
			}

			case "basic": {
				const usernameField = requireField("username_field", "declared");
				const passwordField = requireField("password_field", "declared");
				if (!usernameField || !passwordField) {
					return fail("auth_config.username_field and auth_config.password_field are required for basic auth");
				}
				return ok({
					auth_type: "basic",
					auth_config: { type: "basic", username_field: usernameField, password_field: passwordField },
				});
			}

			case "custom": {
				const headers = validateHeaderMap(config.headers, "auth_config.headers");
				if (!headers.ok) return fail(headers.error);
				if (Object.keys(headers.value).length === 0) return fail("auth_config.headers is required for custom auth");
				return ok({ auth_type: "custom", auth_config: { type: "custom", headers: headers.value } });
			}
		}
	} catch (error) {
		return fail(error instanceof Error ? error.message : String(error));
	}

	return fail("Unsupported auth_type");
}

export function validateActionParameters(value: unknown, path: string): Validated<ActionParameter[]> {
	if (value === undefined || value === null) return ok([]);
	if (!Array.isArray(value)) return fail("parameters must be an array");
	if (value.length > 40) return fail("an action supports at most 40 parameters");

	const params: ActionParameter[] = [];
	const seen = new Set<string>();

	for (const raw of value) {
		const param = asRecord(raw);
		if (!param) return fail("each parameter must be an object");

		const name = typeof param.name === "string" ? param.name.trim() : "";
		if (!/^[A-Za-z_][A-Za-z0-9_.[\]-]{0,63}$/.test(name)) {
			return fail(`parameter name "${name}" is invalid`);
		}
		if (seen.has(name)) return fail(`duplicate parameter "${name}"`);
		seen.add(name);

		const location = typeof param.in === "string" ? param.in : "body";
		if (!PARAM_LOCATIONS.includes(location as ParamLocation)) {
			return fail(`parameter "${name}": in must be one of ${PARAM_LOCATIONS.join(", ")}`);
		}
		if (location === "path" && !path.includes(`{${name}}`)) {
			return fail(`path parameter "${name}" must appear in the path as {${name}}`);
		}

		const type = typeof param.type === "string" ? param.type : "string";
		if (!PARAM_TYPES.includes(type as ParamType)) {
			return fail(`parameter "${name}": type must be one of ${PARAM_TYPES.join(", ")}`);
		}

		let enumValues: string[] | undefined;
		if (param.enum !== undefined && param.enum !== null) {
			if (!Array.isArray(param.enum)) return fail(`parameter "${name}": enum must be an array`);
			enumValues = param.enum.map((v) => String(v)).filter((v) => v !== "");
			if (enumValues.length === 0) enumValues = undefined;
		}

		let defaultValue: string | number | boolean | undefined;
		if (param.default !== undefined && param.default !== null && param.default !== "") {
			if (typeof param.default === "string" || typeof param.default === "number" || typeof param.default === "boolean") {
				defaultValue = param.default;
			} else {
				return fail(`parameter "${name}": default must be a string, number or boolean`);
			}
		}

		params.push({
			name,
			in: location as ParamLocation,
			type: type as ParamType,
			required: !!param.required,
			description: typeof param.description === "string" && param.description.trim() ? param.description.trim() : undefined,
			enum: enumValues,
			default: defaultValue,
		});
	}

	// Every {placeholder} in the path must have a matching path parameter.
	const placeholders = [...path.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]);
	for (const placeholder of placeholders) {
		const match = params.find((p) => p.name === placeholder && p.in === "path");
		if (!match) return fail(`the path contains {${placeholder}} but no path parameter named "${placeholder}" was declared`);
	}

	return ok(params);
}

export interface ActionPayload {
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

/**
 * Validates one registered endpoint. `partial` mode (PATCH) only checks the
 * fields that are present, but path/parameters are always validated together
 * because they constrain each other.
 */
export function validateActionPayload(
	body: Record<string, unknown>,
	options: { partial?: boolean; currentPath?: string; currentParameters?: ActionParameter[] } = {},
): Validated<Partial<ActionPayload>> {
	const partial = !!options.partial;
	const result: Partial<ActionPayload> = {};

	if (body.name !== undefined || !partial) {
		const name = typeof body.name === "string" ? body.name.trim().toLowerCase() : "";
		if (!ACTION_NAME_PATTERN.test(name)) {
			return fail('name must be lowercase snake_case, e.g. "find_customer_by_email"');
		}
		result.name = name;
	}

	if (body.description !== undefined || !partial) {
		const description = typeof body.description === "string" ? body.description.trim() : "";
		if (description.length < 10) {
			return fail("description must be at least 10 characters — the AI relies on it to pick the right action");
		}
		result.description = description;
	}

	if (body.method !== undefined || !partial) {
		const method = typeof body.method === "string" ? body.method.toUpperCase() : "GET";
		if (!HTTP_METHODS.includes(method as HttpMethod)) return fail(`method must be one of: ${HTTP_METHODS.join(", ")}`);
		result.method = method as HttpMethod;
	}

	const pathProvided = body.path !== undefined || !partial;
	let path = options.currentPath ?? "/";
	if (pathProvided) {
		const raw = typeof body.path === "string" ? body.path.trim() : "";
		if (!raw) return fail('path is required, e.g. "/v1/customers/{customer_id}"');
		if (/\s/.test(raw)) return fail("path must not contain spaces");
		if (/^http:\/\//i.test(raw)) return fail("absolute paths must use https://");
		path = raw.startsWith("/") || /^https:\/\//i.test(raw) ? raw : `/${raw}`;
		result.path = path;
	}

	if (body.content_type !== undefined || !partial) {
		const contentType = typeof body.content_type === "string" ? body.content_type : "json";
		if (!ACTION_CONTENT_TYPES.includes(contentType as ActionContentType)) {
			return fail(`content_type must be one of: ${ACTION_CONTENT_TYPES.join(", ")}`);
		}
		result.content_type = contentType as ActionContentType;
	}

	if (body.parameters !== undefined || !partial) {
		const params = validateActionParameters(body.parameters, path);
		if (!params.ok) return fail(params.error);
		result.parameters = params.value;
	} else if (pathProvided && options.currentParameters) {
		// Path changed on its own — re-check the existing parameters still fit.
		const params = validateActionParameters(options.currentParameters, path);
		if (!params.ok) return fail(params.error);
	}

	if (body.headers !== undefined) {
		const headers = validateHeaderMap(body.headers, "headers");
		if (!headers.ok) return fail(headers.error);
		result.headers = headers.value;
	} else if (!partial) {
		result.headers = {};
	}

	if (body.response_path !== undefined) {
		if (body.response_path === null || body.response_path === "") result.response_path = null;
		else if (typeof body.response_path !== "string" || !/^[A-Za-z0-9_.[\]-]+$/.test(body.response_path.trim())) {
			return fail('response_path must be a dot path such as "data" or "result.items"');
		} else result.response_path = body.response_path.trim();
	} else if (!partial) {
		result.response_path = null;
	}

	if (body.requires_confirmation !== undefined) result.requires_confirmation = !!body.requires_confirmation;
	if (body.is_read_only !== undefined) result.is_read_only = !!body.is_read_only;
	if (body.enabled !== undefined) result.enabled = !!body.enabled;
	if (typeof body.sort_order === "number" && Number.isFinite(body.sort_order)) {
		result.sort_order = Math.floor(body.sort_order);
	}

	if (!partial) {
		const method = result.method ?? "GET";
		const isWrite = method !== "GET";
		result.is_read_only = body.is_read_only === undefined ? !isWrite : !!body.is_read_only;
		// Write actions default to human-approval-required; explicit opt-out allowed.
		result.requires_confirmation =
			body.requires_confirmation === undefined ? isWrite : !!body.requires_confirmation;
		result.enabled = body.enabled === undefined ? true : !!body.enabled;
		result.sort_order = result.sort_order ?? 0;
	}

	return ok(result);
}
