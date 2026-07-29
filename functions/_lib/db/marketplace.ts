import type {
	ActionContentType,
	ActionParameter,
	AuthConfig,
	AuthType,
	ConfigField,
	HttpMethod,
	ProductActionRow,
	ProductCategory,
	ProductRow,
	PublicProduct,
	PublicProductAction,
	PublicWorkspaceProduct,
	ToolCallLogRow,
	WorkspaceProductRow,
} from "../types";
import { decryptJson, encryptJson } from "../crypto";

// ─── Marketplace & Tools ──────────────────────────────────────────────────────
//
// Products are connector definitions (base URL + auth + registered endpoints).
// Installs (workspace_products) hold the workspace's own credentials, encrypted.

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
	if (!raw) return fallback;
	try {
		const parsed = JSON.parse(raw);
		return (parsed ?? fallback) as T;
	} catch {
		return fallback;
	}
}

export function rowToPublicProductAction(row: ProductActionRow): PublicProductAction {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		method: (row.method as HttpMethod) ?? "GET",
		path: row.path,
		content_type: (row.content_type as ActionContentType) ?? "json",
		parameters: parseJson<ActionParameter[]>(row.parameters, []),
		headers: parseJson<Record<string, string>>(row.headers, {}),
		response_path: row.response_path,
		requires_confirmation: row.requires_confirmation === 1,
		is_read_only: row.is_read_only === 1,
		enabled: row.enabled === 1,
		sort_order: row.sort_order,
	};
}

