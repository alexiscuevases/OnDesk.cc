import { jsonOk, jsonCreated, jsonError } from "../../../_lib/response";
import {
	findKbArticlesByWorkspace,
	createKbArticle,
	findKbArticleById,
	rowToPublicArticle,
	setArticleVectorId,
} from "../../../_lib/db";
import type { KbVisibility, KbStatus } from "../../../_lib/types";
import { withWorkspace } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import { upsertKbArticle } from "../../../_lib/vectorize";

const VISIBILITIES: KbVisibility[] = ["internal", "public"];
const STATUSES: KbStatus[] = ["draft", "published"];

// GET  /api/kb/articles?workspace_id=
// POST /api/kb/articles?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const kb_articles = await findKbArticlesByWorkspace(env.DB, workspaceId);
			return jsonOk({ kb_articles });
		},
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const { title, content, category_id, excerpt, tags, visibility, status } = parsed.body;
			if (typeof title !== "string" || title.trim().length === 0) return jsonError("title is required");
			if (typeof content !== "string" || content.trim().length === 0) return jsonError("content is required");

			const articleRow = await createKbArticle(env.DB, workspaceId, payload.sub, {
				title: title.trim(),
				content,
				category_id: typeof category_id === "string" ? category_id : null,
				excerpt: typeof excerpt === "string" ? excerpt.trim() : null,
				tags: Array.isArray(tags) ? (tags.filter((t) => typeof t === "string") as string[]) : [],
				visibility: typeof visibility === "string" && VISIBILITIES.includes(visibility as KbVisibility) ? (visibility as KbVisibility) : "internal",
				status: typeof status === "string" && STATUSES.includes(status as KbStatus) ? (status as KbStatus) : "draft",
			});

			if (articleRow.status === "published") {
				try {
					const vid = await upsertKbArticle(env, articleRow);
					if (vid) await setArticleVectorId(env.DB, articleRow.id, vid);
				} catch (err) {
					console.error("KB vector upsert failed:", err);
				}
			}

			const fresh = await findKbArticleById(env.DB, articleRow.id);
			return jsonCreated({ kb_article: fresh ? rowToPublicArticle(fresh) : rowToPublicArticle(articleRow) });
		},
	});
});
