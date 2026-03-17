import { withWorkspace } from "../../../_lib/middleware";
import { jsonOk, jsonError } from "../../../_lib/response";
import { findAiAgentById, findAiActionLogsByAgent } from "../../../_lib/db";
import { createMethodRouter } from "../../../_lib/http";

// GET /api/ai-agents/:id/logs?workspace_id=[&ticket_id=]
export const onRequest = withWorkspace<"id">(async ({ request, env, params, workspaceId }) => {
  return createMethodRouter(request.method, {
    GET: async () => {
      const agentId = params.id;
      const agent = await findAiAgentById(env.DB, agentId);
      if (!agent) return jsonError("AI agent not found", 404);
      if (agent.workspace_id !== workspaceId) return jsonError("Forbidden", 403);

      const url = new URL(request.url);
      const ticketId = url.searchParams.get("ticket_id") ?? undefined;

      const logs = await findAiActionLogsByAgent(env.DB, agentId, ticketId);
      return jsonOk({ logs });
    },
  });
});
