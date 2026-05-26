import { jsonOk, jsonError } from "../../../_lib/response";
import { findKbCategoryById, updateKbCategory, deleteKbCategory, isWorkspaceMember } from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";

export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	const id = params.id;
	const cat = await findKbCategoryById(env.DB, id);
	if (!cat) return jsonError("Category not found", 404);
	const member = await isWorkspaceMember(env.DB, cat.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: () => jsonOk({ kb_category: cat }),
		PATCH: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const { name, description, display_order } = parsed.body;
			await updateKbCategory(env.DB, id, {
				name: typeof name === "string" ? name.trim() : undefined,
				description: typeof description === "string" ? description.trim() : description === null ? null : undefined,
				display_order: typeof display_order === "number" ? Math.floor(display_order) : undefined,
			});
			const updated = await findKbCategoryById(env.DB, id);
			return jsonOk({ kb_category: updated });
		},
		DELETE: async () => {
			await deleteKbCategory(env.DB, id);
			return jsonOk({ success: true });
		},
	});
});
