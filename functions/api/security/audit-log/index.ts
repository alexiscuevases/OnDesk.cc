import { withWorkspace } from "../../../_lib/middleware";
import { listAuditLog } from "../../../_lib/db";
import { jsonOk } from "../../../_lib/response";
import { createMethodRouter } from "../../../_lib/http";

// GET /api/security/audit-log?workspace_id=...&limit=50&offset=0
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const url = new URL(request.url);
			const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);
			const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
			const { entries, total } = await listAuditLog(env.DB, workspaceId, limit, offset);
			return jsonOk({ entries, total });
		},
	});
});
