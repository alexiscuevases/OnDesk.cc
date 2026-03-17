import { jsonOk, jsonError } from "../../../_lib/response";
import { findTicketById, isWorkspaceMember } from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";

// POST /api/tickets/:id/merge
// Body: { source_ids: string[] }
// Moves all messages from source tickets into :id, then deletes the sources.
export const onRequest = withAuth<"id">(async ({ request, env, payload, params }) => {
  return createMethodRouter(request.method, {
    POST: async () => {
      const targetId = params.id;
      const target = await findTicketById(env.DB, targetId);
      if (!target) return jsonError("Target ticket not found", 404);

      const member = await isWorkspaceMember(env.DB, target.workspace_id, payload.sub);
      if (!member) return jsonError("Forbidden", 403);

      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { source_ids } = parsed.body;
      if (!Array.isArray(source_ids) || source_ids.length === 0) {
        return jsonError("source_ids must be a non-empty array");
      }

      for (const sourceId of source_ids) {
        if (typeof sourceId !== "string") return jsonError("source_ids must contain strings");
        if (sourceId === targetId) return jsonError("source_ids cannot include the target ticket");

        const source = await findTicketById(env.DB, sourceId);
        if (!source) return jsonError(`Ticket not found: ${sourceId}`, 404);
        if (source.workspace_id !== target.workspace_id) return jsonError("Tickets must belong to the same workspace", 400);

        await env.DB
          .prepare("UPDATE ticket_messages SET ticket_id = ? WHERE ticket_id = ?")
          .bind(targetId, sourceId)
          .run();

        await env.DB.prepare("DELETE FROM email_tickets WHERE ticket_id = ?").bind(sourceId).run();
        await env.DB.prepare("DELETE FROM tickets WHERE id = ?").bind(sourceId).run();
      }

      await env.DB.prepare("UPDATE tickets SET updated_at = unixepoch() WHERE id = ?").bind(targetId).run();

      const updated = await findTicketById(env.DB, targetId);
      return jsonOk({ ticket: updated });
    },
  });
});
