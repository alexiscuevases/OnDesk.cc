import { jsonOk } from "../../_lib/response";
import { findWorkspacesByUserId } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

/**
 * GET /api/workspaces — the user's Pulse workspaces, read from the mirror.
 *
 * Read-only by design. Creating a workspace, inviting members and changing
 * roles all happen on OnDesk; this endpoint exists so the shell can route
 * /w/:slug without a round trip to the control plane on every navigation.
 *
 * Only workspaces with a live Pulse entitlement are returned — a tenant that
 * cancelled still has rows in the mirror, but no business seeing the app.
 */
export const onRequest = withAuth(async ({ request, env, payload }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const workspaces = await findWorkspacesByUserId(env.DB, payload.sub);
			return jsonOk({ workspaces });
		},
	});
});
