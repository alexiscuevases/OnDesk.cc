import { withWorkspace } from "../../_lib/middleware";
import { findSubscriptionByWorkspace } from "../../_lib/db";
import { jsonOk, jsonError } from "../../_lib/response";
import { createMethodRouter } from "../../_lib/http";

// GET /api/billing?workspace_id=... — get subscription for workspace
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const subscription = await findSubscriptionByWorkspace(env.DB, workspaceId);
			if (!subscription) return jsonError("No subscription found", 404);
			return jsonOk({ subscription });
		},
	});
});
