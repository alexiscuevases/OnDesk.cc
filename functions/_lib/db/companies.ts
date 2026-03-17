import type { CompanyRow, PublicCompany } from "../types";

// ─── Companies ────────────────────────────────────────────────────────────────

export async function findCompaniesByWorkspace(db: D1Database, workspaceId: string): Promise<PublicCompany[]> {
	const result = await db
		.prepare("SELECT id, workspace_id, name, domain, description, logo_url, created_at FROM companies WHERE workspace_id = ? ORDER BY name ASC")
		.bind(workspaceId)
		.all<PublicCompany>();
	return result.results ?? [];
}

export async function findCompanyById(db: D1Database, companyId: string): Promise<CompanyRow | null> {
	const result = await db.prepare("SELECT * FROM companies WHERE id = ? LIMIT 1").bind(companyId).first<CompanyRow>();
	return result ?? null;
}

export async function createCompany(
	db: D1Database,
	workspaceId: string,
	data: { name: string; domain?: string; description?: string; logo_url?: string },
): Promise<CompanyRow> {
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO companies (id, workspace_id, name, domain, description, logo_url) VALUES (?, ?, ?, ?, ?, ?)")
		.bind(id, workspaceId, data.name, data.domain ?? null, data.description ?? null, data.logo_url ?? null)
		.run();
	return (await findCompanyById(db, id))!;
}

export async function updateCompany(
	db: D1Database,
	companyId: string,
	data: { name?: string; domain?: string; description?: string; logo_url?: string | null },
): Promise<void> {
	const fields: string[] = [];
	const values: (string | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.domain !== undefined) {
		fields.push("domain = ?");
		values.push(data.domain);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.logo_url !== undefined) {
		fields.push("logo_url = ?");
		values.push(data.logo_url);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(companyId);
	await db
		.prepare(`UPDATE companies SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteCompany(db: D1Database, companyId: string): Promise<void> {
	await db.prepare("DELETE FROM companies WHERE id = ?").bind(companyId).run();
}