export function rowToPublicProduct(
	row: ProductRow,
	actions: PublicProductAction[],
	viewerWorkspaceId?: string,
): PublicProduct {
	return {
		id: row.id,
		workspace_id: row.workspace_id,
		name: row.name,
		description: row.description,
		logo_url: row.logo_url,
		category: (row.category as ProductCategory) ?? "other",
		docs_url: row.docs_url,
		base_url: row.base_url,
		auth_type: (row.auth_type as AuthType) ?? "none",
		auth_config: parseJson<AuthConfig>(row.auth_config, { type: "none" }),
		config_fields: parseJson<ConfigField[]>(row.config_fields, []),
		default_headers: parseJson<Record<string, string>>(row.default_headers, {}),
		is_public: row.is_public === 1,
		is_custom: !!row.workspace_id && row.workspace_id === viewerWorkspaceId,
		actions,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

async function loadActionsByProduct(db: D1Database, productIds: string[]): Promise<Map<string, PublicProductAction[]>> {
	const grouped = new Map<string, PublicProductAction[]>();
	if (productIds.length === 0) return grouped;

	const placeholders = productIds.map(() => "?").join(", ");
	const result = await db
		.prepare(
			`SELECT * FROM product_actions WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC, name ASC`,
		)
		.bind(...productIds)
		.all<ProductActionRow>();

	for (const row of result.results ?? []) {
		const list = grouped.get(row.product_id) ?? [];
		list.push(rowToPublicProductAction(row));
		grouped.set(row.product_id, list);
	}

	return grouped;
}

// ─── Products (catalog + custom connectors) ────────────────────────────────────

/**
 * Everything a workspace may browse: the public catalog templates plus its own
 * private connectors.
 */
export async function findVisibleProducts(db: D1Database, workspaceId: string): Promise<PublicProduct[]> {
	const result = await db
		.prepare(
			`SELECT * FROM products
       WHERE (is_public = 1 AND workspace_id IS NULL) OR workspace_id = ?
       ORDER BY (workspace_id IS NULL) DESC, name ASC`,
		)
		.bind(workspaceId)
		.all<ProductRow>();

	const rows = result.results ?? [];
	const actions = await loadActionsByProduct(db, rows.map((r) => r.id));
	return rows.map((row) => rowToPublicProduct(row, actions.get(row.id) ?? [], workspaceId));
}

export async function findProductById(db: D1Database, productId: string): Promise<ProductRow | null> {
	const result = await db.prepare("SELECT * FROM products WHERE id = ? LIMIT 1").bind(productId).first<ProductRow>();
	return result ?? null;
}

export async function findProductWithActions(
	db: D1Database,
	productId: string,
	viewerWorkspaceId?: string,
): Promise<PublicProduct | null> {
	const row = await findProductById(db, productId);
	if (!row) return null;
	const actions = await findProductActions(db, productId);
	return rowToPublicProduct(row, actions, viewerWorkspaceId);
}

export interface CreateProductInput {
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
}

export async function createProduct(
	db: D1Database,
	createdBy: string | null,
	input: CreateProductInput,
): Promise<ProductRow> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO products
        (id, workspace_id, name, description, logo_url, category, docs_url, base_url,
         auth_type, auth_config, config_fields, default_headers, is_public, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			input.workspace_id,
			input.name,
			input.description,
			input.logo_url,
			input.category,
			input.docs_url,
			input.base_url,
			input.auth_type,
			JSON.stringify(input.auth_config),
			JSON.stringify(input.config_fields),
			JSON.stringify(input.default_headers),
			input.is_public ? 1 : 0,
			createdBy,
		)
		.run();

	const row = await findProductById(db, id);
	if (!row) throw new Error("Failed to create product");
	return row;
}

export type UpdateProductInput = Partial<Omit<CreateProductInput, "workspace_id">>;

export async function updateProduct(db: D1Database, productId: string, input: UpdateProductInput): Promise<void> {
	const sets: string[] = [];
	const values: unknown[] = [];

	const push = (column: string, value: unknown) => {
		sets.push(`${column} = ?`);
		values.push(value);
	};

	if (input.name !== undefined) push("name", input.name);
	if (input.description !== undefined) push("description", input.description);
	if (input.logo_url !== undefined) push("logo_url", input.logo_url);
	if (input.category !== undefined) push("category", input.category);
	if (input.docs_url !== undefined) push("docs_url", input.docs_url);
	if (input.base_url !== undefined) push("base_url", input.base_url);
	if (input.auth_type !== undefined) push("auth_type", input.auth_type);
	if (input.auth_config !== undefined) push("auth_config", JSON.stringify(input.auth_config));
	if (input.config_fields !== undefined) push("config_fields", JSON.stringify(input.config_fields));
	if (input.default_headers !== undefined) push("default_headers", JSON.stringify(input.default_headers));
	if (input.is_public !== undefined) push("is_public", input.is_public ? 1 : 0);

	if (sets.length === 0) return;
	sets.push("updated_at = unixepoch()");

	await db
		.prepare(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`)
		.bind(...values, productId)
		.run();
}

export async function deleteProduct(db: D1Database, productId: string): Promise<void> {
	await db.prepare("DELETE FROM products WHERE id = ?").bind(productId).run();
}

// ─── Product actions (one per registered endpoint) ─────────────────────────────

export async function findProductActions(db: D1Database, productId: string): Promise<PublicProductAction[]> {
	const result = await db
		.prepare("SELECT * FROM product_actions WHERE product_id = ? ORDER BY sort_order ASC, name ASC")
		.bind(productId)
		.all<ProductActionRow>();
	return (result.results ?? []).map(rowToPublicProductAction);
}

export async function findProductActionById(db: D1Database, actionId: string): Promise<ProductActionRow | null> {
	const result = await db
		.prepare("SELECT * FROM product_actions WHERE id = ? LIMIT 1")
		.bind(actionId)
		.first<ProductActionRow>();
	return result ?? null;
}

export interface CreateProductActionInput {
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

export async function createProductAction(
	db: D1Database,
	productId: string,
	input: CreateProductActionInput,
): Promise<ProductActionRow> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO product_actions
        (id, product_id, name, description, method, path, content_type, parameters, headers,
         response_path, requires_confirmation, is_read_only, enabled, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			productId,
			input.name,
			input.description,
			input.method,
			input.path,
			input.content_type,
			JSON.stringify(input.parameters),
			JSON.stringify(input.headers),
			input.response_path,
			input.requires_confirmation ? 1 : 0,
			input.is_read_only ? 1 : 0,
			input.enabled ? 1 : 0,
			input.sort_order,
		)
		.run();

	const row = await findProductActionById(db, id);
	if (!row) throw new Error("Failed to create action");
	return row;
}

export type UpdateProductActionInput = Partial<CreateProductActionInput>;

export async function updateProductAction(
	db: D1Database,
	actionId: string,
	input: UpdateProductActionInput,
): Promise<void> {
	const sets: string[] = [];
	const values: unknown[] = [];

	const push = (column: string, value: unknown) => {
		sets.push(`${column} = ?`);
		values.push(value);
	};

	if (input.name !== undefined) push("name", input.name);
	if (input.description !== undefined) push("description", input.description);
	if (input.method !== undefined) push("method", input.method);
	if (input.path !== undefined) push("path", input.path);
	if (input.content_type !== undefined) push("content_type", input.content_type);
	if (input.parameters !== undefined) push("parameters", JSON.stringify(input.parameters));
	if (input.headers !== undefined) push("headers", JSON.stringify(input.headers));
	if (input.response_path !== undefined) push("response_path", input.response_path);
	if (input.requires_confirmation !== undefined) push("requires_confirmation", input.requires_confirmation ? 1 : 0);
	if (input.is_read_only !== undefined) push("is_read_only", input.is_read_only ? 1 : 0);
	if (input.enabled !== undefined) push("enabled", input.enabled ? 1 : 0);
	if (input.sort_order !== undefined) push("sort_order", input.sort_order);

	if (sets.length === 0) return;
	sets.push("updated_at = unixepoch()");

	await db
		.prepare(`UPDATE product_actions SET ${sets.join(", ")} WHERE id = ?`)
		.bind(...values, actionId)
		.run();
}

export async function deleteProductAction(db: D1Database, actionId: string): Promise<void> {
	await db.prepare("DELETE FROM product_actions WHERE id = ?").bind(actionId).run();
}

/** Bulk-inserts actions (used by the OpenAPI / cURL importer). */
export async function createProductActions(
	db: D1Database,
	productId: string,
	inputs: CreateProductActionInput[],
): Promise<number> {
	if (inputs.length === 0) return 0;

	const statements = inputs.map((input) =>
		db
			.prepare(
				`INSERT OR REPLACE INTO product_actions
          (id, product_id, name, description, method, path, content_type, parameters, headers,
           response_path, requires_confirmation, is_read_only, enabled, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(
				crypto.randomUUID(),
				productId,
				input.name,
				input.description,
				input.method,
				input.path,
				input.content_type,
				JSON.stringify(input.parameters),
				JSON.stringify(input.headers),
				input.response_path,
				input.requires_confirmation ? 1 : 0,
				input.is_read_only ? 1 : 0,
				input.enabled ? 1 : 0,
				input.sort_order,
			),
	);

	await db.batch(statements);
	return inputs.length;
}

// ─── Installs (workspace_products) ────────────────────────────────────────────

type InstalledJoinRow = ProductRow & {
	workspace_product_id: string;
	credentials: string | null;
	settings: string;
	status: string;
	last_test_at: number | null;
	last_test_ok: number | null;
	last_test_error: string | null;
	installed_at: number;
	allowed_actions?: string | null;
};

function rowToPublicWorkspaceProduct(
	row: InstalledJoinRow,
	actions: PublicProductAction[],
	viewerWorkspaceId?: string,
): PublicWorkspaceProduct {
	// Credential VALUES never leave the worker — callers get credential_keys only.
	return {
		...rowToPublicProduct(row, actions, viewerWorkspaceId),
		workspace_product_id: row.workspace_product_id,
		settings: parseJson<Record<string, string>>(row.settings, {}),
		credential_keys: [],
		status: row.status,
		last_test_at: row.last_test_at,
		last_test_ok: row.last_test_ok === null ? null : row.last_test_ok === 1,
		last_test_error: row.last_test_error,
		installed_at: row.installed_at,
		allowed_actions: row.allowed_actions === undefined ? undefined : parseJson<string[] | null>(row.allowed_actions, null),
	};
}

const INSTALL_SELECT = `
  SELECT p.*,
         wp.id              AS workspace_product_id,
         wp.credentials     AS credentials,
         wp.settings        AS settings,
         wp.status          AS status,
         wp.last_test_at    AS last_test_at,
         wp.last_test_ok    AS last_test_ok,
         wp.last_test_error AS last_test_error,
         wp.installed_at    AS installed_at
  FROM workspace_products wp
  JOIN products p ON p.id = wp.product_id
`;

/**
 * Installed connectors for a workspace. Credential VALUES are never returned —
 * only the list of keys that already hold a secret.
 */
export async function findWorkspaceProducts(
	db: D1Database,
	workspaceId: string,
	credentialsSecret?: string,
): Promise<PublicWorkspaceProduct[]> {
	const result = await db
		.prepare(`${INSTALL_SELECT} WHERE wp.workspace_id = ? ORDER BY p.name ASC`)
		.bind(workspaceId)
		.all<InstalledJoinRow>();

	const rows = result.results ?? [];
	const actions = await loadActionsByProduct(db, rows.map((r) => r.id));

	return Promise.all(
		rows.map(async (row) => {
			const product = rowToPublicWorkspaceProduct(row, actions.get(row.id) ?? [], workspaceId);
			if (credentialsSecret && row.credentials) {
				const stored = await decryptJson(row.credentials, credentialsSecret);
				product.credential_keys = Object.keys(stored).filter((key) => !!stored[key]);
			}
			return product;
		}),
	);
}

export async function findWorkspaceProductRow(
	db: D1Database,
	workspaceProductId: string,
): Promise<WorkspaceProductRow | null> {
	const result = await db
		.prepare("SELECT * FROM workspace_products WHERE id = ? LIMIT 1")
		.bind(workspaceProductId)
		.first<WorkspaceProductRow>();
	return result ?? null;
}

/** One install with its product definition and actions attached. */
export async function findWorkspaceProductDetail(
	db: D1Database,
	workspaceProductId: string,
	credentialsSecret?: string,
): Promise<PublicWorkspaceProduct | null> {
	const row = await db
		.prepare(`${INSTALL_SELECT} WHERE wp.id = ? LIMIT 1`)
		.bind(workspaceProductId)
		.first<InstalledJoinRow>();
	if (!row) return null;

	const actions = await findProductActions(db, row.id);
	const product = rowToPublicWorkspaceProduct(row, actions, row.workspace_id ?? undefined);

	if (credentialsSecret && row.credentials) {
		const stored = await decryptJson(row.credentials, credentialsSecret);
		product.credential_keys = Object.keys(stored).filter((key) => !!stored[key]);
	}

	return product;
}

export async function installProduct(db: D1Database, workspaceId: string, productId: string): Promise<string> {
	const existing = await db
		.prepare("SELECT id FROM workspace_products WHERE workspace_id = ? AND product_id = ? LIMIT 1")
		.bind(workspaceId, productId)
		.first<{ id: string }>();
	if (existing) return existing.id;

	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO workspace_products (id, workspace_id, product_id) VALUES (?, ?, ?)")
		.bind(id, workspaceId, productId)
		.run();
	return id;
}

export async function uninstallProduct(db: D1Database, workspaceProductId: string): Promise<void> {
	await db.prepare("DELETE FROM workspace_products WHERE id = ?").bind(workspaceProductId).run();
}

/**
 * Persists the values an install needs. Secret fields (per the product's
 * config_fields) are merged into the encrypted blob; the rest go to settings.
 * Keys absent from `values` keep their stored value; an empty string clears one.
 */
export async function saveWorkspaceProductConfig(
	db: D1Database,
	credentialsSecret: string,
	workspaceProductId: string,
	values: Record<string, string>,
	configFields: ConfigField[],
): Promise<void> {
	const row = await findWorkspaceProductRow(db, workspaceProductId);
	if (!row) throw new Error("Install not found");

	const secretKeys = new Set(configFields.filter((f) => f.secret).map((f) => f.key));

	const credentials = await decryptJson(row.credentials, credentialsSecret);
	const settings = parseJson<Record<string, string>>(row.settings, {});

	for (const [key, value] of Object.entries(values)) {
		const target = secretKeys.has(key) ? credentials : settings;
		if (value === "") delete target[key];
		else target[key] = value;
	}

	const encrypted = Object.keys(credentials).length > 0 ? await encryptJson(credentials, credentialsSecret) : null;

	await db
		.prepare("UPDATE workspace_products SET credentials = ?, settings = ?, updated_at = unixepoch() WHERE id = ?")
		.bind(encrypted, JSON.stringify(settings), workspaceProductId)
		.run();
}

export async function setWorkspaceProductStatus(
	db: D1Database,
	workspaceProductId: string,
	status: "enabled" | "disabled",
): Promise<void> {
	await db
		.prepare("UPDATE workspace_products SET status = ?, updated_at = unixepoch() WHERE id = ?")
		.bind(status, workspaceProductId)
		.run();
}

export async function recordWorkspaceProductTest(
	db: D1Database,
	workspaceProductId: string,
	ok: boolean,
	error: string | null,
): Promise<void> {
	await db
		.prepare(
			"UPDATE workspace_products SET last_test_at = unixepoch(), last_test_ok = ?, last_test_error = ?, updated_at = unixepoch() WHERE id = ?",
		)
		.bind(ok ? 1 : 0, error, workspaceProductId)
		.run();
}

/** Decrypts the credential bag for one install — called only at execution time. */
export async function loadInstallCredentials(
	db: D1Database,
	credentialsSecret: string,
	workspaceProductId: string,
): Promise<Record<string, string>> {
	const row = await findWorkspaceProductRow(db, workspaceProductId);
	if (!row) return {};
	return decryptJson(row.credentials, credentialsSecret);
}

// ─── Agent tools ──────────────────────────────────────────────────────────────

/**
 * Tools assigned to one agent. Disabled installs are excluded so turning a
 * connector off immediately removes it from every agent's prompt.
 */
export async function findAgentTools(db: D1Database, agentId: string): Promise<PublicWorkspaceProduct[]> {
	const result = await db
		.prepare(
			`SELECT p.*,
              wp.id              AS workspace_product_id,
              wp.credentials     AS credentials,
              wp.settings        AS settings,
              wp.status          AS status,
              wp.last_test_at    AS last_test_at,
              wp.last_test_ok    AS last_test_ok,
              wp.last_test_error AS last_test_error,
              wp.installed_at    AS installed_at,
              at.allowed_actions AS allowed_actions
       FROM agent_tools at
       JOIN workspace_products wp ON wp.id = at.workspace_product_id
       JOIN products p ON p.id = wp.product_id
       WHERE at.ai_agent_id = ? AND wp.status = 'enabled'
       ORDER BY p.name ASC`,
		)
		.bind(agentId)
		.all<InstalledJoinRow>();

	const rows = result.results ?? [];
	const actions = await loadActionsByProduct(db, rows.map((r) => r.id));

	return rows.map((row) => {
		const product = rowToPublicWorkspaceProduct(row, actions.get(row.id) ?? [], undefined);
		const allowed = product.allowed_actions;
		if (allowed && allowed.length > 0) {
			product.actions = product.actions.filter((action) => allowed.includes(action.name));
		}
		product.actions = product.actions.filter((action) => action.enabled);
		return product;
	});
}

export async function assignToolToAgent(
	db: D1Database,
	agentId: string,
	workspaceProductId: string,
	allowedActions: string[] | null = null,
): Promise<void> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			"INSERT OR IGNORE INTO agent_tools (id, ai_agent_id, workspace_product_id, allowed_actions) VALUES (?, ?, ?, ?)",
		)
		.bind(id, agentId, workspaceProductId, allowedActions ? JSON.stringify(allowedActions) : null)
		.run();
}

