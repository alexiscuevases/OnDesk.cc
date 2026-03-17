import type { SignatureRow, PublicSignature } from "../types";

// ─── Signatures ───────────────────────────────────────────────────────────────

export async function findSignaturesByUser(db: D1Database, userId: string): Promise<PublicSignature[]> {
	const result = await db
		.prepare("SELECT id, created_by, workspace_id, name, content, is_default, created_at FROM signatures WHERE created_by = ? ORDER BY name ASC")
		.bind(userId)
		.all<SignatureRow>();
	return (result.results ?? []).map(toPublicSignature);
}

export async function findSignatureById(db: D1Database, signatureId: string): Promise<SignatureRow | null> {
	const result = await db.prepare("SELECT * FROM signatures WHERE id = ? LIMIT 1").bind(signatureId).first<SignatureRow>();
	return result ?? null;
}

export async function createSignature(
	db: D1Database,
	userId: string,
	workspaceId: string,
	data: { name: string; content: string; is_default?: boolean },
): Promise<PublicSignature> {
	const id = crypto.randomUUID();
	const isDefault = data.is_default ? 1 : 0;
	if (isDefault) {
		await db.prepare("UPDATE signatures SET is_default = 0 WHERE created_by = ?").bind(userId).run();
	}
	await db
		.prepare("INSERT INTO signatures (id, created_by, workspace_id, name, content, is_default) VALUES (?, ?, ?, ?, ?, ?)")
		.bind(id, userId, workspaceId, data.name, data.content, isDefault)
		.run();
	return toPublicSignature((await findSignatureById(db, id))!);
}

export async function updateSignature(
	db: D1Database,
	signatureId: string,
	userId: string,
	data: { name?: string; content?: string; is_default?: boolean },
): Promise<void> {
	if (data.is_default) {
		await db.prepare("UPDATE signatures SET is_default = 0 WHERE created_by = ?").bind(userId).run();
	}
	const fields: string[] = [];
	const values: (string | number | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.content !== undefined) {
		fields.push("content = ?");
		values.push(data.content);
	}
	if (data.is_default !== undefined) {
		fields.push("is_default = ?");
		values.push(data.is_default ? 1 : 0);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(signatureId);
	await db
		.prepare(`UPDATE signatures SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteSignature(db: D1Database, signatureId: string): Promise<void> {
	await db.prepare("DELETE FROM signatures WHERE id = ?").bind(signatureId).run();
}

function toPublicSignature(row: SignatureRow): PublicSignature {
	return {
		id: row.id,
		created_by: row.created_by,
		workspace_id: row.workspace_id,
		name: row.name,
		content: row.content,
		is_default: row.is_default === 1,
		created_at: row.created_at,
	};
}
