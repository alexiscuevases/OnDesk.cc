export interface UserRow {
	id: string;
	name: string;
	email: string;
	password_hash: string;
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
