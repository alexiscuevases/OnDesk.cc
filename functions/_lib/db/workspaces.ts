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

/**
 * The one column of `workspaces` that is Pulse's own.
 *
 * `name`, `description` and `logo_url` used to be settable here too. They are
 * mirrored from ondesk, so writing them produced a value that looked saved and
 * was reverted by the next sync — the Task A.1 bug, which reached production
 * once already. Narrowing the parameter is what stops it coming back: there is
 * no longer a way to express the mistake.
 */
export async function updateWorkspace(
	db: D1Database,
	workspaceId: string,
	data: { workspace_prompt?: string | null },
): Promise<void> {
	if (data.workspace_prompt === undefined) return;
	await db
		.prepare("UPDATE workspaces SET workspace_prompt = ?, updated_at = unixepoch() WHERE id = ?")
		.bind(data.workspace_prompt, workspaceId)
		.run();
}

// deleteWorkspace lived here. Deleting a workspace is a control-plane action: it
// ends a subscription and removes a tenant from four products at once, so it
// happens on ondesk and arrives as `workspace.deleted`. Locally it was a
// DELETE on a mirrored row whose cascade takes every ticket with it.

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
