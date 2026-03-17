import type { UserRow, WorkspaceRow, PublicWorkspace } from "../types";

// ─── Workspace queries ────────────────────────────────────────────────────────

export async function findWorkspacesByUserId(db: D1Database, userId: string): Promise<PublicWorkspace[]> {
	const result = await db
		.prepare(
			`SELECT w.id, w.name, w.slug, w.description, w.logo_url, w.workspace_prompt, w.created_at, wm.role
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id
       WHERE wm.user_id = ?
       ORDER BY w.created_at ASC`,
		)
		.bind(userId)
		.all<PublicWorkspace>();
	return result.results ?? [];
}

export async function findWorkspaceBySlug(db: D1Database, slug: string): Promise<WorkspaceRow | null> {
	const result = await db.prepare("SELECT * FROM workspaces WHERE slug = ? LIMIT 1").bind(slug).first<WorkspaceRow>();
	return result ?? null;
}

export async function findWorkspaceById(db: D1Database, id: string): Promise<WorkspaceRow | null> {
	const result = await db.prepare("SELECT * FROM workspaces WHERE id = ? LIMIT 1").bind(id).first<WorkspaceRow>();
	return result ?? null;
}

export async function slugExists(db: D1Database, slug: string): Promise<boolean> {
	const result = await db.prepare("SELECT id FROM workspaces WHERE slug = ? LIMIT 1").bind(slug).first<{ id: string }>();
	return result !== null;
}

export async function isWorkspaceMember(db: D1Database, workspaceId: string, userId: string): Promise<boolean> {
	const result = await db
		.prepare("SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1")
		.bind(workspaceId, userId)
		.first<{ id: string }>();
	return result !== null;
}

export async function createWorkspace(
	db: D1Database,
	data: { name: string; slug: string; description?: string; logo_url?: string; workspace_prompt?: string },
	userId: string,
): Promise<WorkspaceRow> {
	const id = crypto.randomUUID();
	const memberId = crypto.randomUUID();
	await db
		.prepare("INSERT INTO workspaces (id, name, slug, description, logo_url, workspace_prompt, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)")
		.bind(id, data.name, data.slug, data.description ?? null, data.logo_url ?? null, data.workspace_prompt ?? null, userId)
		.run();
	// Add creator as owner
	await db.prepare("INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES (?, ?, ?, 'owner')").bind(memberId, id, userId).run();
	return (await findWorkspaceBySlug(db, data.slug))!;
}

export async function updateWorkspace(
	db: D1Database,
	workspaceId: string,
	data: { name?: string; description?: string; logo_url?: string; workspace_prompt?: string | null },
): Promise<void> {
	const fields: string[] = [];
	const values: (string | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.logo_url !== undefined) {
		fields.push("logo_url = ?");
		values.push(data.logo_url);
	}
	if (data.workspace_prompt !== undefined) {
		fields.push("workspace_prompt = ?");
		values.push(data.workspace_prompt);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(workspaceId);
	await db
		.prepare(`UPDATE workspaces SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteWorkspace(db: D1Database, workspaceId: string): Promise<void> {
	await db.prepare("DELETE FROM workspaces WHERE id = ?").bind(workspaceId).run();
}

export async function getWorkspaceMemberRole(db: D1Database, workspaceId: string, userId: string): Promise<string | null> {
	const result = await db
		.prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1")
		.bind(workspaceId, userId)
		.first<{ role: string }>();
	return result?.role ?? null;
}

// ─── Users (workspace members) ────────────────────────────────────────────────

export async function findWorkspaceMembers(db: D1Database, workspaceId: string): Promise<(UserRow & { workspace_role: string })[]> {
	const result = await db
		.prepare(
			`SELECT u.id, u.name, u.email, u.role, u.logo_url, u.created_at, u.updated_at, wm.role AS workspace_role
       FROM users u
       JOIN workspace_members wm ON wm.user_id = u.id
       WHERE wm.workspace_id = ?
       ORDER BY u.name ASC`,
		)
		.bind(workspaceId)
		.all<UserRow & { workspace_role: string }>();
	return result.results ?? [];
}

export async function updateWorkspaceMemberRole(db: D1Database, workspaceId: string, userId: string, role: string): Promise<void> {
	await db.prepare("UPDATE workspace_members SET role = ? WHERE workspace_id = ? AND user_id = ?").bind(role, workspaceId, userId).run();
}

export async function removeWorkspaceMember(db: D1Database, workspaceId: string, userId: string): Promise<void> {
	await db.prepare("DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?").bind(workspaceId, userId).run();
}

export async function addWorkspaceMember(db: D1Database, workspaceId: string, userId: string, role: string): Promise<void> {
	const id = crypto.randomUUID();
	await db.prepare("INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES (?, ?, ?, ?)").bind(id, workspaceId, userId, role).run();
}
