// ─── Marketplace / connector types ────────────────────────────────────────────
//
// A product is a connector definition for ANY REST API: a base URL, an auth
// strategy, the config fields the installing workspace must fill in, and a list
// of registered endpoints ("actions"). Each enabled action becomes one tool the
// AI agent can call.

export type ProductCategory =
	| "scheduling"
	| "payments"
	| "crm"
	| "ecommerce"
	| "communication"
	| "internal"
	| "other";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
	"scheduling",
	"payments",
	"crm",
	"ecommerce",
	"communication",
	"internal",
	"other",
];

export type AuthType = "none" | "bearer" | "api_key_header" | "api_key_query" | "basic" | "custom";

export const AUTH_TYPES: AuthType[] = ["none", "bearer", "api_key_header", "api_key_query", "basic", "custom"];

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export type ActionContentType = "json" | "form" | "none";

export const ACTION_CONTENT_TYPES: ActionContentType[] = ["json", "form", "none"];

export type ParamLocation = "path" | "query" | "body" | "header";

export const PARAM_LOCATIONS: ParamLocation[] = ["path", "query", "body", "header"];

export type ParamType = "string" | "number" | "boolean" | "object" | "array";

export const PARAM_TYPES: ParamType[] = ["string", "number", "boolean", "object", "array"];

/** One value the installing workspace must provide (token, account id, host…). */
export interface ConfigField {
	/** Referenced from auth_config / templated as {{key}} in URLs and headers. */
	key: string;
	label: string;
	type: "text" | "password" | "url";
	/** Secret values are encrypted at rest and never returned to the client. */
	secret: boolean;
	required: boolean;
	placeholder?: string;
	help?: string;
}

export type AuthConfig =
	| { type: "none" }
	/** Authorization: Bearer <field> — Stripe secret keys, Calendly PATs, most APIs. */
	| { type: "bearer"; token_field: string }
	/** Custom header, e.g. `X-API-Key: <field>` or `Authorization: Token <field>`. */
	| { type: "api_key_header"; header: string; prefix?: string; token_field: string }
	/** Key travels in the query string, e.g. `?api_key=<field>`. */
	| { type: "api_key_query"; param: string; token_field: string }
	/** HTTP Basic — base64(username:password). */
	| { type: "basic"; username_field: string; password_field: string }
	/** Arbitrary headers; values may contain {{config_key}} placeholders. */
	| { type: "custom"; headers: Record<string, string> };

/** One input of an action, mapped to where it travels in the HTTP request. */
export interface ActionParameter {
	name: string;
	in: ParamLocation;
	type: ParamType;
	required: boolean;
	description?: string;
	enum?: string[];
	/** Applied when the agent omits an optional parameter. */
	default?: string | number | boolean;
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

export interface ProductRow {
	id: string;
	workspace_id: string | null;
	name: string;
	description: string | null;
	logo_url: string | null;
	category: string;
	docs_url: string | null;
	base_url: string;
	auth_type: string;
	auth_config: string;
	config_fields: string;
	default_headers: string;
	is_public: number;
	created_by: string | null;
	created_at: number;
	updated_at: number;
}

export interface ProductActionRow {
	id: string;
	product_id: string;
	name: string;
	description: string;
	method: string;
	path: string;
	content_type: string;
	parameters: string;
	headers: string;
	response_path: string | null;
	requires_confirmation: number;
	is_read_only: number;
	enabled: number;
	sort_order: number;
	created_at: number;
	updated_at: number;
}

export interface WorkspaceProductRow {
	id: string;
	workspace_id: string;
	product_id: string;
	credentials: string | null;
	settings: string;
	status: string;
	last_test_at: number | null;
	last_test_ok: number | null;
	last_test_error: string | null;
	installed_at: number;
	updated_at: number;
}

export interface AgentToolRow {
	id: string;
	ai_agent_id: string;
	workspace_product_id: string;
	allowed_actions: string | null;
	created_at: number;
}

export interface ToolCallLogRow {
	id: string;
	workspace_id: string;
	workspace_product_id: string | null;
	product_action_id: string | null;
	ai_agent_id: string | null;
	ticket_id: string | null;
	triggered_by: string;
	user_id: string | null;
	action_id: string;
	method: string | null;
	url: string | null;
	request_params: string | null;
	status_code: number | null;
	ok: number;
	duration_ms: number | null;
	error: string | null;
	response_preview: string | null;
	created_at: number;
}

// ─── Public (API) shapes ──────────────────────────────────────────────────────

export interface PublicProductAction {
	id: string;
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

export interface PublicProduct {
	id: string;
	workspace_id: string | null;
	name: string;
	description: string | null;
	logo_url: string | null;
	category: ProductCategory;
	docs_url: string | null;
	base_url: string;
	auth_type: AuthType;
	auth_config: AuthConfig;
	config_fields: ConfigField[];
	default_headers: Record<string, string>;
	is_public: boolean;
	/** True when this product belongs to the requesting workspace (editable). */
	is_custom: boolean;
	actions: PublicProductAction[];
	created_at: number;
	updated_at: number;
}

export interface PublicWorkspaceProduct extends PublicProduct {
	workspace_product_id: string;
	/** Non-secret config values. */
	settings: Record<string, string>;
	/** Keys of the secret config fields that already have a stored value. */
	credential_keys: string[];
	status: string;
	last_test_at: number | null;
	last_test_ok: boolean | null;
	last_test_error: string | null;
	installed_at: number;
	/** Present only when loaded as an agent tool: action names the agent may use. */
	allowed_actions?: string[] | null;
}

/**
 * Everything the executor needs for one call. Credentials are decrypted here
 * and never leave the worker.
 */
export interface ResolvedToolContext {
	workspaceProductId: string;
	workspaceId: string;
	product: PublicProduct;
	action: PublicProductAction;
	credentials: Record<string, string>;
	settings: Record<string, string>;
}

export interface ToolCallResult {
	ok: boolean;
	status: number | null;
	/** Parsed (and optionally projected/truncated) response body. */
	data?: unknown;
	error?: string;
	duration_ms: number;
	/** Request line, secrets stripped — surfaced in the console, never to customers. */
	request?: { method: string; url: string };
}
