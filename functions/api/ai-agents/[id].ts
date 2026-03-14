import { withWorkspace } from "../../_lib/middleware";
import { jsonOk, jsonError } from "../../_lib/response";
import { findAiAgentById, findMailboxesForAgent, updateAiAgent, deleteAiAgent, isWorkspaceMember, getWorkspaceMemberRole } from "../../_lib/db";
import type { AiAgentStatus } from "../../_lib/types";

const VALID_STATUSES: AiAgentStatus[] = ["active", "inactive"];

// GET    /api/ai-agents/:id?workspace_id=
// PATCH  /api/ai-agents/:id?workspace_id=
// DELETE /api/ai-agents/:id?workspace_id=
export const onRequest = withWorkspace<"id">(async ({ request, env, payload, params, workspaceId }) => {
	const agentId = params.id;
	const agent = await findAiAgentById(env.DB, agentId);
	if (!agent) return jsonError("AI agent not found", 404);
	if (agent.workspace_id !== workspaceId) return jsonError("Forbidden", 403);

	if (request.method === "GET") {
		const mailboxes = await findMailboxesForAgent(env.DB, agentId);
		return jsonOk({ agent, mailboxes });
	}

	// PATCH and DELETE require owner or admin
	const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
	if (role !== "owner" && role !== "admin") {
		return jsonError("Only workspace owners and admins can modify AI agents", 403);
	}

	if (request.method === "PATCH") {
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return jsonError("Invalid JSON body");
		}

		const { name, description, status, system_prompt, confidence_threshold, max_auto_replies } = body as Record<string, unknown>;

		const updates: Parameters<typeof updateAiAgent>[2] = {};
		if (typeof name === "string" && name.trim()) updates.name = name.trim();
		if (typeof description === "string") updates.description = description.trim() || null;
		if (typeof status === "string" && VALID_STATUSES.includes(status as AiAgentStatus)) updates.status = status as AiAgentStatus;
		if (typeof system_prompt === "string") updates.system_prompt = system_prompt.trim() || null;
		if (typeof confidence_threshold === "number") updates.confidence_threshold = confidence_threshold;
		if (typeof max_auto_replies === "number") updates.max_auto_replies = max_auto_replies;

		await updateAiAgent(env.DB, agentId, updates);
		const updated = await findAiAgentById(env.DB, agentId);
		return jsonOk({ agent: updated });
	}

	if (request.method === "DELETE") {
		await deleteAiAgent(env.DB, agentId);
		return jsonOk({ success: true });
	}

	return jsonError("Method not allowed", 405);
});
