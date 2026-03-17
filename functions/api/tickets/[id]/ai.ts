import { jsonError } from "../../../_lib/response";
import { findTicketById, findMessagesByTicket, isWorkspaceMember, findWorkspaceById } from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import { AI_LIMITS, AI_MODELS } from "../../../_lib/configs";

// POST /api/tickets/:id/ai
// Calls Workers AI with the full ticket context and returns a streaming text response.
export const onRequest = withAuth<"id">(async ({ request, env, payload, params }) => {
  return createMethodRouter(request.method, {
    POST: async () => {
      const ticketId = params.id;

      const ticket = await findTicketById(env.DB, ticketId);
      if (!ticket) return jsonError("Ticket not found", 404);

      const member = await isWorkspaceMember(env.DB, ticket.workspace_id, payload.sub);
      if (!member) return jsonError("Forbidden", 403);

      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { messages } = parsed.body as { messages?: { role: string; content: string }[] };
      if (!Array.isArray(messages) || messages.length === 0) {
        return jsonError("messages array is required");
      }

      const ticketMessages = await findMessagesByTicket(env.DB, ticketId);
      const workspace = await findWorkspaceById(env.DB, ticket.workspace_id);

      const conversationBlock =
        ticketMessages.length > 0
          ? ticketMessages
              .map((m) => {
                const author = m.author_type === "agent" ? "Agent" : "Customer";
                const type = m.type === "note" ? " [internal note]" : "";
                return `[${author}${type}]: ${m.content}`;
              })
              .join("\n\n")
          : "No messages yet.";

      const systemPrompt = `
        You are an expert customer support AI assistant embedded inside a helpdesk platform.
        You MUST base all your answers on the ticket context provided below. Never invent information.

        ${workspace?.workspace_prompt ? `---\nWORKSPACE PROMPT (additional context)\n${workspace.workspace_prompt}\n` : ""}

        ---
        TICKET CONTEXT
        - Subject: ${ticket.subject}
        - Status: ${ticket.status}
        - Priority: ${ticket.priority}
        - Channel: ${ticket.channel ?? "unknown"}
        - Created: ${new Date(ticket.created_at * 1000).toISOString()}
        ---

        CONVERSATION HISTORY:
        ${conversationBlock}

        ---
        Instructions:
        - If asked to summarize, provide a concise summary of the issue and current state.
        - If asked to draft a reply, write a professional and empathetic response to the customer. Output only the email body, no subject line.
        - If asked to extract action items, list clear, actionable tasks in a bullet list.
        - Always respond in plain text. Do NOT use markdown headers (#). You may use **bold**, bullet lists, and line breaks.
        - Keep responses concise and focused.`;

      const llmMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const aiResponse = await env.AI.run(AI_MODELS.TICKET_ASSISTANT, {
        messages: llmMessages,
        stream: true,
        max_tokens: AI_LIMITS.TICKET_ASSISTANT_MAX_TOKENS,
      });

      return new Response(aiResponse as ReadableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    },
  });
});
