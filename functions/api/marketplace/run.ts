import { jsonOk, jsonError } from "../../_lib/response";
import {
	findWorkspaceProductDetail,
	findWorkspaceProductRow,
	getWorkspaceMemberRole,
	recordWorkspaceProductTest,
} from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";
import { runTool } from "../../_lib/tool-runner";
import { toolIdFor } from "../../_lib/tool-executor";

// POST /api/marketplace/run?workspace_id=
// Runs one registered action with the workspace's stored credentials.
// Used by the console to verify a connector before handing it to an agent.
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
	return createMethodRouter(request.method, {
		POST: async () => {
			const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
			if (role !== "owner" && role !== "admin") {
				return jsonError("Only workspace owners and admins can run connector actions", 403);
			}

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;

			const workspaceProductId = typeof body.workspaceProductId === "string" ? body.workspaceProductId : "";
			const actionName = typeof body.actionName === "string" ? body.actionName : "";
			if (!workspaceProductId || !actionName) {
				return jsonError("workspaceProductId and actionName are required");
			}

			// The install row carries the owning workspace — check it before we go
			// anywhere near its credentials.
			const installRow = await findWorkspaceProductRow(env.DB, workspaceProductId);
			if (!installRow || installRow.workspace_id !== workspaceId) {
				return jsonError("Installed connector not found", 404);
			}

			const install = await findWorkspaceProductDetail(env.DB, workspaceProductId);
			if (!install) return jsonError("Installed connector not found", 404);

			const action = install.actions.find((a) => a.name === actionName);
			if (!action) return jsonError(`Action "${actionName}" not found on this connector`, 404);

			const rawParams = body.params;
			if (rawParams !== undefined && (!rawParams || typeof rawParams !== "object" || Array.isArray(rawParams))) {
				return jsonError("params must be an object");
			}

			// Write actions still need an explicit human "yes" for this run.
			const confirmed = body.confirm === true;
			if (action.requires_confirmation && !confirmed) {
				return jsonError(
					`"${action.name}" modifies data in ${install.name}. Re-send with confirm: true to run it.`,
					409,
				);
			}

			const result = await runTool({
				env,
				workspaceId,
				tools: [{ ...install, allowed_actions: null }],
				actionId: toolIdFor(install.name, action.name),
				params: (rawParams as Record<string, unknown>) ?? {},
				triggeredBy: "user",
				userId: payload.sub,
				allowConfirmationRequired: confirmed,
			});

			// A manual run doubles as the connector's health check.
			await recordWorkspaceProductTest(env.DB, workspaceProductId, result.ok, result.error ?? null);

			return jsonOk({ result });
		},
	});
});
