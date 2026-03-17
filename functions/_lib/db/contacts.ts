import type { ContactRow, PublicContact } from "../types";

// ─── Contacts ────────────────────────────────────────────────────────────────

export async function findContactsByWorkspace(db: D1Database, workspaceId: string): Promise<PublicContact[]> {
	const result = await db
		.prepare("SELECT id, workspace_id, company_id, name, email, phone, logo_url, created_at FROM contacts WHERE workspace_id = ? ORDER BY name ASC")
		.bind(workspaceId)
		.all<PublicContact>();
	return result.results ?? [];
}

export async function findContactById(db: D1Database, contactId: string): Promise<ContactRow | null> {
	const result = await db.prepare("SELECT * FROM contacts WHERE id = ? LIMIT 1").bind(contactId).first<ContactRow>();
	return result ?? null;
}

export async function findOrCreateContact(
	db: D1Database,
	workspaceId: string,
	data: { name: string; email: string; phone?: string; company_id?: string },
): Promise<ContactRow> {
	const existing = await db
		.prepare("SELECT * FROM contacts WHERE workspace_id = ? AND email = ? LIMIT 1")
		.bind(workspaceId, data.email.toLowerCase())
		.first<ContactRow>();
	if (existing) return existing;
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO contacts (id, workspace_id, company_id, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)")
		.bind(id, workspaceId, data.company_id ?? null, data.name, data.email.toLowerCase(), data.phone ?? null)
		.run();
	return (await findContactById(db, id))!;
}

export async function updateContact(db: D1Database, contactId: string, data: { name?: string; phone?: string; company_id?: string | null }): Promise<void> {
	const fields: string[] = [];
	const values: (string | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.phone !== undefined) {
		fields.push("phone = ?");
		values.push(data.phone);
	}
	if (data.company_id !== undefined) {
		fields.push("company_id = ?");
		values.push(data.company_id);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(contactId);
	await db
		.prepare(`UPDATE contacts SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteContact(db: D1Database, contactId: string): Promise<void> {
	await db.prepare("DELETE FROM contacts WHERE id = ?").bind(contactId).run();
}
