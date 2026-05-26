export interface SecuritySettings {
	workspace_id: string;
	require_2fa: boolean;
	strong_password: boolean;
	ip_allowlist_enabled: boolean;
	audit_log_enabled: boolean;
	updated_at: number;
}

export interface IpAllowlistEntry {
	id: string;
	workspace_id: string;
	cidr: string;
	label: string | null;
	created_by: string;
	created_at: number;
}

export interface AuditLogEntry {
	id: string;
	workspace_id: string;
	actor_id: string | null;
	actor_email: string | null;
	action: string;
	target: string | null;
	ip: string | null;
	metadata: string | null;
	created_at: number;
}

const API_BASE = "/api/security";

async function jsonOrThrow<T>(res: Response, fallback: string): Promise<T> {
	if (!res.ok) {
		const err = (await res.json().catch(() => ({ error: fallback }))) as { error?: string };
		throw new Error(err.error ?? fallback);
	}
	return res.json() as Promise<T>;
}

export async function apiGetSecuritySettings(workspaceId: string): Promise<SecuritySettings> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
	const data = await jsonOrThrow<{ settings: SecuritySettings }>(res, "Failed to load security settings");
	return data.settings;
}

export async function apiUpdateSecuritySettings(
	workspaceId: string,
	patch: Partial<Pick<SecuritySettings, "require_2fa" | "strong_password" | "ip_allowlist_enabled" | "audit_log_enabled">>,
): Promise<SecuritySettings> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(patch),
	});
	const data = await jsonOrThrow<{ settings: SecuritySettings }>(res, "Failed to update security settings");
	return data.settings;
}

export async function apiListIpAllowlist(workspaceId: string): Promise<IpAllowlistEntry[]> {
	const res = await fetch(`${API_BASE}/ip-allowlist?workspace_id=${workspaceId}`, { credentials: "include" });
	const data = await jsonOrThrow<{ entries: IpAllowlistEntry[] }>(res, "Failed to load allowlist");
	return data.entries;
}

export async function apiAddIpAllowlistEntry(
	workspaceId: string,
	input: { cidr: string; label?: string },
): Promise<IpAllowlistEntry> {
	const res = await fetch(`${API_BASE}/ip-allowlist?workspace_id=${workspaceId}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	const data = await jsonOrThrow<{ entry: IpAllowlistEntry }>(res, "Failed to add entry");
	return data.entry;
}

export async function apiDeleteIpAllowlistEntry(workspaceId: string, id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/ip-allowlist/${id}?workspace_id=${workspaceId}`, {
		method: "DELETE",
		credentials: "include",
	});
	await jsonOrThrow<{ ok: true }>(res, "Failed to remove entry");
}

export async function apiListAuditLog(
	workspaceId: string,
	opts: { limit?: number; offset?: number } = {},
): Promise<{ entries: AuditLogEntry[]; total: number }> {
	const params = new URLSearchParams({ workspace_id: workspaceId });
	if (opts.limit !== undefined) params.set("limit", String(opts.limit));
	if (opts.offset !== undefined) params.set("offset", String(opts.offset));
	const res = await fetch(`${API_BASE}/audit-log?${params}`, { credentials: "include" });
	return jsonOrThrow<{ entries: AuditLogEntry[]; total: number }>(res, "Failed to load audit log");
}
