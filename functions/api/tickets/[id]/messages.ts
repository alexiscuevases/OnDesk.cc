import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import { verifyJwt } from "../../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../../_lib/cookies";
import { jsonOk, jsonCreated, jsonError } from "../../../_lib/response";
import { findTicketById, findMessagesByTicket, createTicketMessage, isWorkspaceMember } from "../../../_lib/db";
import type { MessageType } from "../../../_lib/types";

const VALID_TYPES: MessageType[] = ["message", "note"];

// GET  /api/tickets/:id/messages
// POST /api/tickets/:id/messages
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const ticketId = params.id as string;
  const ticket = await findTicketById(env.DB, ticketId);
  if (!ticket) return jsonError("Ticket not found", 404);

  const member = await isWorkspaceMember(env.DB, ticket.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  if (request.method === "GET") {
    const messages = await findMessagesByTicket(env.DB, ticketId);
    return jsonOk({ messages });
  }

  if (request.method === "POST") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { content, type } = body as Record<string, unknown>;

    if (typeof content !== "string" || content.trim().length === 0) {
      return jsonError("content is required");
    }
    const msgType: MessageType = VALID_TYPES.includes(type as MessageType) ? (type as MessageType) : "message";

    const message = await createTicketMessage(env.DB, {
      ticket_id: ticketId,
      author_id: payload.sub,
      author_type: "agent",
      type: msgType,
      content: content.trim(),
    });

    return jsonCreated({ message });
  }

  return jsonError("Method not allowed", 405);
};
