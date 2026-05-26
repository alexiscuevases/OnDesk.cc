import { withWorkspace } from "../../../../_lib/middleware";
import {
	deleteIpAllowlistEntry,
	getWorkspaceMemberRole,
	writeAuditLog,
} from "../../../../_lib/db";
import { jsonOk, jsonError } from "../../../../_lib/response";
import { createMethodRouter } from "../../../../_lib/http";

// DELETE /api/security/ip-allowlist/:id?workspace_id=...
export const onRequest = withWorkspace<"id">(async ({ request, env, payload, params, workspaceId }) => {
	return createMethodRouter(request.method, {
		DELETE: async () => {
			const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
			if (role !== "owner" && role !== "admin") return jsonError("Forbidden", 403);

			const removed = await deleteIpAllowlistEntry(env.DB, workspaceId, params.id);
			if (!removed) return jsonError("Entry not found", 404);

			await writeAuditLog(env.DB, {
				workspace_id: workspaceId,
				actor_id: payload.sub,
				actor_email: payload.email,
				action: "security.ip_removed",
				target: removed.cidr,
				ip: request.headers.get("CF-Connecting-IP"),
			});

			return jsonOk({ ok: true });
		},
	});
});
