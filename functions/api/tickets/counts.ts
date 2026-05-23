import { jsonOk } from "../../_lib/response";
import { countTicketsByStatus } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

// GET /api/tickets/counts?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const counts = await countTicketsByStatus(env.DB, workspaceId);
			return jsonOk({ counts });
		},
	});
});
