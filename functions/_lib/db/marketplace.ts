import type { ProductRow, PublicProduct, PublicWorkspaceProduct } from "../types";

// ─── Marketplace & Tools ──────────────────────────────────────────────────

export async function findAllPublicProducts(db: D1Database): Promise<PublicProduct[]> {
	const result = await db.prepare("SELECT * FROM products WHERE is_public = 1 ORDER BY name ASC").all<ProductRow>();
	return (result.results ?? []).map((r) => ({
		id: r.id,
		name: r.name,
		description: r.description,
		logo_url: r.logo_url,
		auth_type: r.auth_type,
		actions: JSON.parse(r.actions),
	}));
}

export async function findProductById(db: D1Database, productId: string): Promise<ProductRow | null> {
	const result = await db.prepare("SELECT * FROM products WHERE id = ? LIMIT 1").bind(productId).first<ProductRow>();
	return result ?? null;
}

export async function findWorkspaceProducts(db: D1Database, workspaceId: string): Promise<PublicWorkspaceProduct[]> {
	const result = await db
		.prepare(
			`
      SELECT p.*, wp.id as workspace_product_id, wp.configuration, wp.status, wp.installed_at
      FROM workspace_products wp
      JOIN products p ON p.id = wp.product_id
      WHERE wp.workspace_id = ?
      ORDER BY p.name ASC
    `,
		)
		.bind(workspaceId)
		.all<ProductRow & { workspace_product_id: string; configuration: string | null; status: string; installed_at: number }>();

	return (result.results ?? []).map((r) => ({
		id: r.id,
		name: r.name,
		description: r.description,
		logo_url: r.logo_url,
		auth_type: r.auth_type,
		actions: JSON.parse(r.actions),
		workspace_product_id: r.workspace_product_id,
		configuration: r.configuration ? JSON.parse(r.configuration) : null,
		status: r.status,
		installed_at: r.installed_at,
	}));
}

export async function installProduct(db: D1Database, workspaceId: string, productId: string): Promise<void> {
	const id = crypto.randomUUID();
	await db.prepare("INSERT INTO workspace_products (id, workspace_id, product_id) VALUES (?, ?, ?)").bind(id, workspaceId, productId).run();
}

export async function updateWorkspaceProductConfig(db: D1Database, workspaceProductId: string, config: Record<string, any>): Promise<void> {
	await db
		.prepare("UPDATE workspace_products SET configuration = ?, updated_at = unixepoch() WHERE id = ?")
		.bind(JSON.stringify(config), workspaceProductId)
		.run();
}

export async function findAgentTools(db: D1Database, agentId: string): Promise<PublicWorkspaceProduct[]> {
	const result = await db
		.prepare(
			`
      SELECT p.*, wp.id as workspace_product_id, wp.configuration, wp.status, wp.installed_at
      FROM agent_tools at
      JOIN workspace_products wp ON wp.id = at.workspace_product_id
      JOIN products p ON p.id = wp.product_id
      WHERE at.ai_agent_id = ?
    `,
		)
		.bind(agentId)
		.all<ProductRow & { workspace_product_id: string; configuration: string | null; status: string; installed_at: number }>();

	return (result.results ?? []).map((r) => ({
		id: r.id,
		name: r.name,
		description: r.description,
		logo_url: r.logo_url,
		auth_type: r.auth_type,
		actions: JSON.parse(r.actions),
		workspace_product_id: r.workspace_product_id,
		configuration: r.configuration ? JSON.parse(r.configuration) : null,
		status: r.status,
		installed_at: r.installed_at,
	}));
}

export async function assignToolToAgent(db: D1Database, agentId: string, workspaceProductId: string): Promise<void> {
	const id = crypto.randomUUID();
	await db.prepare("INSERT OR IGNORE INTO agent_tools (id, ai_agent_id, workspace_product_id) VALUES (?, ?, ?)").bind(id, agentId, workspaceProductId).run();
}

export async function removeToolFromAgent(db: D1Database, agentId: string, workspaceProductId: string): Promise<void> {
	await db.prepare("DELETE FROM agent_tools WHERE ai_agent_id = ? AND workspace_product_id = ?").bind(agentId, workspaceProductId).run();
}
