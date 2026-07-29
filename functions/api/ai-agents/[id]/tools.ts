import { jsonOk, jsonError } from "../../../_lib/response";
import {
	findAgentTools,
	assignToolToAgent,
	removeToolFromAgent,
	updateAgentToolActions,
	findAiAgentById,
	findWorkspaceProductRow,
	getWorkspaceMemberRole,
} from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import type { WorkspaceProductRow } from "../../../_lib/types";

function parseAllowedActions(value: unknown): string[] | null {
	if (!Array.isArray(value)) return null;
	const names = value
		.filter((v): v is string => typeof v === "string")
		.map((v) => v.trim())
		.filter(Boolean);
	return names.length > 0 ? names : null;
}

// GET    /api/ai-agents/:id/tools                      (list assigned tools)
// POST   /api/ai-agents/:id/tools                      (assign tool)
// PATCH  /api/ai-agents/:id/tools                      (restrict which actions it may call)
// DELETE /api/ai-agents/:id/tools?workspaceProductId=  (remove tool)
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }): Promise<Response> => {
	const agentId = params.id;
	const userId = payload.sub;

	const agent = await findAiAgentById(env.DB, agentId);
	if (!agent) return jsonError("AI agent not found", 404);

	const role = await getWorkspaceMemberRole(env.DB, agent.workspace_id, userId);
	if (!role) return jsonError("Forbidden", 403);

	const canManage = role === "owner" || role === "admin";
	const manageError = () => jsonError("Only workspace owners and admins can modify tools", 403);

	/** The install must belong to the same workspace as the agent. */
	const requireInstall = async (
		value: unknown,
	): Promise<{ ok: true; row: WorkspaceProductRow } | { ok: false; response: Response }> => {
		if (!value || typeof value !== "string") {
			return { ok: false, response: jsonError("workspaceProductId is required") };
		}
		const row = await findWorkspaceProductRow(env.DB, value);
		if (!row || row.workspace_id !== agent.workspace_id) {
			return { ok: false, response: jsonError("Installed connector not found", 404) };
		}
		return { ok: true, row };
	};

	return createMethodRouter(request.method, {
		GET: async () => {
			const tools = await findAgentTools(env.DB, agentId);
			return jsonOk({ tools });
		},

		POST: async () => {
			if (!canManage) return manageError();

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const found = await requireInstall(parsed.body.workspaceProductId);
			if (!found.ok) return found.response;

			await assignToolToAgent(env.DB, agentId, found.row.id, parseAllowedActions(parsed.body.allowedActions));
			return jsonOk({ success: true });
		},

		PATCH: async () => {
			if (!canManage) return manageError();

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			if (parsed.body.allowedActions === undefined) return jsonError("allowedActions is required");

			const found = await requireInstall(parsed.body.workspaceProductId);
			if (!found.ok) return found.response;

			// null / [] means "every action of this connector".
			await updateAgentToolActions(env.DB, agentId, found.row.id, parseAllowedActions(parsed.body.allowedActions));
			return jsonOk({ success: true });
		},

		DELETE: async () => {
			if (!canManage) return manageError();

			const url = new URL(request.url);
			const found = await requireInstall(url.searchParams.get("workspaceProductId"));
			if (!found.ok) return found.response;

			await removeToolFromAgent(env.DB, agentId, found.row.id);
			return jsonOk({ success: true });
		},
	});
});
