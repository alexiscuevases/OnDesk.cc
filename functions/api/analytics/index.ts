import { jsonOk } from "../../_lib/response";
import { getWorkspaceAnalyticsSnapshot } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

// GET /api/analytics?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) =>
	createMethodRouter(request.method, {
		GET: async () => {
			const analytics = await getWorkspaceAnalyticsSnapshot(env.DB, workspaceId);
			return jsonOk({ analytics });
		},
	}),
);
