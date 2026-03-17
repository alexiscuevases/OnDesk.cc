export interface ProductRow {
	id: string;
	name: string;
	description: string | null;
	logo_url: string | null;
	auth_type: string;
	actions: string;
	is_public: number;
	created_by: string;
	created_at: number;
	updated_at: number;
}

export interface WorkspaceProductRow {
	id: string;
	workspace_id: string;
	product_id: string;
	configuration: string | null;
	status: string;
	installed_at: number;
	updated_at: number;
}

export interface AgentToolRow {
	id: string;
	ai_agent_id: string;
	workspace_product_id: string;
	created_at: number;
}

export interface PublicProduct {
	id: string;
	name: string;
	description: string | null;
	logo_url: string | null;
	auth_type: string;
	actions: any[];
}

export interface PublicWorkspaceProduct extends PublicProduct {
	workspace_product_id: string;
	configuration: Record<string, any> | null;
	status: string;
	installed_at: number;
}
