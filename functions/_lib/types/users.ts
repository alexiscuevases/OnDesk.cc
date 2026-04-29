export interface UserRow {
	id: string;
	name: string;
	email: string;
	password_hash: string | null;
	role: string;
	logo_url: string | null;
	created_at: number;
	updated_at: number;
}

export type OAuthProvider = "google" | "microsoft";

export interface UserIdentityRow {
	id: string;
	user_id: string;
	provider: OAuthProvider;
	provider_user_id: string;
	email: string;
	created_at: number;
}

export interface PublicUser {
	id: string;
	name: string;
	email: string;
	role: string;
	logo_url: string | null;
}
