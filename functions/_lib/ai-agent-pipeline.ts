import type { Env, AiAgentRow, MailboxIntegrationRow, TicketRow, ContactRow } from "./types";
import type { GraphMessage } from "./graph";
import {
  findAiTicketState,
  createAiTicketState,
  incrementAiReplyCount,
  escalateAiTicket,
  createTicketMessage,
  updateTicket,
  findMessagesByTicket,
  findWorkspaceMemberIds,
  createNotification,
  createAiActionLog,
  updateMailboxTokens,
  findLastInboundMessageByTicket,
} from "./db";
import { refreshAccessToken, replyGraphMail, sendGraphMail } from "./graph";

interface PipelineContext {
  ticket: TicketRow;
  mailbox: MailboxIntegrationRow;
  aiAgent: AiAgentRow;
  inboundMessage: GraphMessage;
  contact: ContactRow;
  isNewTicket: boolean;
}

// Parse the CONFIDENCE:0.XX suffix the model appends and strip it from the reply text.
// Returns { text, confidence } — confidence defaults to 1.0 if not found.
function parseConfidence(raw: string): { text: string; confidence: number } {
  const match = raw.match(/\n?CONFIDENCE:([\d.]+)\s*$/i);
  if (!match) return { text: raw.trim(), confidence: 1.0 };
  const confidence = Math.min(1, Math.max(0, parseFloat(match[1]) || 0));
  const text = raw.slice(0, raw.length - match[0].length).trim();
  return { text, confidence };
}

async function triggerEscalation(
  env: Env,
  ticket: TicketRow,
  aiAgent: AiAgentRow,
  reason: string
): Promise<void> {
  await escalateAiTicket(env.DB, ticket.id, reason);

  await createTicketMessage(env.DB, {
    ticket_id: ticket.id,
    author_id: aiAgent.id,
    author_type: "agent",
    type: "note",
    content: `AI Agent escalated this ticket: ${reason}`,
  });

  await createAiActionLog(env.DB, {
    ticket_id: ticket.id,
    ai_agent_id: aiAgent.id,
    action: "escalate",
    metadata: { reason },
  });

  // Notify all workspace members that human intervention is required
  const memberIds = await findWorkspaceMemberIds(env.DB, ticket.workspace_id);
  await Promise.all(
    memberIds.map((uid) =>
      createNotification(env.DB, {
        user_id: uid,
        workspace_id: ticket.workspace_id,
        type: "assign",
        title: "AI escalation — human review required",
        description: `AI agent could not resolve "${ticket.subject}": ${reason}`,
        resource_id: ticket.id,
      })
    )
  );
}

