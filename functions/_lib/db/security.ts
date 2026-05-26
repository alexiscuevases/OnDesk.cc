import type {
	SecuritySettingsRow,
	PublicSecuritySettings,
	IpAllowlistEntry,
	AuditLogEntry,
} from "../types";

function rowToPublic(row: SecuritySettingsRow): PublicSecuritySettings {
	return {
		workspace_id: row.workspace_id,
		require_2fa: row.require_2fa === 1,
		strong_password: row.strong_password === 1,
		ip_allowlist_enabled: row.ip_allowlist_enabled === 1,
		audit_log_enabled: row.audit_log_enabled === 1,
		updated_at: row.updated_at,
	};
}

export async function getSecuritySettings(
	db: D1Database,
	workspaceId: string,
): Promise<PublicSecuritySettings> {
	const row = await db
		.prepare(`SELECT * FROM workspace_security_settings WHERE workspace_id = ? LIMIT 1`)
		.bind(workspaceId)
		.first<SecuritySettingsRow>();
	if (row) return rowToPublic(row);
	return {
		workspace_id: workspaceId,
		require_2fa: false,
		strong_password: false,
		ip_allowlist_enabled: false,
		audit_log_enabled: true,
		updated_at: 0,
	};
}

export async function updateSecuritySettings(
	db: D1Database,
	workspaceId: string,
	patch: Partial<{
		require_2fa: boolean;
		strong_password: boolean;
		ip_allowlist_enabled: boolean;
		audit_log_enabled: boolean;
	}>,
): Promise<PublicSecuritySettings> {
	const current = await getSecuritySettings(db, workspaceId);
	const next = {
		require_2fa: (patch.require_2fa ?? current.require_2fa) ? 1 : 0,
		strong_password: (patch.strong_password ?? current.strong_password) ? 1 : 0,
		ip_allowlist_enabled: (patch.ip_allowlist_enabled ?? current.ip_allowlist_enabled) ? 1 : 0,
		audit_log_enabled: (patch.audit_log_enabled ?? current.audit_log_enabled) ? 1 : 0,
	};
	await db
		.prepare(
			`INSERT INTO workspace_security_settings
			 (workspace_id, require_2fa, strong_password, ip_allowlist_enabled, audit_log_enabled, updated_at)
			 VALUES (?, ?, ?, ?, ?, unixepoch())
			 ON CONFLICT(workspace_id) DO UPDATE SET
			   require_2fa = excluded.require_2fa,
			   strong_password = excluded.strong_password,
			   ip_allowlist_enabled = excluded.ip_allowlist_enabled,
			   audit_log_enabled = excluded.audit_log_enabled,
			   updated_at = unixepoch()`,
		)
		.bind(
			workspaceId,
			next.require_2fa,
			next.strong_password,
			next.ip_allowlist_enabled,
			next.audit_log_enabled,
		)
		.run();
	return (await getSecuritySettings(db, workspaceId))!;
}

// ─── IP Allowlist ─────────────────────────────────────────────────────────────

export async function listIpAllowlist(
	db: D1Database,
	workspaceId: string,
): Promise<IpAllowlistEntry[]> {
	const result = await db
		.prepare(
			`SELECT id, workspace_id, cidr, label, created_by, created_at
			 FROM workspace_ip_allowlist WHERE workspace_id = ? ORDER BY created_at DESC`,
		)
		.bind(workspaceId)
		.all<IpAllowlistEntry>();
	return result.results ?? [];
}

