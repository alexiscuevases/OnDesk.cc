import type { WorkspaceInvitationRow, PublicInvitation } from "../types";

// ─── Workspace Invitations ────────────────────────────────────────────────────

export async function createInvitation(
	db: D1Database,
	workspaceId: string,
	email: string,
	role: string,
	invitedBy: string,
	token: string,
	ttlSeconds: number,
): Promise<WorkspaceInvitationRow> {
	const id = crypto.randomUUID();
	const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
	await db
		.prepare(
			`INSERT INTO workspace_invitations (id, workspace_id, email, role, invited_by, token, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(id, workspaceId, email.toLowerCase(), role, invitedBy, token, expiresAt)
		.run();
	return (await findInvitationById(db, id))!;
}

async function findInvitationById(db: D1Database, id: string): Promise<WorkspaceInvitationRow | null> {
	const result = await db.prepare("SELECT * FROM workspace_invitations WHERE id = ? LIMIT 1").bind(id).first<WorkspaceInvitationRow>();
	return result ?? null;
}

export async function findInvitationByToken(db: D1Database, token: string): Promise<WorkspaceInvitationRow | null> {
	const result = await db.prepare("SELECT * FROM workspace_invitations WHERE token = ? LIMIT 1").bind(token).first<WorkspaceInvitationRow>();
	return result ?? null;
}

export async function findPendingInvitationsByWorkspace(db: D1Database, workspaceId: string): Promise<PublicInvitation[]> {
	const result = await db
		.prepare(
			`SELECT id, workspace_id, email, role, status, expires_at, created_at
       FROM workspace_invitations
       WHERE workspace_id = ? AND status = 'pending'
       ORDER BY created_at DESC`,
		)
		.bind(workspaceId)
		.all<PublicInvitation>();
	return result.results ?? [];
}

export async function findPendingInvitationByEmail(db: D1Database, email: string): Promise<WorkspaceInvitationRow | null> {
	const result = await db
		.prepare("SELECT * FROM workspace_invitations WHERE email = ? AND status = 'pending' LIMIT 1")
		.bind(email.toLowerCase())
		.first<WorkspaceInvitationRow>();
	return result ?? null;
}

export async function updateInvitationStatus(db: D1Database, id: string, status: string): Promise<void> {
	await db.prepare("UPDATE workspace_invitations SET status = ? WHERE id = ?").bind(status, id).run();
}

export async function findPendingInvitationByWorkspaceAndEmail(db: D1Database, workspaceId: string, email: string): Promise<WorkspaceInvitationRow | null> {
	const result = await db
		.prepare("SELECT * FROM workspace_invitations WHERE workspace_id = ? AND email = ? AND status = 'pending' LIMIT 1")
		.bind(workspaceId, email.toLowerCase())
		.first<WorkspaceInvitationRow>();
	return result ?? null;
}
