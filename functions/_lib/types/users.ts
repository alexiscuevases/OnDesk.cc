/**
 * A user as pulse sees them: a read-only mirror of the OnDesk record.
 *
 * Credentials, OAuth identities, 2FA state and lockout counters are gone —
 * they live in ondesk-db and were dropped from pulse-db by migration
 * 003_ondesk_sso.sql. Anything here is refreshed by the SSO callback or the
 * platform webhook, never written by product code.
 */
export interface UserRow {
	id: string;
	name: string;
	email: string;
	role: string;
	logo_url: string | null;
	created_at: number;
	updated_at: number;
}

export interface PublicUser {
	id: string;
	name: string;
	email: string;
	role: string;
	logo_url: string | null;
}
