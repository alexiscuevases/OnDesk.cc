import { withAuth } from "../../../_lib/middleware";
import { jsonOk, jsonError } from "../../../_lib/response";
import {
  findTicketById,
  isWorkspaceMember,
  findAiTicketState,
  findAiActionLogsByTicket,
  escalateAiTicket,
  resumeAiTicket,
  createTicketMessage,
  createAiActionLog,
  findAiAgentById,
} from "../../../_lib/db";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";

// GET  /api/tickets/:id/ai-state   — get AI state + logs for a ticket
// POST /api/tickets/:id/ai-state   — escalate or resume AI { action: 'escalate' | 'resume', reason? }
export const onRequest = withAuth<"id">(async ({ request, env, payload, params }) => {
  const ticketId = params.id;
  const ticket = await findTicketById(env.DB, ticketId);
  if (!ticket) return jsonError("Ticket not found", 404);

  const member = await isWorkspaceMember(env.DB, ticket.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  return createMethodRouter(request.method, {
    GET: async () => {
      const [state, logs] = await Promise.all([
        findAiTicketState(env.DB, ticketId),
        findAiActionLogsByTicket(env.DB, ticketId),
      ]);

      let agentName: string | null = null;
      if (state) {
        const agent = await findAiAgentById(env.DB, state.ai_agent_id);
        agentName = agent?.name ?? null;
      }

      return jsonOk({ state, agent_name: agentName, logs });
    },
    POST: async () => {
      const state = await findAiTicketState(env.DB, ticketId);
      if (!state) return jsonError("This ticket has no AI agent assigned", 404);

      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { action, reason } = parsed.body;

      if (action === "escalate") {
        const note = typeof reason === "string" && reason.trim()
          ? reason.trim()
          : "Manually escalated by agent.";
        await escalateAiTicket(env.DB, ticketId, note);
        await createTicketMessage(env.DB, {
          ticket_id: ticketId,
          author_id: payload.sub,
          author_type: "agent",
          type: "note",
          content: `Ticket manually escalated: ${note}`,
        });
        await createAiActionLog(env.DB, {
          ticket_id: ticketId,
          ai_agent_id: state.ai_agent_id,
          action: "escalate",
          metadata: { reason: note, manual: true, escalated_by: payload.sub },
        });
        return jsonOk({ success: true });
      }

      if (action === "resume") {
        await resumeAiTicket(env.DB, ticketId);
        await createAiActionLog(env.DB, {
          ticket_id: ticketId,
          ai_agent_id: state.ai_agent_id,
          action: "routed",
          metadata: { resumed_by: payload.sub },
        });
        return jsonOk({ success: true });
      }

      return jsonError("action must be 'escalate' or 'resume'");
    },
  });
});
