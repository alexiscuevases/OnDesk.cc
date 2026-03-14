import { jsonOk, jsonError } from "../../../_lib/response";
import { findAgentTools, assignToolToAgent, removeToolFromAgent, findAiAgentById, getWorkspaceMemberRole } from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";

// GET    /api/ai-agents/:id/tools (list assigned tools)
// POST   /api/ai-agents/:id/tools (assign tool)
// DELETE /api/ai-agents/:id/tools/:workspaceProductId (remove tool)
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }): Promise<Response> => {
	const agentId = params.id;
	const userId = payload.sub;

	const agent = await findAiAgentById(env.DB, agentId);
	if (!agent) return jsonError("AI agent not found", 404);

	const role = await getWorkspaceMemberRole(env.DB, agent.workspace_id, userId);
	if (!role) return jsonError("Forbidden", 403);

	if (request.method === "GET") {
		const tools = await findAgentTools(env.DB, agentId);
		return jsonOk({ tools });
	}

	if (role !== "owner" && role !== "admin") {
		return jsonError("Only workspace owners and admins can modify tools", 403);
	}

	if (request.method === "POST") {
		const { workspaceProductId } = (await request.json()) as { workspaceProductId: string };
		if (!workspaceProductId) return jsonError("Workspace Product ID is required");

		await assignToolToAgent(env.DB, agentId, workspaceProductId);
		return jsonOk({ success: true });
	}

	if (request.method === "DELETE") {
		const url = new URL(request.url);
		const workspaceProductId = url.searchParams.get("workspaceProductId");
		if (!workspaceProductId) return jsonError("Workspace Product ID is required");

		await removeToolFromAgent(env.DB, agentId, workspaceProductId);
		return jsonOk({ success: true });
	}

	return jsonError("Method not allowed", 405);
});
