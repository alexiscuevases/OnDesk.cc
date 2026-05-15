export interface MailboxIntegrationRow {
	id: string;
	workspace_id: string;
	email: string;
	provider: "microsoft" | "google";
	provider_user_id: string;
	access_token: string;
	refresh_token: string;
	token_expires_at: number;
	watch_id: string | null;
	watch_expires_at: number | null;
	webhook_secret: string;
	last_history_id: string | null;
	created_at: number;
}

export interface PublicMailboxIntegration {
	id: string;
	workspace_id: string;
	email: string;
	provider: "microsoft" | "google";
	provider_user_id: string;
	watch_id: string | null;
	watch_expires_at: number | null;
	last_history_id: string | null;
	created_at: number;
}
