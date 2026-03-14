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

// Parse the CONFIDENCE:0.XX and ESCALATE: true/false suffixes
// Returns { text, confidence, escalate }
function parseAgentOutput(raw: string): { text: string; confidence: number; escalate: boolean } {
	let text = raw.trim();
	let confidence = 0.0;
	let escalate = false;

	const escalateMatch = text.match(/[\s\n]*\**ESCALATE\**\s*:\s*(true|false)\s*\*?/i);
	if (escalateMatch) {
		escalate = escalateMatch[1].toLowerCase() === "true";
		text = text.replace(escalateMatch[0], "").trim();
	}

	const confidenceMatch = text.match(/[\s\n]*\**CONFIDENCE\**\s*:\s*([\d.]+)\s*\*?/i);
	if (confidenceMatch) {
		confidence = Math.min(1, Math.max(0, parseFloat(confidenceMatch[1]) || 0));
		text = text.replace(confidenceMatch[0], "").trim();
	}

	const escalateMatch2 = text.match(/[\s\n]*\**ESCALATE\**\s*:\s*(true|false)\s*\*?/i);
	if (escalateMatch2) {
		escalate = escalateMatch2[1].toLowerCase() === "true";
		text = text.replace(escalateMatch2[0], "").trim();
	}

	return { text, confidence, escalate };
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

	// 5. Tool Context & System Prompt
	const agentTools = await findAgentTools(env.DB, aiAgent.id);
	const tools = agentTools.flatMap((product) =>
		product.actions.map((action) => ({
			name: `${product.name.replace(/\s+/g, "_")}_${action.name}`,
			description: action.description,
			parameters: {
				type: "object",
				properties: action.parameters || {},
				required: Object.keys(action.parameters || {}),
			},
		})),
	);

	const toolsDescription = tools.length > 0
		? "AVAILABLE TOOLS:\n" + tools.map(t => `- ${t.name}: ${t.description}\n  Required data: ${t.parameters.required.join(", ") || "none"}`).join("\n")
		: "No tools available.";

	const basePrompt = `You are ${aiAgent.name}, an automated AI support agent. Your job is to resolve customer support tickets by writing professional, empathetic email replies.

TICKET CONTEXT
- Subject: ${ticket.subject}
- Status: ${ticket.status}
- Priority: ${ticket.priority}
- Channel: ${ticket.channel ?? "email"}
- Created: ${new Date(ticket.created_at * 1000).toISOString()}

${toolsDescription}

CONVERSATION HISTORY:
${conversationBlock}

PIPELINE RULES:
1. CHECK TOOL CAPABILITY: If the customer asks for something and you don't have a tool for it in AVAILABLE TOOLS, DO NOT say "I cannot do that". Instead, politely inform the user that you will transfer them to the responsible department, and append ESCALATE: true.
2. CHECK REQUIRED DATA: If you HAVE a tool to fulfill the request, check if you have all the required parameters based on the conversation history. If any data is missing, reply asking the customer SPECIFICALLY for the missing data. Do NOT invent data.
3. EXECUTE TOOL MUST BE SILENT: If you have all required data to execute a tool, YOU MUST OMIT ANY EMAIL TEXT. SIMPLY CALL THE TOOL NATIVELY USING YOUR NATIVE FUNCTION CALLING CAPABILITY. Do NOT write "[Insertar resultado]" or "I will use a tool" or ANY TEXT AT ALL. Just call the tool.
4. TOOL RESULT: Once you receive the tool's JSON result in the conversation history, use that data to write your email. Do NOT mention the name of the tool, APIs, or "sistema" to the user. Just provide the information naturally. If the tool failed, politely apologize, say you will transfer them to a human agent, and append ESCALATE: true.
5. Always sign as "${aiAgent.name}".

WHEN TO OUTPUT TEXT:
- ONLY output an email body if you are NOT calling a tool right now (e.g. asking for missing data, or you already have the tool result, or escalating).
- If you output an email body, you MUST append on a new line: CONFIDENCE:0.XX
- If human intervention is required, you MUST append on a new line: ESCALATE: true

Example response (NO tools needed / tool already executed):
Estimado Alexis, no cuento con la información para este proceso, por lo cual lo transferiré al área encargada.
Atentamente, ${aiAgent.name}
CONFIDENCE:0.95
ESCALATE: true`;

	const systemPrompt = aiAgent.system_prompt ? `${aiAgent.system_prompt}\n\n${basePrompt}` : basePrompt;

	// 6. Tool Calling Integration is now handled above for prompt context

	// 7. Call Workers AI
	let messages = [
		{ role: "system", content: systemPrompt },
		{ role: "user", content: `Please reply to this support ticket from ${contact.name}.` },
	];

	let rawText = "";
	try {
		// Debug Log: Tools and Messages
		await createAiActionLog(env.DB, {
			ticket_id: ticket.id,
			ai_agent_id: aiAgent.id,
			action: "auto_reply",
			metadata: { 
				debug: "AI Call 1", 
				num_tools: tools.length, 
				tool_names: tools.map(t => t.name)
			},
		});

		const aiResponse = (await env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
			messages,
			tools: tools.length > 0 ? tools : undefined,
			stream: false,
			max_tokens: 1024,
		})) as any;

		// Debug Log: AI Response
		await createAiActionLog(env.DB, {
			ticket_id: ticket.id,
			ai_agent_id: aiAgent.id,
			action: "auto_reply",
			metadata: { 
				debug: "AI Response 1", 
				has_tool_calls: !!aiResponse.tool_calls,
				num_tool_calls: aiResponse.tool_calls?.length || 0,
				content_preview: aiResponse.response?.substring(0, 50) || "no content"
			},
		});

		// Handle tool calls if any
		if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
			// Push the assistant's intent to call tools once
			messages.push({ role: "assistant", content: "", tool_calls: aiResponse.tool_calls } as any);

			for (const call of aiResponse.tool_calls) {
				// Find which product this tool belongs to by checking if call.name starts with the product prefix
				let targetAction;
				let targetProduct;

				for (const product of agentTools) {
					const productPrefix = `${product.name.replace(/\s+/g, "_")}_`;
					if (call.name.startsWith(productPrefix)) {
						const extractedActionName = call.name.substring(productPrefix.length);
						const action = product.actions.find((a) => a.name === extractedActionName);
						if (action) {
							targetProduct = product;
							targetAction = action;
							break;
						}
					}
				}

				if (targetAction && targetProduct) {
					const product = targetProduct;
					const action = targetAction;
					// Execute the tool action
					try {
						const config = product.configuration || {};
						let url = action.endpoint;
						const options: RequestInit = {
							method: action.method,
							headers: {
								"Content-Type": "application/json",
							},
						};

						// Authentication handling
						if (product.auth_type === "api_key" && config.apiKey) {
							options.headers = { ...options.headers, Authorization: `Bearer ${config.apiKey}` };
						}

						// Robustly parse arguments (workers AI may return them as a JSON string instead of an object)
						let parsedArgs: any = call.arguments;
						if (typeof call.arguments === "string") {
							try {
								parsedArgs = JSON.parse(call.arguments);
							} catch {
								parsedArgs = {};
							}
						}

						// Safe log before fetch
						await createAiActionLog(env.DB, {
							ticket_id: ticket.id,
							ai_agent_id: aiAgent.id,
							action: "auto_reply",
							metadata: { debug: "Before Fetch", tool: call.name, url: url, args: parsedArgs },
						});

						if (action.method === "GET") {
							const params = new URLSearchParams(parsedArgs);
							url += `?${params.toString()}`;
						} else {
							options.body = JSON.stringify(parsedArgs);
						}

						const response = await fetch(url, options);
						const result = await response.json();

						// Log the tool usage
						await createAiActionLog(env.DB, {
							ticket_id: ticket.id,
							ai_agent_id: aiAgent.id,
							action: "auto_reply", // Reuse for now, ideally 'tool_call'
							metadata: { tool: call.name, success: response.ok, status: response.status },
						});

						messages.push({ role: "tool", name: call.name, content: JSON.stringify(result) } as any);
					} catch (toolErr: any) {
						// Log execution crash for specific tool
						await createAiActionLog(env.DB, {
							ticket_id: ticket.id,
							ai_agent_id: aiAgent.id,
							action: "auto_reply",
							metadata: { debug: "Tool execution CRASH", tool: call.name, error: toolErr?.message || String(toolErr) },
						});
						messages.push({ role: "tool", name: call.name, content: JSON.stringify({ error: `Tool execution failed: ${toolErr?.message || 'Unknown error'}` }) } as any);
					}
				} else {
					// Log missing product/action mismatch
					await createAiActionLog(env.DB, {
						ticket_id: ticket.id,
						ai_agent_id: aiAgent.id,
						action: "auto_reply",
						metadata: { debug: "Tool Not Found Error", requested_tool: call.name },
					});
					messages.push({ role: "tool", name: call.name, content: JSON.stringify({ error: "Tool not found or not assigned to agent" }) } as any);
				}
			}

			// Pre-final AI log
			await createAiActionLog(env.DB, {
				ticket_id: ticket.id,
				ai_agent_id: aiAgent.id,
				action: "auto_reply",
				metadata: { debug: "Calling AI second pass with tool results" },
			});

			// Final call after tool results
			const finalAiResponse = (await env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
				messages,
				stream: false,
				max_tokens: 1024,
			})) as { response?: string } | string;

			rawText = typeof finalAiResponse === "string" ? finalAiResponse : ((finalAiResponse as { response?: string }).response ?? "");
		} else {
			rawText = typeof aiResponse === "string" ? aiResponse : ((aiResponse as { response?: string }).response ?? "");
		}
	} catch (err: any) {
		console.error("AI pipeline: Workers AI call failed", err);
		// Log the catastrophic crash
		await createAiActionLog(env.DB, {
			ticket_id: ticket.id,
			ai_agent_id: aiAgent.id,
			action: "crash",
			metadata: { debug: "Main catch block hit", error: err?.message || String(err) },
		});
		await triggerEscalation(env, ticket, aiAgent, `AI model call failed: ${err?.message || 'Unknown error'}`);
		return;
	}

	if (!rawText.trim()) {
		await triggerEscalation(env, ticket, aiAgent, "AI model returned an empty response.");
		return;
	}

	// 8. Parse output & Sanitize (Remove any unintentional JSON leakage)
	const sanitizedText = rawText.replace(/```json[\s\S]*?```/gi, "").replace(/\{[\s\S]*?"name"[\s\S]*?"parameters"[\s\S]*?\}/g, "").trim();
	const { text: replyText, confidence, escalate } = parseAgentOutput(sanitizedText);

	// 9. Confidence check & Agent Escalate — silent escalate if below threshold and not gracefully handled
	let escalateReason = "";
	if (escalate) {
		escalateReason = "AI Agent determined human intervention is required based on the conversation.";
	} else if (confidence < aiAgent.confidence_threshold) {
		await triggerEscalation(env, ticket, aiAgent, `Confidence ${confidence.toFixed(2)} is below threshold ${aiAgent.confidence_threshold.toFixed(2)}.`);
		return;
	}

	// 9. Get a valid access token
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
				const result = await sendGraphMail(accessToken, { name: contact.name, address: contact.email }, `Re: ${ticket.subject}`, replyHtml);
				sentConversationId = result.conversationId;
			}
		} else {
			const result = await sendGraphMail(accessToken, { name: contact.name, address: contact.email }, `Re: ${ticket.subject}`, replyHtml);
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

	// 12. Move ticket to pending if it was open unless escalating
	if (escalateReason) {
		await triggerEscalation(env, ticket, aiAgent, escalateReason);
	} else if (ticket.status === "open") {
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
		metadata: { confidence, escalate, reply_count: state.reply_count + 1 },
	});
}