export async function updateAgentToolActions(
	db: D1Database,
	agentId: string,
	workspaceProductId: string,
	allowedActions: string[] | null,
): Promise<void> {
	await db
		.prepare("UPDATE agent_tools SET allowed_actions = ? WHERE ai_agent_id = ? AND workspace_product_id = ?")
		.bind(allowedActions && allowedActions.length > 0 ? JSON.stringify(allowedActions) : null, agentId, workspaceProductId)
		.run();
}

export async function removeToolFromAgent(db: D1Database, agentId: string, workspaceProductId: string): Promise<void> {
	await db
		.prepare("DELETE FROM agent_tools WHERE ai_agent_id = ? AND workspace_product_id = ?")
		.bind(agentId, workspaceProductId)
		.run();
}

// ─── Tool call audit log ──────────────────────────────────────────────────────

export interface LogToolCallInput {
	workspaceId: string;
	workspaceProductId: string | null;
	productActionId: string | null;
	aiAgentId?: string | null;
	ticketId?: string | null;
	triggeredBy: "agent" | "user";
	userId?: string | null;
	actionId: string;
	method: string | null;
	url: string | null;
	requestParams: Record<string, unknown> | null;
	statusCode: number | null;
	ok: boolean;
	durationMs: number | null;
	error: string | null;
	responsePreview: string | null;
}