export async function addIpAllowlistEntry(
	db: D1Database,
	data: { workspace_id: string; cidr: string; label?: string | null; created_by: string },
): Promise<IpAllowlistEntry> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO workspace_ip_allowlist (id, workspace_id, cidr, label, created_by)
			 VALUES (?, ?, ?, ?, ?)`,
		)
		.bind(id, data.workspace_id, data.cidr, data.label ?? null, data.created_by)
		.run();
	const row = await db
		.prepare(`SELECT id, workspace_id, cidr, label, created_by, created_at FROM workspace_ip_allowlist WHERE id = ?`)
		.bind(id)
		.first<IpAllowlistEntry>();
	return row!;
}

export async function deleteIpAllowlistEntry(
	db: D1Database,
	workspaceId: string,
	id: string,
): Promise<IpAllowlistEntry | null> {
	const row = await db
		.prepare(`SELECT id, workspace_id, cidr, label, created_by, created_at FROM workspace_ip_allowlist WHERE id = ? AND workspace_id = ?`)
		.bind(id, workspaceId)
		.first<IpAllowlistEntry>();
	if (!row) return null;
	await db
		.prepare(`DELETE FROM workspace_ip_allowlist WHERE id = ? AND workspace_id = ?`)
		.bind(id, workspaceId)
		.run();
	return row;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

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
	const settings = await getSecuritySettings(db, data.workspace_id);
	if (!settings.audit_log_enabled) return;
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

// ─── IP matching ──────────────────────────────────────────────────────────────

function ipv4ToInt(ip: string): number | null {
	const parts = ip.split(".");
	if (parts.length !== 4) return null;
	let n = 0;
	for (const p of parts) {
		const v = Number(p);
		if (!Number.isInteger(v) || v < 0 || v > 255) return null;
		n = (n << 8) + v;
	}
	return n >>> 0;
}

export function ipMatchesCidr(ip: string, cidr: string): boolean {
	const [range, bitsRaw] = cidr.split("/");
	const bits = bitsRaw === undefined ? 32 : Number(bitsRaw);
	if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;
	const ipInt = ipv4ToInt(ip);
	const rangeInt = ipv4ToInt(range);
	if (ipInt === null || rangeInt === null) return false;
	if (bits === 0) return true;
	const mask = (0xffffffff << (32 - bits)) >>> 0;
	return (ipInt & mask) === (rangeInt & mask);
}

export function ipAllowed(ip: string, entries: IpAllowlistEntry[]): boolean {
	return entries.some((e) => ipMatchesCidr(ip, e.cidr));
}

// ─── Cross-workspace policy helpers (for login flow) ──────────────────────────

export interface UserPolicy {
	require_2fa: boolean;
	strong_password: boolean;
	enforcing_workspace_ids: string[];
	ip_enforcing_workspaces: { workspace_id: string; entries: IpAllowlistEntry[] }[];
}

export async function getPolicyForUser(db: D1Database, userId: string): Promise<UserPolicy> {
	const rows = await db
		.prepare(
			`SELECT s.workspace_id, s.require_2fa, s.strong_password, s.ip_allowlist_enabled
			 FROM workspace_security_settings s
			 JOIN workspace_members m ON m.workspace_id = s.workspace_id
			 WHERE m.user_id = ?`,
		)
		.bind(userId)
		.all<{ workspace_id: string; require_2fa: number; strong_password: number; ip_allowlist_enabled: number }>();

	const policy: UserPolicy = {
		require_2fa: false,
		strong_password: false,
		enforcing_workspace_ids: [],
		ip_enforcing_workspaces: [],
	};

	for (const r of rows.results ?? []) {
		if (r.require_2fa === 1) {
			policy.require_2fa = true;
			policy.enforcing_workspace_ids.push(r.workspace_id);
		}
		if (r.strong_password === 1) policy.strong_password = true;
		if (r.ip_allowlist_enabled === 1) {
			const entries = await listIpAllowlist(db, r.workspace_id);
			policy.ip_enforcing_workspaces.push({ workspace_id: r.workspace_id, entries });
		}
	}
	return policy;
}

/** Validate password against strong policy: ≥12 chars, mixed case, digit, and symbol. */
export function validateStrongPassword(password: string): string | null {
	if (password.length < 12) return "Password must be at least 12 characters";
	if (!/[a-z]/.test(password)) return "Password must include a lowercase letter";
	if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter";
	if (!/[0-9]/.test(password)) return "Password must include a digit";
	if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a symbol";
	return null;
}
