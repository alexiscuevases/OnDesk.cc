import { jsonOk } from "../../_lib/response";
import { findToolCallLogs } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

// GET /api/marketplace/logs?workspace_id=&workspace_product_id=&ticket_id=&limit=
// Audit trail of every outbound connector call — who ran what, and what came back.
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const url = new URL(request.url);
			const limitParam = Number(url.searchParams.get("limit"));

			const logs = await findToolCallLogs(env.DB, workspaceId, {
				workspaceProductId: url.searchParams.get("workspace_product_id"),
				ticketId: url.searchParams.get("ticket_id"),
				limit: Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 50,
			});

			return jsonOk({ logs });
		},
	});
});
