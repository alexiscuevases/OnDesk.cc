import { jsonOk } from "../../_lib/response";
import { countNotifications } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

// GET /api/notifications/counts?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const counts = await countNotifications(env.DB, payload.sub, workspaceId);
			return jsonOk({ counts });
		},
	});
});
