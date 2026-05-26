import { createWorkspaceScopedApi, apiFetch } from "@/lib/crud-api";

export interface KbCategory {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	display_order: number;
	created_at: number;
	updated_at: number;
}

export type KbVisibility = "internal" | "public";
export type KbStatus = "draft" | "published";

export interface KbArticle {
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

// ── Categories ───────────────────────────────────────────────────────────────

export interface CreateKbCategoryInput {
	workspace_id: string;
	name: string;
	description?: string | null;
	display_order?: number;
}
export interface UpdateKbCategoryInput {
	name?: string;
	description?: string | null;
	display_order?: number;
}

const _catApi = createWorkspaceScopedApi<KbCategory, CreateKbCategoryInput, UpdateKbCategoryInput>({
	basePath: "/api/kb/categories",
	listKey: "kb_categories",
	itemKey: "kb_category",
});

export const apiGetKbCategories = _catApi.getAll;
export const apiCreateKbCategory = _catApi.create;
export const apiUpdateKbCategory = (id: string, input: UpdateKbCategoryInput) => _catApi.update(id, input);
export const apiDeleteKbCategory = _catApi.delete;

// ── Articles ─────────────────────────────────────────────────────────────────

export interface CreateKbArticleInput {
	workspace_id: string;
	title: string;
	content: string;
	category_id?: string | null;
	excerpt?: string | null;
	tags?: string[];
	visibility?: KbVisibility;
	status?: KbStatus;
}
export interface UpdateKbArticleInput {
	title?: string;
	content?: string;
	category_id?: string | null;
	excerpt?: string | null;
	tags?: string[];
	visibility?: KbVisibility;
	status?: KbStatus;
}

const _artApi = createWorkspaceScopedApi<KbArticle, CreateKbArticleInput, UpdateKbArticleInput>({
	basePath: "/api/kb/articles",
	listKey: "kb_articles",
	itemKey: "kb_article",
});

export const apiGetKbArticles = _artApi.getAll;
export const apiGetKbArticle = _artApi.getById;
export const apiCreateKbArticle = _artApi.create;
export const apiUpdateKbArticle = (id: string, input: UpdateKbArticleInput) => _artApi.update(id, input);
export const apiDeleteKbArticle = _artApi.delete;

// touch — placeholder to avoid unused import error if not used elsewhere
export { apiFetch };
