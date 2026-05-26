export interface SecuritySettingsRow {
	workspace_id: string;
	require_2fa: number;
	strong_password: number;
	ip_allowlist_enabled: number;
	audit_log_enabled: number;
	updated_at: number;
}

export interface PublicSecuritySettings {
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
