import type { AuditLogEntry } from "../types";

/**
 * Product-level audit trail.
 *
 * The security *policy* — require_2fa, strong_password, the IP allowlist — moved
 * to OnDesk, because all three gate sign-in and sign-in no longer happens here.
 * What stays is the log of what people did inside pulse once they were let in.
 *
 * Platform events (sign-ins, role changes, billing) are recorded in OnDesk's own
 * audit log against the same workspace_id.
 */

export async function listAuditLog(
	db: D1Database,
	workspaceId: string,
	limit = 100,
	offset = 0,
): Promise<{ entries: AuditLogEntry[]; total: number }> {
	const totalRow = await db
		.prepare(`SELECT COUNT(*) AS c FROM audit_logs WHERE workspace_id = ?`)
		.bind(workspaceId)
		.first<{ c: number }>();
	const result = await db
		.prepare(
			`SELECT id, workspace_id, actor_id, actor_email, action, target, ip, metadata, created_at
			 FROM audit_logs WHERE workspace_id = ?
			 ORDER BY created_at DESC LIMIT ? OFFSET ?`,
		)
		.bind(workspaceId, limit, offset)
		.all<AuditLogEntry>();
	return { entries: result.results ?? [], total: totalRow?.c ?? 0 };
}

export async function writeAuditLog(
	db: D1Database,
	data: {
		workspace_id: string;
		actor_id?: string | null;
		actor_email?: string | null;
		action: string;
		target?: string | null;
		ip?: string | null;
		metadata?: Record<string, unknown> | null;
	},
): Promise<void> {
	// The toggle is owned by OnDesk and mirrored onto the workspace row. Reading
	// it here keeps the previous behaviour: a workspace that switched audit
	// logging off does not get it switched back on by the migration.
	const workspace = await db
		.prepare("SELECT audit_log_enabled FROM workspaces WHERE id = ? LIMIT 1")
		.bind(data.workspace_id)
		.first<{ audit_log_enabled: number }>();
	if (workspace && workspace.audit_log_enabled !== 1) return;

	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO audit_logs
			 (id, workspace_id, actor_id, actor_email, action, target, ip, metadata)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			data.workspace_id,
			data.actor_id ?? null,
			data.actor_email ?? null,
			data.action,
			data.target ?? null,
			data.ip ?? null,
			data.metadata ? JSON.stringify(data.metadata) : null,
		)
		.run();
}
