import { jsonError } from "../../../_lib/response";
import { findTicketById, findMessagesByTicket, isWorkspaceMember, findWorkspaceById, findMemoriesByIds, touchMemories } from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import { AI_LIMITS, AI_MODEL } from "../../../_lib/configs";
import { searchTickets, searchMemories } from "../../../_lib/vectorize";

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

      const [ticketMessages, workspace, similarIds, workspaceMemoryIds, contactMemoryIds] = await Promise.all([
        findMessagesByTicket(env.DB, ticketId),
        findWorkspaceById(env.DB, ticket.workspace_id),
        searchTickets(env, ticket.subject, ticket.workspace_id, 5),
        searchMemories(env, ticket.subject, ticket.workspace_id, null, 4),
        ticket.contact_id
          ? searchMemories(env, ticket.subject, ticket.workspace_id, ticket.contact_id, 4)
          : Promise.resolve([] as string[]),
      ]);

      const allMemoryIds = [...new Set([...workspaceMemoryIds, ...contactMemoryIds])];
      const memories = await findMemoriesByIds(env.DB, allMemoryIds);
      if (memories.length) void touchMemories(env.DB, memories.map((m) => m.id));

      const similarTickets = (
        await Promise.all(
          similarIds
            .filter((id) => id !== ticketId)
            .slice(0, 3)
            .map((id) => findTicketById(env.DB, id))
        )
      ).filter(Boolean) as NonNullable<Awaited<ReturnType<typeof findTicketById>>>[];

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

      const workspaceMemories = memories.filter((m) => m.contact_id === null);
      const contactMemories = memories.filter((m) => m.contact_id !== null);

      const systemPrompt = `
        You are an expert customer support AI assistant embedded inside a helpdesk platform.
        You MUST base all your answers on the ticket context provided below. Never invent information.

        ${workspace?.workspace_prompt ? `---\nWORKSPACE PROMPT (additional context)\n${workspace.workspace_prompt}\n` : ""}${workspaceMemories.length > 0 ? `---\nWORKSPACE MEMORY\n${workspaceMemories.map((m) => `        - ${m.content}`).join("\n")}\n` : ""}${contactMemories.length > 0 ? `---\nCONTACT MEMORY\n${contactMemories.map((m) => `        - ${m.content}`).join("\n")}\n` : ""}

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

        ${similarTickets.length > 0 ? `---
        SIMILAR TICKETS (for reference only):
        ${similarTickets.map((t) => `  - [#${t.number}] "${t.subject}" | status: ${t.status} | priority: ${t.priority}`).join("\n")}
        ` : ""}
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

      const aiResponse = await env.AI.run(AI_MODEL, {
        messages: llmMessages,
        stream: true,
        max_tokens: AI_LIMITS.MAX_TOKENS,
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
