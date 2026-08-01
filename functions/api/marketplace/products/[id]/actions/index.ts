import { jsonOk, jsonCreated, jsonError } from "../../../../../_lib/response";
import {
	createProductAction,
	findProductActions,
	findProductById,
	getWorkspaceMemberRole,
	rowToPublicProductAction,
} from "../../../../../_lib/db";
import { withWritePermission } from "../../../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../../../_lib/http";
import { validateActionPayload, type ActionPayload } from "../../../../../_lib/marketplace-validation";

const MAX_ACTIONS_PER_PRODUCT = 100;

// GET  /api/marketplace/products/:id/actions?workspace_id=
// POST /api/marketplace/products/:id/actions?workspace_id=  → register an endpoint
export const onRequest = withWritePermission<"id">("marketplace.manage", async ({ request, env, params, workspaceId, payload }) => {
	const productId = params.id;

	const product = await findProductById(env.DB, productId);
	if (!product) return jsonError("Connector not found", 404);

	const isVisible = product.workspace_id === workspaceId || (product.is_public === 1 && product.workspace_id === null);
	if (!isVisible) return jsonError("Connector not found", 404);

	return createMethodRouter(request.method, {
		GET: async () => {
			const actions = await findProductActions(env.DB, productId);
			return jsonOk({ actions });
		},

		POST: async () => {
			if (product.workspace_id !== workspaceId) {
				return jsonError("Catalog connectors cannot be modified. Duplicate it to customise it.", 403);
			}
			const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
			if (role !== "owner" && role !== "admin") {
				return jsonError("Only workspace owners and admins can register endpoints", 403);
			}

			const existing = await findProductActions(env.DB, productId);
			if (existing.length >= MAX_ACTIONS_PER_PRODUCT) {
				return jsonError(`A connector supports at most ${MAX_ACTIONS_PER_PRODUCT} actions`);
			}

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const validated = validateActionPayload(parsed.body);
			if (!validated.ok) return jsonError(validated.error);
			const payloadValues = validated.value as ActionPayload;

			if (existing.some((action) => action.name === payloadValues.name)) {
				return jsonError(`An action named "${payloadValues.name}" already exists on this connector`);
			}

			const row = await createProductAction(env.DB, productId, {
				...payloadValues,
				sort_order: payloadValues.sort_order || existing.length,
			});

			return jsonCreated({ action: rowToPublicProductAction(row) });
		},
	});
});
