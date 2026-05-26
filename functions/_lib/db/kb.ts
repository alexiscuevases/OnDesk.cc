import type { KbCategoryRow, KbArticleRow, PublicKbArticle, KbVisibility, KbStatus } from "../types/kb";

// ─── Categories ───────────────────────────────────────────────────────────────

export async function findKbCategoriesByWorkspace(db: D1Database, workspaceId: string): Promise<KbCategoryRow[]> {
	const result = await db
		.prepare("SELECT * FROM kb_categories WHERE workspace_id = ? ORDER BY display_order ASC, name ASC")
		.bind(workspaceId)
		.all<KbCategoryRow>();
	return result.results ?? [];
}

export async function findKbCategoryById(db: D1Database, id: string): Promise<KbCategoryRow | null> {
	const result = await db.prepare("SELECT * FROM kb_categories WHERE id = ? LIMIT 1").bind(id).first<KbCategoryRow>();
	return result ?? null;
}

export async function createKbCategory(
	db: D1Database,
	workspaceId: string,
	data: { name: string; description?: string | null; display_order?: number },
): Promise<KbCategoryRow> {
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO kb_categories (id, workspace_id, name, description, display_order) VALUES (?, ?, ?, ?, ?)")
		.bind(id, workspaceId, data.name, data.description ?? null, data.display_order ?? 0)
		.run();
	return (await findKbCategoryById(db, id))!;
}

