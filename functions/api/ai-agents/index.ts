import { withWorkspace } from "../../_lib/middleware";
import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findAiAgentsByWorkspace, createAiAgent, getWorkspaceMemberRole } from "../../_lib/db";

// GET  /api/ai-agents?workspace_id=
// POST /api/ai-agents?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, payload, workspaceId }) => {
	if (request.method === "GET") {
		const agents = await findAiAgentsByWorkspace(env.DB, workspaceId);
		return jsonOk({ agents });
	}

	if (request.method === "POST") {
		// Verify caller is owner or admin
		const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
		if (role !== "owner" && role !== "admin") {
			return jsonError("Only workspace owners and admins can create AI agents", 403);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return jsonError("Invalid JSON body");
		}

		const { name, description, system_prompt, confidence_threshold, max_auto_replies } = body as Record<string, unknown>;

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
	}

	return jsonError("Method not allowed", 405);
});
