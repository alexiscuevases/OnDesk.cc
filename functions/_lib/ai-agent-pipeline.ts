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

interface ExecuteActionToken {
	actionId: string;
	params: Record<string, any>;
}

interface ParsedAgentOutput {
	// The action to execute, if the model requested one
	action: ExecuteActionToken | null;
	// Whether the model explicitly requested human escalation
	escalate: boolean;
	// Optional reason provided alongside escalate action
	escalateReason: string;
	// Confidence score for reply (defaults to 0 if not present)
	confidence: number;
	// The reply text formatted for the user
	cleanText: string;
}

/**
 * Parses JSON action payload from the AI response.
 * Expects the AI to return exactly one JSON object describing its action:
 *
 * {"action": "execute", "actionId": "product_name", "params": { "key": "value" }}
 * {"action": "escalate", "reason": "human required"}
 * {"action": "reply", "message": "Estimado...", "confidence": 0.85}
 * 
 * It extracts the JSON block from inside the raw string to be lenient with
 * markdown formatting (```json ... ```) or conversational prepends.
 */
function parseStructuredTokens(raw: string): ParsedAgentOutput {
	const result: ParsedAgentOutput = {
		action: null,
		escalate: false,
		escalateReason: "",
		confidence: 0,
		cleanText: "",
	};

	try {
		// Find all JSON blocks by counting braces to support consecutive blocks
		// (e.g. AI thinks aloud in one JSON block and concludes in another)
		const jsonBlocks: string[] = [];
		let braceCount = 0;
		let startIndex = -1;

		for (let i = 0; i < raw.length; i++) {
			if (raw[i] === "{") {
				if (braceCount === 0) startIndex = i;
				braceCount++;
			} else if (raw[i] === "}") {
				braceCount--;
				if (braceCount === 0 && startIndex !== -1) {
					jsonBlocks.push(raw.substring(startIndex, i + 1));
					startIndex = -1;
				}
			}
			// Reset if we go below 0 (mismatched closing brace before an opening brace)
			if (braceCount < 0) braceCount = 0;
		}

		if (jsonBlocks.length === 0) {
			result.escalate = true;
			result.escalateReason = "AI produced invalid format (no JSON block found).";
			return result;
		}

		// Try to parse the last valid block (assuming final conclusion is the intended action)
		let payload = null;
		for (let i = jsonBlocks.length - 1; i >= 0; i--) {
			try {
				payload = JSON.parse(jsonBlocks[i]);
				break;
			} catch (e) {
				// Ignore parse errors, try previous block
			}
		}

		if (!payload) {
			result.escalate = true;
			result.escalateReason = "AI produced invalid JSON structure.";
			return result;
		}

		switch (payload.action) {
			case "execute":
				result.action = {
					actionId: payload.actionId || "",
					params: typeof payload.params === "object" && payload.params !== null ? payload.params : {},
				};
				break;
			case "escalate":
				result.escalate = true;
				result.escalateReason = payload.reason || "AI requested escalation.";
				break;
			case "reply":
				result.cleanText = payload.message || "";
				// Make sure confidence is within 0.0 - 1.0 limits
				result.confidence = Math.min(1, Math.max(0, parseFloat(payload.confidence) || 0));
				break;
			default:
				// Unknown action, trigger escalation
				result.escalate = true;
				result.escalateReason = `AI produced unknown action type: ${payload.action}`;
				break;
		}

	} catch (err) {
		result.escalate = true;
		result.escalateReason = "AI produced invalid JSON structure.";
	}

	return result;
}

// ─── Tool Executor ────────────────────────────────────────────────────────────

/**
 * Looks up the matching product + action from the agentTools list and performs
 * the HTTP fetch. Returns a plain object with either the JSON result or an
 * error key so the caller can inject it back into the conversation.
 */
