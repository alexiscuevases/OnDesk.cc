export interface SignatureRow {
	id: string;
	created_by: string;
	workspace_id: string;
	name: string;
	content: string;
	is_default: number;
	created_at: number;
	updated_at: number;
}

export interface PublicSignature {
	id: string;
	created_by: string;
	workspace_id: string;
	name: string;
	content: string;
	is_default: boolean;
	created_at: number;
}
