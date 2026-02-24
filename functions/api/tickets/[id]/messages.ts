import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import { verifyJwt } from "../../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../../_lib/cookies";
import { jsonOk, jsonCreated, jsonError } from "../../../_lib/response";
import {
  findTicketById, findMessagesByTicket, createTicketMessage, isWorkspaceMember,
  findContactById, findFirstMailboxByWorkspace, updateMailboxTokens,
} from "../../../_lib/db";
import { sendGraphMail, replyGraphMail, refreshAccessToken } from "../../../_lib/graph";
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

    // Send email reply if the ticket came via email and this is not an internal note
    if (ticket.channel === "email" && msgType === "message" && ticket.contact_id) {
      try {
        const [contact, mailbox] = await Promise.all([
          findContactById(env.DB, ticket.contact_id),
          findFirstMailboxByWorkspace(env.DB, ticket.workspace_id),
        ]);

        if (!contact) {
          console.error("Email reply skipped: contact not found", ticket.contact_id);
        } else if (!mailbox) {
          console.error("Email reply skipped: no mailbox configured for workspace", ticket.workspace_id);
        } else {
          let token = mailbox.access_token;
          const nowSecs = Math.floor(Date.now() / 1000);

          if (mailbox.token_expires_at < nowSecs + 60) {
            const refreshed = await refreshAccessToken(
              env.MS_CLIENT_ID,
              env.MS_CLIENT_SECRET,
              mailbox.refresh_token
            );
            token = refreshed.access_token;
            await updateMailboxTokens(env.DB, mailbox.id, {
              access_token: refreshed.access_token,
              refresh_token: refreshed.refresh_token,
              token_expires_at: nowSecs + refreshed.expires_in,
            });
          }

          if (ticket.graph_message_id) {
            try {
              await replyGraphMail(token, ticket.graph_message_id, content.trim());
            } catch {
              // Fallback to sendMail if createReply fails (e.g. missing Mail.ReadWrite scope)
              await sendGraphMail(
                token,
                { name: contact.name, address: contact.email },
                `Re: ${ticket.subject}`,
                content.trim()
              );
            }
          } else {
            await sendGraphMail(
              token,
              { name: contact.name, address: contact.email },
              `Re: ${ticket.subject}`,
              content.trim()
            );
          }
        }
      } catch (emailErr) {
        console.error("Failed to send email reply:", emailErr);
      }
    }

    return jsonCreated({ message });
  }

  return jsonError("Method not allowed", 405);
};
