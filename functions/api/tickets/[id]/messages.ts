import { jsonOk, jsonCreated, jsonError } from "../../../_lib/response";
import {
  findTicketById, findMessagesByTicket, createTicketMessage, isWorkspaceMember,
  findContactById, findFirstMailboxByWorkspace, updateMailboxTokens,
  findLastInboundMessageByTicket, updateTicket, findUserById, createNotification,
} from "../../../_lib/db";
import { sendGraphMail, replyGraphMail, refreshAccessToken } from "../../../_lib/graph";
import type { MessageType } from "../../../_lib/types";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import { upsertMessage } from "../../../_lib/vectorize";

const VALID_TYPES: MessageType[] = ["message", "note"];

// GET  /api/tickets/:id/messages
// POST /api/tickets/:id/messages
export const onRequest = withAuth<"id">(async ({ request, env, payload, params }) => {
  const ticketId = params.id;
  const ticket = await findTicketById(env.DB, ticketId);
  if (!ticket) return jsonError("Ticket not found", 404);

  const member = await isWorkspaceMember(env.DB, ticket.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  return createMethodRouter(request.method, {
    GET: async () => {
      const messages = await findMessagesByTicket(env.DB, ticketId);
      return jsonOk({ messages });
    },
    POST: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { content, type, cc, bcc } = parsed.body;

      if (typeof content !== "string" || content.trim().length === 0) {
        return jsonError("content is required");
      }
      const msgType: MessageType = VALID_TYPES.includes(type as MessageType) ? (type as MessageType) : "message";

      // Parse CC/BCC: accept array of {name, address} objects
      type EmailRecipient = { name: string; address: string };
      const ccList: EmailRecipient[] = Array.isArray(cc)
        ? (cc as EmailRecipient[]).filter((r) => r && typeof r.address === "string")
        : [];
      const bccList: EmailRecipient[] = Array.isArray(bcc)
        ? (bcc as EmailRecipient[]).filter((r) => r && typeof r.address === "string")
        : [];

      const message = await createTicketMessage(env.DB, {
        ticket_id: ticketId,
        author_id: payload.sub,
        author_type: "agent",
        type: msgType,
        content: content.trim(),
      });

    // When an agent sends a reply (not an internal note) and the ticket is open,
    // move it to pending and assign it to the responding agent
    if (msgType === "message" && ticket.status === "open") {
      const updates: { status: "pending"; assignee_id?: string } = { status: "pending" };
      if (!ticket.assignee_id) {
        updates.assignee_id = payload.sub;
      }
      await updateTicket(env.DB, ticketId, updates);
    }

    // Send email reply if this is not an internal note and the ticket has a contact
    if (msgType === "message" && ticket.contact_id) {
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

          const lastInbound = await findLastInboundMessageByTicket(env.DB, ticketId);
          let sentConversationId: string | undefined;

          if (lastInbound?.graph_message_id) {
            try {
              await replyGraphMail(token, lastInbound.graph_message_id, content.trim(),
                ccList.length > 0 ? ccList : undefined,
                bccList.length > 0 ? bccList : undefined,
              );
            } catch {
              // Fallback to sendMail if createReply fails (e.g. missing Mail.ReadWrite scope)
              const result = await sendGraphMail(
                token,
                { name: contact.name, address: contact.email },
                `Re: ${ticket.subject}`,
                content.trim(),
                undefined,
                ccList.length > 0 ? ccList : undefined,
                bccList.length > 0 ? bccList : undefined,
              );
              sentConversationId = result.conversationId;
            }
          } else {
            // No inbound message: either a manual ticket or first outbound message
            const emailSubject = ticket.channel === "email"
              ? `Re: ${ticket.subject}`
              : ticket.subject;
            const result = await sendGraphMail(
              token,
              { name: contact.name, address: contact.email },
              emailSubject,
              content.trim(),
              undefined,
              ccList.length > 0 ? ccList : undefined,
              bccList.length > 0 ? bccList : undefined,
            );
            sentConversationId = result.conversationId;
          }

          // Persist conversationId + channel + cc_addresses so future replies stay consistent
          const ticketUpdates: Parameters<typeof updateTicket>[2] = {};
          if (sentConversationId && !ticket.conversation_id) {
            ticketUpdates.conversation_id = sentConversationId;
            ticketUpdates.channel = "email";
          }
          const newCcJson = ccList.length > 0 ? JSON.stringify(ccList) : null;
          if (newCcJson !== (ticket.cc_addresses ?? null)) {
            ticketUpdates.cc_addresses = newCcJson;
          }
          if (Object.keys(ticketUpdates).length > 0) {
            await updateTicket(env.DB, ticketId, ticketUpdates);
          }
        }
      } catch (emailErr) {
        console.error("Failed to send email reply:", emailErr);
      }
    }

    const actor = await findUserById(env.DB, payload.sub);

    // — Notification: new message on ticket to the assignee (if not themselves)
    if (msgType === "message" && ticket.assignee_id && ticket.assignee_id !== payload.sub) {
      await createNotification(env.DB, {
        user_id: ticket.assignee_id,
        workspace_id: ticket.workspace_id,
        type: "message",
        title: "New reply on your ticket",
        description: `${actor?.name ?? "An agent"} replied to "${ticket.subject}".`,
        resource_id: ticketId,
        actor_id: payload.sub,
      });
    }

    // — Notification: @mentions — TipTap serializes mentions as:
    // <span data-mention="true" data-mention-id="<user-id>">@Name</span>
    const mentionIdPattern = /data-mention-id="([^"]+)"/g;
    const mentionedIds = new Set<string>();
    let mentionMatch: RegExpExecArray | null;
    while ((mentionMatch = mentionIdPattern.exec(content)) !== null) {
      mentionedIds.add(mentionMatch[1]);
    }
    if (mentionedIds.size > 0) {
      await Promise.all(
        [...mentionedIds]
          .filter((uid) => uid !== payload.sub)
          .map((uid) =>
            createNotification(env.DB, {
              user_id: uid,
              workspace_id: ticket.workspace_id,
              type: "message",
              title: "You were mentioned",
              description: `${actor?.name ?? "An agent"} mentioned you in "${ticket.subject}".`,
              resource_id: ticketId,
              actor_id: payload.sub,
            })
          )
      );
    }

      void upsertMessage(env, message, ticket.workspace_id);
      return jsonCreated({ message });
    },
  });
});
