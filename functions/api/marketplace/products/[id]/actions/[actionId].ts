import { jsonOk, jsonError } from "../../../../../_lib/response";
import {
	deleteProductAction,
	findProductActionById,
	findProductById,
	getWorkspaceMemberRole,
	rowToPublicProductAction,
	updateProductAction,
} from "../../../../../_lib/db";
import { withWritePermission } from "../../../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../../../_lib/http";
import { validateActionPayload } from "../../../../../_lib/marketplace-validation";
import type { ActionParameter } from "../../../../../_lib/types";

// PATCH  /api/marketplace/products/:id/actions/:actionId?workspace_id=
// DELETE /api/marketplace/products/:id/actions/:actionId?workspace_id=
export const onRequest = withWritePermission<"id" | "actionId">("marketplace.manage", async ({ request, env, params, workspaceId, payload }) => {
	const product = await findProductById(env.DB, params.id);
	if (!product) return jsonError("Connector not found", 404);
	if (product.workspace_id !== workspaceId) {
		return jsonError("Catalog connectors cannot be modified. Duplicate it to customise it.", 403);
	}

	const action = await findProductActionById(env.DB, params.actionId);
	if (!action || action.product_id !== product.id) return jsonError("Action not found", 404);

	const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
	if (role !== "owner" && role !== "admin") {
		return jsonError("Only workspace owners and admins can modify endpoints", 403);
	}

	return createMethodRouter(request.method, {
		PATCH: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			let currentParameters: ActionParameter[] = [];
			try {
				currentParameters = JSON.parse(action.parameters || "[]") as ActionParameter[];
			} catch {
				currentParameters = [];
			}

			const validated = validateActionPayload(parsed.body, {
				partial: true,
				currentPath: action.path,
				currentParameters,
			});
			if (!validated.ok) return jsonError(validated.error);

			await updateProductAction(env.DB, action.id, validated.value);

			const updated = await findProductActionById(env.DB, action.id);
			return jsonOk({ action: updated ? rowToPublicProductAction(updated) : null });
		},

		DELETE: async () => {
			await deleteProductAction(env.DB, action.id);
			return jsonOk({ success: true });
		},
	});
});