export async function updateKbCategory(
	db: D1Database,
	id: string,
	data: { name?: string; description?: string | null; display_order?: number },
): Promise<void> {
	const fields: string[] = [];
	const values: (string | number | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.display_order !== undefined) {
		fields.push("display_order = ?");
		values.push(data.display_order);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(id);
	await db.prepare(`UPDATE kb_categories SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
}

export async function deleteKbCategory(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM kb_categories WHERE id = ?").bind(id).run();
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export function rowToPublicArticle(row: KbArticleRow & { category_name?: string | null }): PublicKbArticle {
	let tags: string[] = [];
	try {
		const parsed = JSON.parse(row.tags);
		if (Array.isArray(parsed)) tags = parsed.filter((t) => typeof t === "string");
	} catch {
		// ignore
	}
	return {
		id: row.id,
		workspace_id: row.workspace_id,
		category_id: row.category_id,
		category_name: row.category_name ?? null,
		title: row.title,
		slug: row.slug,
		content: row.content,
		excerpt: row.excerpt,
		tags,
		visibility: row.visibility,
		status: row.status,
		view_count: row.view_count,
		created_by: row.created_by,
		published_at: row.published_at,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

export async function findKbArticlesByWorkspace(db: D1Database, workspaceId: string): Promise<PublicKbArticle[]> {
	const result = await db
		.prepare(
			`SELECT a.*, c.name AS category_name FROM kb_articles a
			 LEFT JOIN kb_categories c ON c.id = a.category_id
			 WHERE a.workspace_id = ? ORDER BY a.updated_at DESC`,
		)
		.bind(workspaceId)
		.all<KbArticleRow & { category_name: string | null }>();
	return (result.results ?? []).map(rowToPublicArticle);
}

export async function findKbArticleById(db: D1Database, id: string): Promise<KbArticleRow | null> {
	const result = await db.prepare("SELECT * FROM kb_articles WHERE id = ? LIMIT 1").bind(id).first<KbArticleRow>();
	return result ?? null;
}

export async function findKbArticleWithCategory(db: D1Database, id: string): Promise<PublicKbArticle | null> {
	const result = await db
		.prepare(
			`SELECT a.*, c.name AS category_name FROM kb_articles a
			 LEFT JOIN kb_categories c ON c.id = a.category_id
			 WHERE a.id = ? LIMIT 1`,
		)
		.bind(id)
		.first<KbArticleRow & { category_name: string | null }>();
	return result ? rowToPublicArticle(result) : null;
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
}

export async function ensureUniqueSlug(db: D1Database, workspaceId: string, base: string): Promise<string> {
	const baseSlug = slugify(base) || crypto.randomUUID().slice(0, 8);
	let candidate = baseSlug;
	let i = 1;
	while (true) {
		const existing = await db
			.prepare("SELECT id FROM kb_articles WHERE workspace_id = ? AND slug = ? LIMIT 1")
			.bind(workspaceId, candidate)
			.first<{ id: string }>();
		if (!existing) return candidate;
		i++;
		candidate = `${baseSlug}-${i}`;
		if (i > 100) return `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
	}
}

export interface CreateKbArticleInput {
	category_id?: string | null;
	title: string;
	content: string;
	excerpt?: string | null;
	tags?: string[];
	visibility?: KbVisibility;
	status?: KbStatus;
}

export async function createKbArticle(
	db: D1Database,
	workspaceId: string,
	userId: string,
	data: CreateKbArticleInput,
): Promise<KbArticleRow> {
	const id = crypto.randomUUID();
	const slug = await ensureUniqueSlug(db, workspaceId, data.title);
	const status = data.status ?? "draft";
	const publishedAt = status === "published" ? Math.floor(Date.now() / 1000) : null;
	await db
		.prepare(
			`INSERT INTO kb_articles (id, workspace_id, category_id, title, slug, content, excerpt, tags, visibility, status, created_by, published_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			workspaceId,
			data.category_id ?? null,
			data.title,
			slug,
			data.content,
			data.excerpt ?? null,
			JSON.stringify(data.tags ?? []),
			data.visibility ?? "internal",
			status,
			userId,
			publishedAt,
		)
		.run();
	return (await findKbArticleById(db, id))!;
}

export interface UpdateKbArticleInput {
	category_id?: string | null;
	title?: string;
	content?: string;
	excerpt?: string | null;
	tags?: string[];
	visibility?: KbVisibility;
	status?: KbStatus;
}

export async function updateKbArticle(db: D1Database, id: string, data: UpdateKbArticleInput): Promise<void> {
	const fields: string[] = [];
	const values: (string | number | null)[] = [];
	if (data.category_id !== undefined) {
		fields.push("category_id = ?");
		values.push(data.category_id);
	}
	if (data.title !== undefined) {
		fields.push("title = ?");
		values.push(data.title);
	}
	if (data.content !== undefined) {
		fields.push("content = ?");
		values.push(data.content);
	}
	if (data.excerpt !== undefined) {
		fields.push("excerpt = ?");
		values.push(data.excerpt);
	}
	if (data.tags !== undefined) {
		fields.push("tags = ?");
		values.push(JSON.stringify(data.tags));
	}
	if (data.visibility !== undefined) {
		fields.push("visibility = ?");
		values.push(data.visibility);
	}
	if (data.status !== undefined) {
		fields.push("status = ?");
		values.push(data.status);
		if (data.status === "published") {
			fields.push("published_at = COALESCE(published_at, unixepoch())");
		}
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(id);
	await db.prepare(`UPDATE kb_articles SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
}

export async function deleteKbArticle(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM kb_articles WHERE id = ?").bind(id).run();
}

export async function setArticleVectorId(db: D1Database, id: string, vectorId: string | null): Promise<void> {
	await db.prepare("UPDATE kb_articles SET vector_id = ? WHERE id = ?").bind(vectorId, id).run();
}

export async function incrementArticleViewCount(db: D1Database, id: string): Promise<void> {
	await db.prepare("UPDATE kb_articles SET view_count = view_count + 1 WHERE id = ?").bind(id).run();
}

// ─── AI agent ↔ KB category bindings ──────────────────────────────────────────

export async function findCategoryIdsForAgent(db: D1Database, agentId: string): Promise<string[]> {
	const result = await db
		.prepare("SELECT category_id FROM ai_agent_kb_categories WHERE ai_agent_id = ?")
		.bind(agentId)
		.all<{ category_id: string }>();
	return (result.results ?? []).map((r) => r.category_id);
}

export async function setAgentKbCategories(db: D1Database, agentId: string, categoryIds: string[]): Promise<void> {
	await db.prepare("DELETE FROM ai_agent_kb_categories WHERE ai_agent_id = ?").bind(agentId).run();
	for (const categoryId of categoryIds) {
		await db
			.prepare("INSERT INTO ai_agent_kb_categories (id, ai_agent_id, category_id) VALUES (?, ?, ?)")
			.bind(crypto.randomUUID(), agentId, categoryId)
			.run();
	}
}
