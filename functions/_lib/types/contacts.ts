export interface ContactRow {
	id: string;
	workspace_id: string;
	company_id: string | null;
	name: string;
	email: string;
	phone: string | null;
	logo_url: string | null;
	created_at: number;
	updated_at: number;
}

export interface PublicContact {
	id: string;
	workspace_id: string;
	company_id: string | null;
	name: string;
	email: string;
	phone: string | null;
	logo_url: string | null;
	created_at: number;
}
