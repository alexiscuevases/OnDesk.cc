import { withWorkspace } from "../../_lib/middleware";
import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findAiAgentsByWorkspace, createAiAgent, getWorkspaceMemberRole } from "../../_lib/db";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET  /api/ai-agents?workspace_id=
// POST /api/ai-agents?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, payload, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const agents = await findAiAgentsByWorkspace(env.DB, workspaceId);
			return jsonOk({ agents });
		},
		POST: async () => {
			const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
			if (role !== "owner" && role !== "admin") {
				return jsonError("Only workspace owners and admins can create AI agents", 403);
			}

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const { name, description, system_prompt, confidence_threshold, max_auto_replies } = parsed.body;

			if (typeof name !== "string" || name.trim().length === 0) {
				return jsonError("name is required");
			}

			const agent = await createAiAgent(env.DB, workspaceId, payload.sub, {
				name: name.trim(),
				description: typeof description === "string" ? description.trim() : undefined,
				system_prompt: typeof system_prompt === "string" ? system_prompt.trim() : undefined,
				confidence_threshold: typeof confidence_threshold === "number" ? confidence_threshold : undefined,
				max_auto_replies: typeof max_auto_replies === "number" ? max_auto_replies : undefined,
			});

			return jsonCreated({ agent });
		},
	});
});
