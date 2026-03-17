export interface CompanyRow {
	id: string;
	workspace_id: string;
	name: string;
	domain: string | null;
	description: string | null;
	logo_url: string | null;
	created_at: number;
	updated_at: number;
}

export interface PublicCompany {
	id: string;
	workspace_id: string;
	name: string;
	domain: string | null;
	description: string | null;
	logo_url: string | null;
	created_at: number;
}
