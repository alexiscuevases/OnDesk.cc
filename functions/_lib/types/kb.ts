export type KbVisibility = "internal" | "public";
export type KbStatus = "draft" | "published";

export interface KbCategoryRow {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	display_order: number;
	created_at: number;
	updated_at: number;
}

export interface KbArticleRow {
	id: string;
	workspace_id: string;
	category_id: string | null;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	tags: string; // JSON
	visibility: KbVisibility;
	status: KbStatus;
	vector_id: string | null;
	view_count: number;
	created_by: string;
	published_at: number | null;
	created_at: number;
	updated_at: number;
}

export interface PublicKbArticle {
	id: string;
	workspace_id: string;
	category_id: string | null;
	category_name?: string | null;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	tags: string[];
	visibility: KbVisibility;
	status: KbStatus;
	view_count: number;
	created_by: string;
	published_at: number | null;
	created_at: number;
	updated_at: number;
}
