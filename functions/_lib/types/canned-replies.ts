export interface CannedReplyRow {
	id: string;
	workspace_id: string;
	name: string;
	content: string;
	shortcut: string | null;
	created_by: string;
	created_at: number;
	updated_at: number;
}

export interface PublicCannedReply {
	id: string;
	workspace_id: string;
	name: string;
	content: string;
	shortcut: string | null;
	created_by: string;
	created_at: number;
}
