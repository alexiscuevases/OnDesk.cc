import type { Env, AiAgentRow, MailboxIntegrationRow, TicketRow, ContactRow } from "./types";
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
  findAgentTools,
  findWorkspaceById,
} from "./db";
import { refreshAccessToken, replyGraphMail, sendGraphMail } from "./graph";
import { refreshGmailAccessToken, replyGmailMail, sendGmailMail } from "./gmail";
import { buildToolsSection, buildFullSystemPrompt } from "./ai-agent-testing-utils";
import { runAgenticLoop } from "./ai-agent-runtime";

interface PipelineContext {
  ticket: TicketRow;
  mailbox: MailboxIntegrationRow;
  aiAgent: AiAgentRow;
  contact: ContactRow;
  isNewTicket: boolean;
}

async function triggerEscalation(env: Env, ticket: TicketRow, aiAgent: AiAgentRow, reason: string): Promise<void> {
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

  const memberIds = await findWorkspaceMemberIds(env.DB, ticket.workspace_id);
  await Promise.all(
    memberIds.map((uid) =>
      createNotification(env.DB, {
        user_id: uid,
        workspace_id: ticket.workspace_id,
        type: "assign",
        title: "AI escalation - human review required",
        description: `AI agent could not resolve "${ticket.subject}": ${reason}`,
        resource_id: ticket.id,
      }),
    ),
  );
}

export async function runAiAgentPipeline(env: Env, ctx: PipelineContext): Promise<void> {
  const { ticket, mailbox, aiAgent, contact } = ctx;

  const workspace = await findWorkspaceById(env.DB, ticket.workspace_id);

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

  if (state.escalated) return;

  if (aiAgent.max_auto_replies > 0 && state.reply_count >= aiAgent.max_auto_replies) {
    await triggerEscalation(env, ticket, aiAgent, `Maximum auto-reply limit (${aiAgent.max_auto_replies}) reached.`);
    return;
  }

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

  const agentTools = await findAgentTools(env.DB, aiAgent.id);
  const toolsSection = buildToolsSection(agentTools);

  const startSecs = Math.floor(Date.now() / 1000);
  const ticketAgeHours = (startSecs - ticket.created_at) / 3600;

  const systemPrompt = buildFullSystemPrompt({
    agentName: aiAgent.name,
    workspacePrompt: workspace?.workspace_prompt ?? null,
    agentSystemPrompt: aiAgent.system_prompt,
    ticket: {
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      channel: ticket.channel ?? "email",
      created_at: ticket.created_at,
      number: ticket.number,
      ageHours: ticketAgeHours,
    },
    contact: {
      name: contact.name,
      email: contact.email,
      phone: contact.phone ?? null,
      company: null,
    },
    workspace: workspace
      ? {
          name: workspace.name,
          description: workspace.description,
        }
      : undefined,
    toolsSection,
    conversationBlock,
  });

  let loopResult;
  try {
    loopResult = await runAgenticLoop({
      env,
      systemPrompt,
      incomingMessage: `Please reply to this support ticket from ${contact.name}.`,
      agentTools,
    });
  } catch (err: unknown) {
    console.error("AI pipeline: Workers AI call failed", err);
    await createAiActionLog(env.DB, {
      ticket_id: ticket.id,
      ai_agent_id: aiAgent.id,
      action: "escalate",
      metadata: { debug: "Agentic loop failed", error: (err as Error)?.message || String(err) },
    });
    await triggerEscalation(env, ticket, aiAgent, `AI model call failed: ${(err as Error)?.message || "Unknown error"}`);
    return;
  }

  if (loopResult.outcome === "escalate") {
    await triggerEscalation(env, ticket, aiAgent, loopResult.reason || "AI agent determined human intervention is required.");
    return;
  }

  const finalRawText = loopResult.replyText?.trim() ?? "";
  if (!finalRawText) {
    await triggerEscalation(env, ticket, aiAgent, "AI model returned an empty response.");
    return;
  }

  const confidenceValue = loopResult.parsed.confidence || 0;
  if (confidenceValue < aiAgent.confidence_threshold) {
    await triggerEscalation(
      env,
      ticket,
      aiAgent,
      `Confidence ${confidenceValue.toFixed(2)} is below threshold ${aiAgent.confidence_threshold.toFixed(2)}.`,
    );
    return;
  }

  const nowSecs = Math.floor(Date.now() / 1000);
  let accessToken = mailbox.access_token;
  if (mailbox.token_expires_at < nowSecs + 60) {
    try {
      if (mailbox.provider === "google") {
        const refreshed = await refreshGmailAccessToken(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, mailbox.refresh_token);
        accessToken = refreshed.access_token;
        await updateMailboxTokens(env.DB, mailbox.id, {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token ?? mailbox.refresh_token,
          token_expires_at: nowSecs + refreshed.expires_in,
        });
      } else {
        const refreshed = await refreshAccessToken(env.MS_CLIENT_ID, env.MS_CLIENT_SECRET, mailbox.refresh_token);
        accessToken = refreshed.access_token;
        await updateMailboxTokens(env.DB, mailbox.id, {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          token_expires_at: nowSecs + refreshed.expires_in,
        });
      }
    } catch (err) {
      console.error("AI pipeline: token refresh failed", err);
      await triggerEscalation(env, ticket, aiAgent, "Failed to refresh mailbox access token.");
      return;
    }
  }

  const replyHtml = finalRawText
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");

  try {
    const lastInbound = await findLastInboundMessageByTicket(env.DB, ticket.id);
    let sentConversationId: string | undefined;

    if (mailbox.provider === "google") {
      if (lastInbound?.graph_message_id) {
        try {
          await replyGmailMail(accessToken, lastInbound.graph_message_id, replyHtml);
        } catch {
          const result = await sendGmailMail(accessToken, { name: contact.name, address: contact.email }, `Re: ${ticket.subject}`, replyHtml);
          sentConversationId = result.conversationId;
        }
      } else {
        const result = await sendGmailMail(accessToken, { name: contact.name, address: contact.email }, `Re: ${ticket.subject}`, replyHtml);
        sentConversationId = result.conversationId;
      }
    } else {
      if (lastInbound?.graph_message_id) {
        try {
          await replyGraphMail(accessToken, lastInbound.graph_message_id, replyHtml);
        } catch {
          const result = await sendGraphMail(accessToken, { name: contact.name, address: contact.email }, `Re: ${ticket.subject}`, replyHtml);
          sentConversationId = result.conversationId;
        }
      } else {
        const result = await sendGraphMail(accessToken, { name: contact.name, address: contact.email }, `Re: ${ticket.subject}`, replyHtml);
        sentConversationId = result.conversationId;
      }
    }

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

  await createTicketMessage(env.DB, {
    ticket_id: ticket.id,
    author_id: aiAgent.id,
    author_type: "agent",
    type: "message",
    content: replyHtml,
  });

  if (ticket.status === "open") {
    await updateTicket(env.DB, ticket.id, { status: "pending" });
    await createAiActionLog(env.DB, {
      ticket_id: ticket.id,
      ai_agent_id: aiAgent.id,
      action: "status_change",
      metadata: { from: "open", to: "pending" },
    });
  }

  await incrementAiReplyCount(env.DB, ticket.id);
  await createAiActionLog(env.DB, {
    ticket_id: ticket.id,
    ai_agent_id: aiAgent.id,
    action: "auto_reply",
    metadata: {
      confidence: confidenceValue,
      actions_executed: loopResult.actionCount,
      reply_count: state.reply_count + 1,
    },
  });
}
