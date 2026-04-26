import { jsonError } from "../../../_lib/response";
import {
  findWorkspaceBySlug,
  isWorkspaceMember,
  findWorkspaceMembers,
  findTicketsByWorkspace,
  findContactsByWorkspace,
  findTeamsByWorkspace,
  findCompaniesByWorkspace,
  findMemoriesByIds,
  touchMemories,
} from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import { AI_LIMITS, AI_MODEL } from "../../../_lib/configs";
import { searchTickets, searchContacts, searchCompanies, searchMemories } from "../../../_lib/vectorize";

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

      const userQuery = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

      // Load fixed small sets + all tickets for stats; run vector searches in parallel
      const [members, teams, allTickets, allContacts, allCompanies, ticketIds, contactIds, companyIds, memoryIds] =
        await Promise.all([
          findWorkspaceMembers(env.DB, workspace.id),
          findTeamsByWorkspace(env.DB, workspace.id),
          findTicketsByWorkspace(env.DB, workspace.id),
          findContactsByWorkspace(env.DB, workspace.id),
          findCompaniesByWorkspace(env.DB, workspace.id),
          searchTickets(env, userQuery, workspace.id, 8),
          searchContacts(env, userQuery, workspace.id, 8),
          searchCompanies(env, userQuery, workspace.id, 5),
          searchMemories(env, userQuery, workspace.id, null, 6),
        ]);

      const memories = await findMemoriesByIds(env.DB, memoryIds);
      if (memories.length) void touchMemories(env.DB, memories.map((m) => m.id));

      // Filter to semantically relevant items; fall back to recency slice if index is empty
      const relevantTickets = ticketIds.length > 0
        ? allTickets.filter((t) => ticketIds.includes(t.id))
        : allTickets.slice(0, 10);
      const relevantContacts = contactIds.length > 0
        ? allContacts.filter((c) => contactIds.includes(c.id))
        : allContacts.slice(0, 15);
      const relevantCompanies = companyIds.length > 0
        ? allCompanies.filter((c) => companyIds.includes(c.id))
        : allCompanies.slice(0, 10);

      const ticketStats = {
        total: allTickets.length,
        open: allTickets.filter((t) => t.status === "open").length,
        pending: allTickets.filter((t) => t.status === "pending").length,
        resolved: allTickets.filter((t) => t.status === "resolved").length,
        closed: allTickets.filter((t) => t.status === "closed").length,
      };

      const ticketsBlock = relevantTickets
        .map((t) => `  - [${t.number}] "${t.subject}" | status: ${t.status} | priority: ${t.priority}`)
        .join("\n");

      const agentsBlock = members
        .map((m) => `  - ${m.name} (${m.email}) | role: ${m.workspace_role}`)
        .join("\n");

      const teamsBlock = teams
        .map((t) => `  - ${t.name}${t.description ? `: ${t.description}` : ""}`)
        .join("\n");

      const contactsBlock = relevantContacts
        .map((c) => `  - ${c.name} | ${c.email}${c.phone ? ` | ${c.phone}` : ""}`)
        .join("\n");

      const companiesBlock = relevantCompanies
        .map((c) => `  - ${c.name}${c.domain ? ` | ${c.domain}` : ""}${c.description ? ` | ${c.description}` : ""}`)
        .join("\n");

      const memoriesBlock = memories.map((m) => `  - ${m.content}`).join("\n");

      const systemPrompt = `
You are an expert AI assistant embedded inside a helpdesk platform called Desk.
You have access to workspace data relevant to the user's question. Use it to answer accurately.
Never invent information — if something is not in the context, say so.

${workspace.workspace_prompt ? `---\nWORKSPACE INSTRUCTIONS\n${workspace.workspace_prompt}\n` : ""}

---
WORKSPACE: ${workspace.name}
${workspace.description ? `Description: ${workspace.description}` : ""}

TICKET SUMMARY
- Total: ${ticketStats.total} | Open: ${ticketStats.open} | Pending: ${ticketStats.pending} | Resolved: ${ticketStats.resolved} | Closed: ${ticketStats.closed}

RELEVANT TICKETS (${relevantTickets.length})
${ticketsBlock || "  No matching tickets."}

AGENTS (${members.length})
${agentsBlock || "  No agents yet."}

TEAMS (${teams.length})
${teamsBlock || "  No teams yet."}

RELEVANT CONTACTS (${relevantContacts.length})
${contactsBlock || "  No matching contacts."}

RELEVANT COMPANIES (${relevantCompanies.length})
${companiesBlock || "  No matching companies."}

${memoriesBlock ? `---
WORKSPACE MEMORY
${memoriesBlock}
` : ""}---
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
