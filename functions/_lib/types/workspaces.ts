export interface WorkspaceRow {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	logo_url: string | null;
	workspace_prompt: string | null;
	created_by: string;
	created_at: number;
	updated_at: number;
}

export interface WorkspaceMemberRow {
	id: string;
	workspace_id: string;
	user_id: string;
	role: string;
	joined_at: number;
}

export interface PublicWorkspace {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	logo_url: string | null;
	workspace_prompt: string | null;
	role: string;
	created_at: number;
}
