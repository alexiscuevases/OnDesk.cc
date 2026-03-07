import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import {
  findMailboxIntegrationBySubscriptionId,
  findEmailTicketByMessageId,
  findTicketByConversationId,
  updateMailboxTokens,
  updateMailboxSubscription,
  markEmailAsTicket,
  findOrCreateContact,
  createTicket,
  createTicketMessage,
  findWorkspaceMemberIds,
  createNotification,
} from "../../_lib/db";
import {
  refreshAccessToken,
  getGraphMessage,
  renewGraphSubscription,
} from "../../_lib/graph";

interface GraphNotification {
  subscriptionId: string;
  clientState: string;
  changeType: string;
  resourceData: {
    id: string;
    "@odata.type": string;
  };
}

interface GraphNotificationPayload {
  value: GraphNotification[];
}

// POST /api/webhooks/microsoft-graph
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  // Type 1: Subscription validation handshake
  const url = new URL(request.url);
  const validationToken = url.searchParams.get("validationToken");
  if (validationToken) {
    return new Response(validationToken, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  // Type 2: Change notification
  // Always respond 202 quickly — process notifications then return
  let body: GraphNotificationPayload;
  try {
    body = await request.json() as GraphNotificationPayload;
  } catch {
    return new Response(null, { status: 202 });
  }

  const nowSecs = () => Math.floor(Date.now() / 1000);

  // Process each notification (fire-and-forget pattern: respond 202 first would be ideal,
  // but Cloudflare Workers require processing before returning — keep it fast)
  for (const notification of body.value ?? []) {
    try {
      // 1. Look up the mailbox by subscription ID
      const mailbox = await findMailboxIntegrationBySubscriptionId(
        env.DB,
        notification.subscriptionId
      );
      if (!mailbox) continue;

      // 2. Validate clientState to prevent spoofed notifications
      if (notification.clientState !== mailbox.client_state_secret) continue;

      const messageId = notification.resourceData?.id;
      if (!messageId) continue;

      // 3. Deduplication check
      const existing = await findEmailTicketByMessageId(
        env.DB,
        mailbox.id,
        messageId
      );
      if (existing) continue;

      // 4. Get a valid access token (refresh if needed)
      let accessToken = mailbox.access_token;
      if (mailbox.token_expires_at < nowSecs() + 60) {
        const refreshed = await refreshAccessToken(
          env.MS_CLIENT_ID,
          env.MS_CLIENT_SECRET,
          mailbox.refresh_token
        );
        accessToken = refreshed.access_token;
        await updateMailboxTokens(env.DB, mailbox.id, {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          token_expires_at: nowSecs() + refreshed.expires_in,
        });
      }

      // 5. Renew subscription inline if expiring within 24 hours
      if (
        mailbox.subscription_id &&
        mailbox.subscription_expires_at !== null &&
        mailbox.subscription_expires_at - nowSecs() < 86400
      ) {
        try {
          const renewed = await renewGraphSubscription(accessToken, mailbox.subscription_id);
          const subExpiresAt = Math.floor(
            new Date(renewed.expirationDateTime).getTime() / 1000
          );
          await updateMailboxSubscription(env.DB, mailbox.id, {
            subscription_id: mailbox.subscription_id,
            subscription_expires_at: subExpiresAt,
          });
        } catch {
          // Non-fatal: continue processing the email
        }
      }

      // 6. Fetch the email from Microsoft Graph
      const message = await getGraphMessage(accessToken, messageId);

      // 7. Find or create the contact (email sender)
      const senderEmail = message.from.emailAddress.address;
      const senderName = message.from.emailAddress.name || senderEmail;
      const contact = await findOrCreateContact(env.DB, mailbox.workspace_id, {
        name: senderName,
        email: senderEmail,
      });

      // 8. Find existing ticket by conversationId (reply threading) or create new one
      const content = message.body.content || message.bodyPreview;
      const existingTicket = message.conversationId
        ? await findTicketByConversationId(env.DB, mailbox.workspace_id, message.conversationId)
        : null;

      let ticketId: string;
      if (existingTicket) {
        // Thread the reply into the existing ticket
        ticketId = existingTicket.id;

        // — Notification: contact replied — notify the assigned agent
        if (existingTicket.assignee_id) {
          await createNotification(env.DB, {
            user_id: existingTicket.assignee_id,
            workspace_id: mailbox.workspace_id,
            type: "message",
            title: "Customer replied",
            description: `${contact.name} replied to "${existingTicket.subject}".`,
            resource_id: existingTicket.id,
          });
        }
      } else {
        // New conversation — create a ticket
        const subject = message.subject?.trim() || "(no subject)";
        const ticket = await createTicket(env.DB, mailbox.workspace_id, {
          subject,
          contact_id: contact.id,
          status: "open",
          priority: "medium",
          channel: "email",
          conversation_id: message.conversationId || undefined,
        });
        ticketId = ticket.id;

        // — Notification: new ticket via email — notify all workspace members
        const memberIds = await findWorkspaceMemberIds(env.DB, mailbox.workspace_id);
        await Promise.all(
          memberIds.map((uid) =>
            createNotification(env.DB, {
              user_id: uid,
              workspace_id: mailbox.workspace_id,
              type: "ticket",
              title: "New ticket received",
              description: `${contact.name} opened "${subject}".`,
              resource_id: ticket.id,
            })
          )
        );
      }

      // 9. Add the email body as a message on the ticket
      await createTicketMessage(env.DB, {
        ticket_id: ticketId,
        author_id: contact.id,
        author_type: "contact",
        type: "message",
        content,
        graph_message_id: message.internetMessageId,
      });

      // 10. Mark as processed to prevent duplicates
      await markEmailAsTicket(env.DB, {
        mailbox_integration_id: mailbox.id,
        internet_message_id: message.internetMessageId,
        ticket_id: ticketId,
      });
    } catch (err) {
      // Log but don't throw — we must still return 202
      console.error("Error processing Graph notification:", err);
    }
  }

  return new Response(null, { status: 202 });
};
