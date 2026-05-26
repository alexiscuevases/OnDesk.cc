import { jsonOk, jsonCreated, jsonError } from "../../../_lib/response";
import { findKbCategoriesByWorkspace, createKbCategory } from "../../../_lib/db";
import { withWorkspace } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";

// GET  /api/kb/categories?workspace_id=
// POST /api/kb/categories?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const kb_categories = await findKbCategoriesByWorkspace(env.DB, workspaceId);
			return jsonOk({ kb_categories });
		},
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const { name, description, display_order } = parsed.body;
			if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");
			const cat = await createKbCategory(env.DB, workspaceId, {
				name: name.trim(),
				description: typeof description === "string" ? description.trim() : null,
				display_order: typeof display_order === "number" ? Math.floor(display_order) : 0,
			});
			return jsonCreated({ kb_category: cat });
		},
	});
});