async function executeAction(
	token: ExecuteActionToken,
	agentTools: Awaited<ReturnType<typeof findAgentTools>>,
): Promise<Record<string, any>> {
	// Resolve which product/action matches this actionId (format: ProductName_actionName)
	for (const product of agentTools) {
		const prefix = `${product.name.replace(/\s+/g, "_")}_`;
		if (!token.actionId.startsWith(prefix)) continue;

		const extractedName = token.actionId.substring(prefix.length);
		const action = product.actions.find((a) => a.name === extractedName);
		if (!action) continue;

		const config = product.configuration || {};
		let url = action.endpoint;
		const headers: Record<string, string> = { "Content-Type": "application/json" };

		if (product.auth_type === "api_key" && config.apiKey) {
			headers["Authorization"] = `Bearer ${config.apiKey}`;
		}

		const options: RequestInit = { method: action.method, headers };

		if (action.method === "GET") {
			const qs = new URLSearchParams(
				// URLSearchParams only accepts string values — coerce everything
				Object.fromEntries(Object.entries(token.params).map(([k, v]) => [k, String(v)])),
			);
			url += `?${qs.toString()}`;
		} else {
			options.body = JSON.stringify(token.params);
		}

		try {
			const response = await fetch(url, options);
			const result = await response.json();
			if (!response.ok) {
				return { error: `HTTP ${response.status}`, detail: result };
			}
			return result as Record<string, any>;
		} catch (err: any) {
			return { error: `Fetch failed: ${err?.message ?? String(err)}` };
		}
	}

	// No matching tool found
	return { error: `Tool not found: ${token.actionId}` };
}

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
	const toolsSection =
		agentTools.length > 0
			? "AVAILABLE TOOLS:\n" +
				agentTools
					.flatMap((product) =>
						product.actions.map((action) => {
							const actionId = `${product.name.replace(/\s+/g, "_")}_${action.name}`;
							const actionParams = Array.isArray(action.parameters) ? (action.parameters as any[]) : [];
							const paramsText =
								actionParams.length > 0
									? actionParams
											.map((p: any) => `${p.name} (${p.type ?? "string"}${p.required ? ", required" : ""}): ${p.description ?? ""}`)
											.join(", ")
									: "none";
							return `- actionId: "${actionId}"\n  Description: ${action.description}\n  Parameters: ${paramsText}`;
						}),
					)
					.join("\n")
			: "No tools available.";

	// 6. Build system prompt with structured token instructions
	const basePrompt = `You are ${aiAgent.name}, an automated AI support agent. Your job is to resolve customer support tickets by writing professional, empathetic email replies.

TICKET CONTEXT
- Subject: ${ticket.subject}
- Status: ${ticket.status}
- Priority: ${ticket.priority}
- Channel: ${ticket.channel ?? "email"}
- Created: ${new Date(ticket.created_at * 1000).toISOString()}

${toolsSection}

CONVERSATION HISTORY:
${conversationBlock}

════════════════════════════════════════
RESPONSE FORMAT — STRICT JSON ONLY
════════════════════════════════════════

You MUST output exactly ONE valid JSON object per turn. Do not add conversational text outside the JSON.
You have three possible actions. Choose the appropriate JSON schema:

──────────────────────────────────────
TYPE 1 — EXECUTE A TOOL
──────────────────────────────────────
Use this when you need data from an external system before you can answer.

{
  "_thought": "1. What is my goal? 2. What tool do I need? 3. What parameters does the tool require? 4. Do I have the exact values for ALL required parameters, or do I need to call another tool first to get them?",
  "action": "execute",
  "actionId": "<actionId>",
  "params": { "<key>": "<value>" }
}

Rules:
• You MUST provide a detailed explanation of your thought process in the "_thought" field evaluating the required parameters for the tool you want to call.
• ONLY use actionIds from the AVAILABLE TOOLS list above.
• ONLY call a tool if you have ALL required parameter values. Wait for previous tool results if needed.
• IF a parameter requires an ID/URI from another tool (e.g., event_type URI, user URI), YOU MUST CALL THE TOOL THAT PROVIDES THAT ID FIRST.
• Do NOT invent or guess any parameter value. Do NOT use templates or placeholders (like {user_id}). 
• When you have all the data you need, output a "reply" action.

──────────────────────────────────────
TYPE 2 — FINAL REPLY TO CUSTOMER
──────────────────────────────────────
Use this when you have all the information and are ready to send the email response. Write a professional, empathetic email. Do NOT mention tools, APIs, or internal systems.

{
  "_thought": "<optional: your internal reasoning>",
  "action": "reply",
  "message": "<your email response here>",
  "confidence": 0.85
}

Rules:
• Always sign replies as "${aiAgent.name}".
• "confidence" should be between 0.0 and 1.0 indicating how confident you are that this reply fully resolves the ticket.

──────────────────────────────────────
TYPE 3 — ESCALATE TO HUMAN
──────────────────────────────────────
Use this when you cannot resolve the ticket (error, missing permissions, out-of-scope request, repeated tool failure, etc.).

{
  "_thought": "<optional: why you are escalating>",
  "action": "escalate",
  "reason": "<brief explanation of why human intervention is needed>"
}`;

	const systemPrompt = aiAgent.system_prompt ? `${aiAgent.system_prompt}\n\n${basePrompt}` : basePrompt;

	// 7. Prepare message history — tool results are injected as user messages so
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
			})) as any;

			const rawText: string =
				typeof aiResponse === "string"
					? aiResponse
					: ((aiResponse as { response?: string }).response ?? "");

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
					await triggerEscalation(
						env,
						ticket,
						aiAgent,
						`Safety cap reached: model requested more than ${MAX_ACTIONS} tool executions.`,
					);
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
				const reason =
					parsed.escalateReason || "AI agent determined human intervention is required.";
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
	} catch (err: any) {
		console.error("AI pipeline: Workers AI call failed", err);
		await createAiActionLog(env.DB, {
			ticket_id: ticket.id,
			ai_agent_id: aiAgent.id,
			action: "escalate", // fallback log action if "crash" isn't supported by DB type
			metadata: { debug: "Main catch block hit", error: err?.message || String(err) },
		});
		await triggerEscalation(env, ticket, aiAgent, `AI model call failed: ${err?.message || "Unknown error"}`);
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
				const result = await sendGraphMail(
					accessToken,
					{ name: contact.name, address: contact.email },
					`Re: ${ticket.subject}`,
					replyHtml,
				);
				sentConversationId = result.conversationId;
			}
		} else {
			const result = await sendGraphMail(
				accessToken,
				{ name: contact.name, address: contact.email },
				`Re: ${ticket.subject}`,
				replyHtml,
			);
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
