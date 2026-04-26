import { jsonError } from "../../../_lib/response";
import {
  findWorkspaceBySlug,
  isWorkspaceMember,
  findWorkspaceMembers,
  findTicketsByWorkspace,
  findContactsByWorkspace,
  findTeamsByWorkspace,
} from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import { AI_LIMITS, AI_MODEL } from "../../../_lib/configs";

// POST /api/workspaces/:slug/ai
// Global workspace AI assistant with full workspace context.
export const onRequest = withAuth<"slug">(async ({ request, env, payload, params }) => {
  return createMethodRouter(request.method, {
    POST: async () => {
      const slug = params.slug;

      const workspace = await findWorkspaceBySlug(env.DB, slug);
      if (!workspace) return jsonError("Workspace not found", 404);

      const member = await isWorkspaceMember(env.DB, workspace.id, payload.sub);
      if (!member) return jsonError("Forbidden", 403);

      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { messages } = parsed.body as { messages?: { role: string; content: string }[] };
      if (!Array.isArray(messages) || messages.length === 0) {
        return jsonError("messages array is required");
      }

      // Load workspace data in parallel for context
      const [members, tickets, contacts, teams] = await Promise.all([
        findWorkspaceMembers(env.DB, workspace.id),
        findTicketsByWorkspace(env.DB, workspace.id),
        findContactsByWorkspace(env.DB, workspace.id),
        findTeamsByWorkspace(env.DB, workspace.id),
      ]);

      // Build summary blocks
      const ticketStats = {
        total: tickets.length,
        open: tickets.filter((t) => t.status === "open").length,
        pending: tickets.filter((t) => t.status === "pending").length,
        resolved: tickets.filter((t) => t.status === "resolved").length,
        closed: tickets.filter((t) => t.status === "closed").length,
      };

      const recentTickets = tickets
        .slice(0, 20)
        .map((t) => `  - [${t.number}] "${t.subject}" | status: ${t.status} | priority: ${t.priority}`)
        .join("\n");

      const agentsBlock = members
        .map((m) => `  - ${m.name} (${m.email}) | role: ${m.workspace_role}`)
        .join("\n");

      const teamsBlock = teams
        .map((t) => `  - ${t.name}${t.description ? `: ${t.description}` : ""}`)
        .join("\n");

      const contactsBlock = contacts
        .slice(0, 30)
        .map((c) => `  - ${c.name} | ${c.email}${c.phone ? ` | ${c.phone}` : ""}`)
        .join("\n");

      const systemPrompt = `
You are an expert AI assistant embedded inside a helpdesk platform called Desk.
You have access to the full workspace data listed below. Use it to answer questions accurately.
Never invent information — if something is not in the context, say so.

${workspace.workspace_prompt ? `---\nWORKSPACE INSTRUCTIONS\n${workspace.workspace_prompt}\n` : ""}

---
WORKSPACE: ${workspace.name}
${workspace.description ? `Description: ${workspace.description}` : ""}

TICKET SUMMARY
- Total: ${ticketStats.total}
- Open: ${ticketStats.open}
- Pending: ${ticketStats.pending}
- Resolved: ${ticketStats.resolved}
- Closed: ${ticketStats.closed}

RECENT TICKETS (last 20)
${recentTickets || "  No tickets yet."}

AGENTS (${members.length})
${agentsBlock || "  No agents yet."}

TEAMS (${teams.length})
${teamsBlock || "  No teams yet."}

CONTACTS (${contacts.length} total, showing first 30)
${contactsBlock || "  No contacts yet."}

---
Instructions:
- Answer questions about this workspace's data concisely and accurately.
- When listing items, format them clearly with bullet points.
- Always respond in plain text. Do NOT use markdown headers (#). You may use **bold**, bullet lists, and line breaks.
- Keep responses concise and focused.
- If asked to search for a specific ticket, contact, or agent, look in the data above and provide the relevant details.`;

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
