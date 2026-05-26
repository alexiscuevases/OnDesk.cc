import { jsonOk, jsonError } from "../../../_lib/response";
import {
	findKbArticleById,
	findKbArticleWithCategory,
	updateKbArticle,
	deleteKbArticle,
	setArticleVectorId,
	isWorkspaceMember,
} from "../../../_lib/db";
import type { KbVisibility, KbStatus } from "../../../_lib/types";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import { upsertKbArticle, deleteKbVector } from "../../../_lib/vectorize";

const VISIBILITIES: KbVisibility[] = ["internal", "public"];
const STATUSES: KbStatus[] = ["draft", "published"];

export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	const id = params.id;
	const article = await findKbArticleById(env.DB, id);
	if (!article) return jsonError("Article not found", 404);
	const member = await isWorkspaceMember(env.DB, article.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: async () => {
			const full = await findKbArticleWithCategory(env.DB, id);
			return jsonOk({ kb_article: full });
		},
		PATCH: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const { title, content, category_id, excerpt, tags, visibility, status } = parsed.body;

			await updateKbArticle(env.DB, id, {
				title: typeof title === "string" ? title.trim() : undefined,
				content: typeof content === "string" ? content : undefined,
				category_id: typeof category_id === "string" ? category_id : category_id === null ? null : undefined,
				excerpt: typeof excerpt === "string" ? excerpt.trim() : excerpt === null ? null : undefined,
				tags: Array.isArray(tags) ? (tags.filter((t) => typeof t === "string") as string[]) : undefined,
				visibility:
					typeof visibility === "string" && VISIBILITIES.includes(visibility as KbVisibility)
						? (visibility as KbVisibility)
						: undefined,
				status: typeof status === "string" && STATUSES.includes(status as KbStatus) ? (status as KbStatus) : undefined,
			});

			const updated = await findKbArticleById(env.DB, id);
			if (updated) {
				if (updated.status === "published") {
					try {
						const vid = await upsertKbArticle(env, updated);
						if (vid && vid !== updated.vector_id) await setArticleVectorId(env.DB, id, vid);
					} catch (err) {
						console.error("KB vector upsert failed:", err);
					}
				} else if (updated.vector_id) {
					try {
						await deleteKbVector(env, updated.vector_id);
						await setArticleVectorId(env.DB, id, null);
					} catch (err) {
						console.error("KB vector delete failed:", err);
					}
				}
			}

			const full = await findKbArticleWithCategory(env.DB, id);
			return jsonOk({ kb_article: full });
		},
		DELETE: async () => {
			if (article.vector_id) {
				try {
					await deleteKbVector(env, article.vector_id);
				} catch (err) {
					console.error("KB vector delete failed:", err);
				}
			}
			await deleteKbArticle(env.DB, id);
			return jsonOk({ success: true });
		},
	});
});
