export interface TeamRow {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	leader_id: string | null;
	logo_url: string | null;
	created_at: number;
	updated_at: number;
}

export interface PublicTeam {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	leader_id: string | null;
	logo_url: string | null;
	created_at: number;
}
