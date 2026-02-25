import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import { verifyJwt } from "../../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../../_lib/cookies";
import { jsonOk, jsonError } from "../../../_lib/response";
import { findTicketById, isWorkspaceMember, deleteTicket } from "../../../_lib/db";

// POST /api/tickets/:id/merge
// Body: { source_ids: string[] }
// Moves all messages from source tickets into :id, then deletes the sources.
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  if (request.method !== "POST") return jsonError("Method not allowed", 405);

  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const targetId = params.id as string;
  const target = await findTicketById(env.DB, targetId);
  if (!target) return jsonError("Target ticket not found", 404);

  const member = await isWorkspaceMember(env.DB, target.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

  const { source_ids } = body as Record<string, unknown>;
  if (!Array.isArray(source_ids) || source_ids.length === 0) {
    return jsonError("source_ids must be a non-empty array");
  }

  for (const sourceId of source_ids) {
    if (typeof sourceId !== "string") return jsonError("source_ids must contain strings");
    if (sourceId === targetId) return jsonError("source_ids cannot include the target ticket");

    const source = await findTicketById(env.DB, sourceId);
    if (!source) return jsonError(`Ticket not found: ${sourceId}`, 404);
    if (source.workspace_id !== target.workspace_id) return jsonError("Tickets must belong to the same workspace", 400);

    // Move messages from source to target
    await env.DB
      .prepare("UPDATE ticket_messages SET ticket_id = ? WHERE ticket_id = ?")
      .bind(targetId, sourceId)
      .run();

    // Delete the source ticket (without cascade-deleting messages, since we moved them)
    await env.DB.prepare("DELETE FROM email_tickets WHERE ticket_id = ?").bind(sourceId).run();
    await env.DB.prepare("DELETE FROM tickets WHERE id = ?").bind(sourceId).run();
  }

  // Bump target updated_at
  await env.DB.prepare("UPDATE tickets SET updated_at = unixepoch() WHERE id = ?").bind(targetId).run();

  const updated = await findTicketById(env.DB, targetId);
  return jsonOk({ ticket: updated });
};
