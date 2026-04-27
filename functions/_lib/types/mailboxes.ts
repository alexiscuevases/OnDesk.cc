export interface MailboxIntegrationRow {
	id: string;
	workspace_id: string;
	email: string;
	provider: "microsoft" | "google";
	ms_user_id: string;
	access_token: string;
	refresh_token: string;
	token_expires_at: number;
	subscription_id: string | null;
	subscription_expires_at: number | null;
	client_state_secret: string;
	last_history_id: string | null;
	created_at: number;
}

export interface PublicMailboxIntegration {
	id: string;
	workspace_id: string;
	email: string;
	provider: "microsoft" | "google";
	ms_user_id: string;
	subscription_id: string | null;
	subscription_expires_at: number | null;
	last_history_id: string | null;
	created_at: number;
}
