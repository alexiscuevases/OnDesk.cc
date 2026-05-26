import { withWorkspace } from "../../_lib/middleware";
import { getSecuritySettings, updateSecuritySettings, writeAuditLog, getWorkspaceMemberRole } from "../../_lib/db";
import { jsonOk, jsonError } from "../../_lib/response";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET  /api/security?workspace_id=... — fetch workspace security settings
// PATCH /api/security?workspace_id=... — update toggles (admin/owner only)
export const onRequest = withWorkspace(async ({ request, env, payload, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const settings = await getSecuritySettings(env.DB, workspaceId);
			return jsonOk({ settings });
		},
		PATCH: async () => {
			const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
			if (role !== "owner" && role !== "admin") return jsonError("Forbidden", 403);

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body as {
				require_2fa?: unknown;
				strong_password?: unknown;
				ip_allowlist_enabled?: unknown;
				audit_log_enabled?: unknown;
			};

			const patch: Parameters<typeof updateSecuritySettings>[2] = {};
			if (typeof body.require_2fa === "boolean") patch.require_2fa = body.require_2fa;
			if (typeof body.strong_password === "boolean") patch.strong_password = body.strong_password;
			if (typeof body.ip_allowlist_enabled === "boolean") patch.ip_allowlist_enabled = body.ip_allowlist_enabled;
			if (typeof body.audit_log_enabled === "boolean") patch.audit_log_enabled = body.audit_log_enabled;

			const settings = await updateSecuritySettings(env.DB, workspaceId, patch);

			await writeAuditLog(env.DB, {
				workspace_id: workspaceId,
				actor_id: payload.sub,
				actor_email: payload.email,
				action: "security.settings_updated",
				ip: request.headers.get("CF-Connecting-IP"),
				metadata: patch,
			});

			return jsonOk({ settings });
		},
	});
});