export async function logToolCall(db: D1Database, input: LogToolCallInput): Promise<void> {
	await db
		.prepare(
			`INSERT INTO tool_call_logs
        (id, workspace_id, workspace_product_id, product_action_id, ai_agent_id, ticket_id,
         triggered_by, user_id, action_id, method, url, request_params, status_code, ok,
         duration_ms, error, response_preview)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			crypto.randomUUID(),
			input.workspaceId,
			input.workspaceProductId,
			input.productActionId,
			input.aiAgentId ?? null,
			input.ticketId ?? null,
			input.triggeredBy,
			input.userId ?? null,
			input.actionId,
			input.method,
			input.url,
			input.requestParams ? JSON.stringify(input.requestParams).slice(0, 4_000) : null,
			input.statusCode,
			input.ok ? 1 : 0,
			input.durationMs,
			input.error ? input.error.slice(0, 1_000) : null,
			input.responsePreview ? input.responsePreview.slice(0, 2_000) : null,
		)
		.run();
}

export async function findToolCallLogs(
	db: D1Database,
	workspaceId: string,
	options: { workspaceProductId?: string | null; ticketId?: string | null; limit?: number } = {},
): Promise<ToolCallLogRow[]> {
	const filters: string[] = ["workspace_id = ?"];
	const values: unknown[] = [workspaceId];

	if (options.workspaceProductId) {
		filters.push("workspace_product_id = ?");
		values.push(options.workspaceProductId);
	}
	if (options.ticketId) {
		filters.push("ticket_id = ?");
		values.push(options.ticketId);
	}

	const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
	const result = await db
		.prepare(`SELECT * FROM tool_call_logs WHERE ${filters.join(" AND ")} ORDER BY created_at DESC LIMIT ?`)
		.bind(...values, limit)
		.all<ToolCallLogRow>();

	return result.results ?? [];
}
