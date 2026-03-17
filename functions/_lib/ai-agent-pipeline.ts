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
	findAgentTools,
	findWorkspaceById,
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

// ─── Structured Token Types ───────────────────────────────────────────────────

import { parseStructuredTokens, executeAction, type ParsedAgentOutput, buildToolsSection, buildFullSystemPrompt } from "./ai-agent-testing-utils";

// ─── Escalation Helper ────────────────────────────────────────────────────────

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
			}),
		),
	);
}

// ─── Main Pipeline ────────────────────────────────────────────────────────────

export async function runAiAgentPipeline(env: Env, ctx: PipelineContext): Promise<void> {
	const { ticket, mailbox, aiAgent, contact } = ctx;

	const workspace = await findWorkspaceById(env.DB, ticket.workspace_id);

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
		await triggerEscalation(env, ticket, aiAgent, `Maximum auto-reply limit (${aiAgent.max_auto_replies}) reached.`);
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

	// 5. Load agent tools and build the tools description for the prompt
	const agentTools = await findAgentTools(env.DB, aiAgent.id);
	const toolsSection = buildToolsSection(agentTools);

	// 6. Compute ticket age in hours for SLA-aware urgency framing
	const startSecs = Math.floor(Date.now() / 1000);
	const ticketAgeHours = (startSecs - ticket.created_at) / 3600;

	// 7. Build system prompt using centralized utility
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
			// company_id is a FK — the company name is not in ContactRow directly,
			// but pass what we have; enrichment can be added when company join is available
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

	// 8. Prepare message history — tool results are injected as user messages so
	//    the model sees them in the next iteration without needing native tool-call support
	const messages: Array<{ role: string; content: string }> = [
		{ role: "system", content: systemPrompt },
		{ role: "user", content: `Please reply to this support ticket from ${contact.name}.` },
	];

	// Track executed action fingerprints to detect infinite loops
	const executedActions = new Set<string>();
	// Hard safety cap — exists only as a last resort against runaway models
	const MAX_ACTIONS = 10;
	let actionCount = 0;
	let finalRawText = "";

	// 8. Agentic loop — continues only while the model requests tool execution
	let lastParsed: ParsedAgentOutput;
	try {
		while (true) {
			await createAiActionLog(env.DB, {
				ticket_id: ticket.id,
				ai_agent_id: aiAgent.id,
				action: "auto_reply",
				metadata: {
					debug: `AI call — action_count: ${actionCount}`,
					num_tools: agentTools.length,
					message_count: messages.length,
				},
			});

			// Call AI without native tools — the model uses structured tokens instead
			const aiResponse = (await env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
				messages,
				stream: false,
				max_tokens: 1024,
			})) as { response?: string } | string;

			const rawText: string = typeof aiResponse === "string" ? aiResponse : ((aiResponse as { response?: string }).response ?? "");

			const parsed = parseStructuredTokens(rawText);
			lastParsed = parsed;

			await createAiActionLog(env.DB, {
				ticket_id: ticket.id,
				ai_agent_id: aiAgent.id,
				action: "auto_reply",
				metadata: {
					debug: "AI response parsed",
					has_action: !!parsed.action,
					escalate: parsed.escalate,
					confidence: parsed.confidence,
					preview: rawText,
				},
			});

			// ── Branch: model requested a tool execution ──────────────────────
			if (parsed.action) {
				// Safety cap check
				if (actionCount >= MAX_ACTIONS) {
					await triggerEscalation(env, ticket, aiAgent, `Safety cap reached: model requested more than ${MAX_ACTIONS} tool executions.`);
					return;
				}

				// Duplicate action detection — same actionId + same params = infinite loop
				const fingerprint = `${parsed.action.actionId}:${JSON.stringify(parsed.action.params)}`;
				if (executedActions.has(fingerprint)) {
					await triggerEscalation(
						env,
						ticket,
						aiAgent,
						`Loop detected: action "${parsed.action.actionId}" was requested twice with identical parameters.`,
					);
					return;
				}
				executedActions.add(fingerprint);
				actionCount++;

				await createAiActionLog(env.DB, {
					ticket_id: ticket.id,
					ai_agent_id: aiAgent.id,
					action: "auto_reply",
					metadata: {
						debug: "Executing tool",
						actionId: parsed.action.actionId,
						params: parsed.action.params,
					},
				});

				// Execute the tool and capture result
				const toolResult = await executeAction(parsed.action, agentTools);

				await createAiActionLog(env.DB, {
					ticket_id: ticket.id,
					ai_agent_id: aiAgent.id,
					action: "auto_reply",
					metadata: {
						debug: "Tool result",
						actionId: parsed.action.actionId,
						has_error: "error" in toolResult,
						result_preview: JSON.stringify(toolResult),
					},
				});

				// Inject the tool result back as an assistant+user exchange so the
				// model sees what happened and can decide the next step
				messages.push({
					role: "assistant",
					content: JSON.stringify({
						action: "execute",
						actionId: parsed.action.actionId,
						params: parsed.action.params,
					}),
				});
				messages.push({
					role: "user",
					content: `Tool result for "${parsed.action.actionId}": ${JSON.stringify(toolResult)}`,
				});

				// Continue loop — model will decide whether to call another tool or reply
				continue;
			}

			// ── Branch: model requested escalation ───────────────────────────
			if (parsed.escalate) {
				const reason = parsed.escalateReason || "AI agent determined human intervention is required.";
				await triggerEscalation(env, ticket, aiAgent, reason);
				return;
			}

			// ── Branch: final reply ───────────────────────────────────────────
			finalRawText = parsed.cleanText;

			await createAiActionLog(env.DB, {
				ticket_id: ticket.id,
				ai_agent_id: aiAgent.id,
				action: "auto_reply",
				metadata: {
					debug: "Final reply produced",
					confidence: parsed.confidence,
					preview: finalRawText,
				},
			});
			// Expose parsed globally to the function context to access in confidence check below
			// Using an ugly block variable expose approach due to previous scope
			break;
		}
	} catch (err: unknown) {
		console.error("AI pipeline: Workers AI call failed", err);
		await createAiActionLog(env.DB, {
			ticket_id: ticket.id,
			ai_agent_id: aiAgent.id,
			action: "escalate", // fallback log action if "crash" isn't supported by DB type
			metadata: { debug: "Main catch block hit", error: (err as Error)?.message || String(err) },
		});
		await triggerEscalation(env, ticket, aiAgent, `AI model call failed: ${(err as Error)?.message || "Unknown error"}`);
		return;
	}

	// 9. Guard: empty response
	if (!finalRawText.trim()) {
		await triggerEscalation(env, ticket, aiAgent, "AI model returned an empty response.");
		return;
	}

	// 10. Confidence check — silent escalation if below threshold
	//     Uses confidence parsed from the JSON payload.
	const confidenceValue = lastParsed!.confidence || 0;

	if (confidenceValue < aiAgent.confidence_threshold) {
		await triggerEscalation(
			env,
			ticket,
			aiAgent,
			`Confidence ${confidenceValue.toFixed(2)} is below threshold ${aiAgent.confidence_threshold.toFixed(2)}.`,
		);
		return;
	}

	// 11. Refresh access token if close to expiry
	const nowSecs = Math.floor(Date.now() / 1000);
	let accessToken = mailbox.access_token;
	if (mailbox.token_expires_at < nowSecs + 60) {
		try {
			const refreshed = await refreshAccessToken(env.MS_CLIENT_ID, env.MS_CLIENT_SECRET, mailbox.refresh_token);
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

	// 12. Convert reply to HTML for email clients
	const replyHtml = finalRawText
		.split(/\n{2,}/)
		.map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
		.join("");

	// 13. Send the email reply
	try {
		const lastInbound = await findLastInboundMessageByTicket(env.DB, ticket.id);
		let sentConversationId: string | undefined;

		if (lastInbound?.graph_message_id) {
			try {
				await replyGraphMail(accessToken, lastInbound.graph_message_id, replyHtml);
			} catch {
				// Fallback to send new mail if reply-to fails
				const result = await sendGraphMail(accessToken, { name: contact.name, address: contact.email }, `Re: ${ticket.subject}`, replyHtml);
				sentConversationId = result.conversationId;
			}
		} else {
			const result = await sendGraphMail(accessToken, { name: contact.name, address: contact.email }, `Re: ${ticket.subject}`, replyHtml);
			sentConversationId = result.conversationId;
		}

		// Persist conversationId on first outbound message
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

	// 14. Persist reply message in the ticket conversation
	const htmlContent = finalRawText
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

	// 15. Move ticket to pending if it was open
	if (ticket.status === "open") {
		await updateTicket(env.DB, ticket.id, { status: "pending" });
		await createAiActionLog(env.DB, {
			ticket_id: ticket.id,
			ai_agent_id: aiAgent.id,
			action: "status_change",
			metadata: { from: "open", to: "pending" },
		});
	}

	// 16. Increment reply count and log summary
	await incrementAiReplyCount(env.DB, ticket.id);
	await createAiActionLog(env.DB, {
		ticket_id: ticket.id,
		ai_agent_id: aiAgent.id,
		action: "auto_reply",
		metadata: {
			confidence: confidenceValue,
			actions_executed: actionCount,
			reply_count: state.reply_count + 1,
		},
	});
}
