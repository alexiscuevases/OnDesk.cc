import { jsonError } from "../../../_lib/response";
import { findTicketById, findMessagesByTicket, isWorkspaceMember, findWorkspaceById } from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";

// POST /api/tickets/:id/ai
// Calls Workers AI with the full ticket context and returns a streaming text response.
export const onRequest = withAuth<"id">(async ({ request, env, payload, params }) => {
	if (request.method !== "POST") return jsonError("Method not allowed", 405);

	const ticketId = params.id;

	// Load ticket and verify workspace membership
	const ticket = await findTicketById(env.DB, ticketId);
	if (!ticket) return jsonError("Ticket not found", 404);

	const member = await isWorkspaceMember(env.DB, ticket.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	// Parse chat history sent from the frontend
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return jsonError("Invalid JSON body");
	}

	const { messages } = body as { messages?: { role: string; content: string }[] };
	if (!Array.isArray(messages) || messages.length === 0) {
		return jsonError("messages array is required");
	}

	// Load the full conversation history from D1 to build context
	const ticketMessages = await findMessagesByTicket(env.DB, ticketId);
	const workspace = await findWorkspaceById(env.DB, ticket.workspace_id);

	// Format the ticket conversation into a readable block for the system prompt
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

	// Build a detailed system prompt grounding the AI in the real ticket context
	const systemPrompt = `
		You are an expert customer support AI assistant embedded inside a helpdesk platform.
		You MUST base all your answers on the ticket context provided below. Never invent information.

		${workspace?.workspace_prompt ? `---\nWORKSPACE PROMPT (additional context)\n${workspace.workspace_prompt}\n` : ""}

		---
		TICKET CONTEXT
		- Subject: ${ticket.subject}
		- Status: ${ticket.status}
		- Priority: ${ticket.priority}
		- Channel: ${ticket.channel ?? "unknown"}
		- Created: ${new Date(ticket.created_at * 1000).toISOString()}
		---

		CONVERSATION HISTORY:
		${conversationBlock}

		---
		Instructions:
		- If asked to summarize, provide a concise summary of the issue and current state.
		- If asked to draft a reply, write a professional and empathetic response to the customer. Output only the email body, no subject line.
		- If asked to extract action items, list clear, actionable tasks in a bullet list.
		- Always respond in plain text. Do NOT use markdown headers (#). You may use **bold**, bullet lists, and line breaks.
		- Keep responses concise and focused.`;

	// Shape messages for the LLM: system prompt first, then the assistant chat history
	const llmMessages = [
		{ role: "system" as const, content: systemPrompt },
		// Pass the conversation from the AI chat panel (strip the initial greeting)
		...messages.map((m) => ({
			role: m.role as "user" | "assistant",
			content: m.content,
		})),
	];

	// Call Workers AI with streaming enabled
	const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
		messages: llmMessages,
		stream: true,
		max_tokens: 1536,
	});

	// Return the stream directly to the client
	return new Response(aiResponse as ReadableStream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
		},
	});
});