export async function runAiAgentPipeline(
  env: Env,
  ctx: PipelineContext
): Promise<void> {
  const { ticket, mailbox, aiAgent, contact } = ctx;

  // 1. Load or create ai_ticket_state
  let state = await findAiTicketState(env.DB, ticket.id);
  if (!state) {
    state = await createAiTicketState(env.DB, ticket.id, aiAgent.id);
    await createAiActionLog(env.DB, {
      ticket_id: ticket.id,
      ai_agent_id: aiAgent.id,
      action: "routed",
      metadata: { mailbox_id: mailbox.id },
    });
  }

  // 2. Stop if already escalated
  if (state.escalated) return;

  // 3. Check max reply cap
  if (aiAgent.max_auto_replies > 0 && state.reply_count >= aiAgent.max_auto_replies) {
    await triggerEscalation(
      env,
      ticket,
      aiAgent,
      `Maximum auto-reply limit (${aiAgent.max_auto_replies}) reached.`
    );
    return;
  }

  // 4. Build conversation history for the prompt
  const ticketMessages = await findMessagesByTicket(env.DB, ticket.id);
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

  // 5. Compose the system prompt
  const basePrompt = `You are ${aiAgent.name}, an automated AI support agent. Your job is to resolve customer support tickets by writing professional, empathetic email replies.

TICKET CONTEXT
- Subject: ${ticket.subject}
- Status: ${ticket.status}
- Priority: ${ticket.priority}
- Channel: ${ticket.channel ?? "email"}
- Created: ${new Date(ticket.created_at * 1000).toISOString()}

CONVERSATION HISTORY:
${conversationBlock}

Instructions:
- Write a concise, professional reply that directly addresses the customer's issue.
- Output ONLY the email body — no subject line, no greeting header beyond what is natural.
- Always sign the email as "${aiAgent.name}". Never use placeholders like [Your Name] or [Agent Name].
- If you cannot resolve the issue confidently, still write the best reply you can.
- After your reply, on a new line output: CONFIDENCE:0.XX where XX is your confidence 0.00–1.00 that this reply fully resolves the issue.`;

  const systemPrompt = aiAgent.system_prompt
    ? `${aiAgent.system_prompt}\n\n${basePrompt}`
    : basePrompt;

  // 6. Call Workers AI (non-streaming — we need the full text before deciding)
  let rawText = "";
  try {
    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please reply to this support ticket from ${contact.name}.` },
      ],
      stream: false,
      max_tokens: 1024,
    }) as { response?: string } | string;

    rawText = typeof aiResponse === "string"
      ? aiResponse
      : (aiResponse as { response?: string }).response ?? "";
  } catch (err) {
    console.error("AI pipeline: Workers AI call failed", err);
    await triggerEscalation(env, ticket, aiAgent, "AI model call failed.");
    return;
  }

  if (!rawText.trim()) {
    await triggerEscalation(env, ticket, aiAgent, "AI model returned an empty response.");
    return;
  }

  // 7. Parse confidence score
  const { text: replyText, confidence } = parseConfidence(rawText);

  // 8. Confidence check — escalate if below threshold
  if (confidence < aiAgent.confidence_threshold) {
    await triggerEscalation(
      env,
      ticket,
      aiAgent,
      `Confidence ${confidence.toFixed(2)} is below threshold ${aiAgent.confidence_threshold.toFixed(2)}.`
    );
    return;
  }

  // 9. Get a valid access token
  const nowSecs = Math.floor(Date.now() / 1000);
  let accessToken = mailbox.access_token;
  if (mailbox.token_expires_at < nowSecs + 60) {
    try {
      const refreshed = await refreshAccessToken(
        env.MS_CLIENT_ID,
        env.MS_CLIENT_SECRET,
        mailbox.refresh_token
      );
      accessToken = refreshed.access_token;
      await updateMailboxTokens(env.DB, mailbox.id, {
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        token_expires_at: nowSecs + refreshed.expires_in,
      });
    } catch (err) {
      console.error("AI pipeline: token refresh failed", err);
      await triggerEscalation(env, ticket, aiAgent, "Failed to refresh mailbox access token.");
      return;
    }
  }

  // 10. Send the email reply
  // Convert plain text to HTML for proper rendering in email clients
  const replyHtml = replyText
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");

  try {
    const lastInbound = await findLastInboundMessageByTicket(env.DB, ticket.id);
    let sentConversationId: string | undefined;

    if (lastInbound?.graph_message_id) {
      try {
        await replyGraphMail(accessToken, lastInbound.graph_message_id, replyHtml);
      } catch {
        // Fallback to sendMail
        const result = await sendGraphMail(
          accessToken,
          { name: contact.name, address: contact.email },
          `Re: ${ticket.subject}`,
          replyHtml
        );
        sentConversationId = result.conversationId;
      }
    } else {
      const result = await sendGraphMail(
        accessToken,
        { name: contact.name, address: contact.email },
        `Re: ${ticket.subject}`,
        replyHtml
      );
      sentConversationId = result.conversationId;
    }

    // Persist conversationId if this was the first outbound message
    if (sentConversationId && !ticket.conversation_id) {
      await updateTicket(env.DB, ticket.id, {
        conversation_id: sentConversationId,
        channel: "email",
      });
    }
  } catch (err) {
    console.error("AI pipeline: email send failed", err);
    await triggerEscalation(env, ticket, aiAgent, "Failed to send email reply.");
    return;
  }

  // 11. Persist the message in the ticket conversation
  // Convert plain text to HTML so it renders correctly in email clients and the UI
  const htmlContent = replyText
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");
  await createTicketMessage(env.DB, {
    ticket_id: ticket.id,
    author_id: aiAgent.id,
    author_type: "agent",
    type: "message",
    content: htmlContent,
  });

  // 12. Move ticket to pending if it was open
  if (ticket.status === "open") {
    await updateTicket(env.DB, ticket.id, { status: "pending" });
    await createAiActionLog(env.DB, {
      ticket_id: ticket.id,
      ai_agent_id: aiAgent.id,
      action: "status_change",
      metadata: { from: "open", to: "pending" },
    });
  }

  // 13. Increment reply count and log the action
  await incrementAiReplyCount(env.DB, ticket.id);
  await createAiActionLog(env.DB, {
    ticket_id: ticket.id,
    ai_agent_id: aiAgent.id,
    action: "auto_reply",
    metadata: { confidence, reply_count: state.reply_count + 1 },
  });
}
