import { withWorkspace } from "../../../_lib/middleware";
import { jsonOk, jsonError } from "../../../_lib/response";
import {
	findAiAgentById,
	findMailboxesForAgent,
	assignMailboxToAgent,
	unassignMailboxFromAgent,
	setAgentMailboxEnabled,
	getWorkspaceMemberRole,
} from "../../../_lib/db";

// GET    /api/ai-agents/:id/mailboxes?workspace_id=   — list assignments
// POST   /api/ai-agents/:id/mailboxes?workspace_id=   — assign mailbox { mailbox_integration_id }
// DELETE /api/ai-agents/:id/mailboxes?workspace_id=   — unassign { mailbox_integration_id }
// PATCH  /api/ai-agents/:id/mailboxes?workspace_id=   — toggle enabled { mailbox_integration_id, enabled }
export const onRequest = withWorkspace<"id">(async ({ request, env, payload, params, workspaceId }) => {
	const agentId = params.id;
	const agent = await findAiAgentById(env.DB, agentId);
	if (!agent) return jsonError("AI agent not found", 404);
	if (agent.workspace_id !== workspaceId) return jsonError("Forbidden", 403);

	if (request.method === "GET") {
		const mailboxes = await findMailboxesForAgent(env.DB, agentId);
		return jsonOk({ mailboxes });
	}

	// Mutations require owner or admin
	const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
	if (role !== "owner" && role !== "admin") {
		return jsonError("Only workspace owners and admins can manage mailbox assignments", 403);
	}

	if (request.method === "POST") {
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return jsonError("Invalid JSON body");
		}

		const { mailbox_integration_id } = body as Record<string, unknown>;
		if (typeof mailbox_integration_id !== "string" || !mailbox_integration_id) {
			return jsonError("mailbox_integration_id is required");
		}

		await assignMailboxToAgent(env.DB, agentId, mailbox_integration_id);
		const mailboxes = await findMailboxesForAgent(env.DB, agentId);
		return jsonOk({ mailboxes });
	}

	if (request.method === "DELETE") {
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return jsonError("Invalid JSON body");
		}

		const { mailbox_integration_id } = body as Record<string, unknown>;
		if (typeof mailbox_integration_id !== "string" || !mailbox_integration_id) {
			return jsonError("mailbox_integration_id is required");
		}

		await unassignMailboxFromAgent(env.DB, agentId, mailbox_integration_id);
		const mailboxes = await findMailboxesForAgent(env.DB, agentId);
		return jsonOk({ mailboxes });
	}

	if (request.method === "PATCH") {
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return jsonError("Invalid JSON body");
		}

		const { mailbox_integration_id, enabled } = body as Record<string, unknown>;
		if (typeof mailbox_integration_id !== "string" || !mailbox_integration_id) {
			return jsonError("mailbox_integration_id is required");
		}
		if (typeof enabled !== "boolean") {
			return jsonError("enabled (boolean) is required");
		}

		await setAgentMailboxEnabled(env.DB, agentId, mailbox_integration_id, enabled);
		const mailboxes = await findMailboxesForAgent(env.DB, agentId);
		return jsonOk({ mailboxes });
	}

	return jsonError("Method not allowed", 405);
});
