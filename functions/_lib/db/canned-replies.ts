import type { CannedReplyRow, PublicCannedReply } from "../types";

// ─── Canned Replies ───────────────────────────────────────────────────────────

export async function findCannedRepliesByWorkspace(db: D1Database, workspaceId: string): Promise<PublicCannedReply[]> {
	const result = await db
		.prepare("SELECT id, workspace_id, name, content, shortcut, created_by, created_at FROM canned_replies WHERE workspace_id = ? ORDER BY name ASC")
		.bind(workspaceId)
		.all<PublicCannedReply>();
	return result.results ?? [];
}

export async function findCannedReplyById(db: D1Database, replyId: string): Promise<CannedReplyRow | null> {
	const result = await db.prepare("SELECT * FROM canned_replies WHERE id = ? LIMIT 1").bind(replyId).first<CannedReplyRow>();
	return result ?? null;
}

export async function createCannedReply(
	db: D1Database,
	workspaceId: string,
	userId: string,
	data: { name: string; content: string; shortcut?: string },
): Promise<CannedReplyRow> {
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO canned_replies (id, workspace_id, name, content, shortcut, created_by) VALUES (?, ?, ?, ?, ?, ?)")
		.bind(id, workspaceId, data.name, data.content, data.shortcut ?? null, userId)
		.run();
	return (await findCannedReplyById(db, id))!;
}

export async function updateCannedReply(db: D1Database, replyId: string, data: { name?: string; content?: string; shortcut?: string | null }): Promise<void> {
	const fields: string[] = [];
	const values: (string | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.content !== undefined) {
		fields.push("content = ?");
		values.push(data.content);
	}
	if (data.shortcut !== undefined) {
		fields.push("shortcut = ?");
		values.push(data.shortcut);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(replyId);
	await db
		.prepare(`UPDATE canned_replies SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteCannedReply(db: D1Database, replyId: string): Promise<void> {
	await db.prepare("DELETE FROM canned_replies WHERE id = ?").bind(replyId).run();
}
