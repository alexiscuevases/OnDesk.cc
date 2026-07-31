import type { UserRow, WorkspaceRow, PublicWorkspace } from "../types";

// ─── Workspace queries ────────────────────────────────────────────────────────

/**
 * The user's workspaces that currently hold a Pulse entitlement.
 *
 * The join against workspace_entitlements is the access gate: a cancelled
 * tenant keeps its mirrored rows and its ticket data, but stops appearing here.
 */
export async function findWorkspacesByUserId(db: D1Database, userId: string): Promise<PublicWorkspace[]> {
	const result = await db
		.prepare(
			`SELECT w.id, w.name, w.slug, w.description, w.logo_url, w.workspace_prompt, w.created_at, wm.role
       FROM workspaces w
       JOIN workspace_members wm      ON wm.workspace_id = w.id
       JOIN workspace_entitlements we ON we.workspace_id = w.id
       WHERE wm.user_id = ?
         AND we.status IN ('active', 'trialing', 'past_due')
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

export async function isWorkspaceMember(db: D1Database, workspaceId: string, userId: string): Promise<boolean> {
	const result = await db
		.prepare("SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1")
		.bind(workspaceId, userId)
		.first<{ id: string }>();
	return result !== null;
}

// createWorkspace lived here. Workspaces are created on ondesk and arrive by
// mirror — creating one locally would produce a workspace no other product can
// see, with an id ondesk has never heard of.

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

// Adding a member, changing a role and removing a member used to live here.
// `workspace_members` is a mirror of ondesk and only mirror.ts may write it, so
// those helpers could only ever produce a divergence that the next sync undid.
// The write side is ondesk's: PATCH/DELETE /api/workspaces/:id/members.
