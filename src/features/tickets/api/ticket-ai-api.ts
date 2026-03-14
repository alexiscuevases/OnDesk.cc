export interface AIChatMessage {
	role: "user" | "assistant";
	content: string;
}

/**
 * Converts plain text from the LLM into HTML that TipTap can render properly.
 * Handles:
 *  - Blank-line-separated blocks → <p> paragraphs
 *  - Lines starting with '- ' or '• ' → <ul><li> lists
 *  - **bold** markers → <strong>
 */
export function plainTextToHtml(text: string): string {
	// Split into blocks separated by one or more blank lines
	const blocks = text.split(/\n{2,}/);

	const htmlBlocks = blocks.map((block) => {
		const lines = block.split("\n").filter((l) => l.trim().length > 0);
		if (lines.length === 0) return "";

		// Check if every non-empty line is a list item
		const isAllListItems = lines.every((l) => /^[-•*]\s/.test(l.trim()));

		if (isAllListItems) {
			const items = lines
				.map((l) => `<li>${applyInlineFormatting(l.replace(/^[-•*]\s+/, "").trim())}</li>`)
				.join("");
			return `<ul>${items}</ul>`;
		}

		// Otherwise wrap each line as a <p>
		return lines.map((l) => `<p>${applyInlineFormatting(l)}</p>`).join("");
	});

	return htmlBlocks.filter(Boolean).join("");
}

/** Converts **bold** markers to <strong> tags. */
export function applyInlineFormatting(text: string): string {
	return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

/**
 * Streams an AI response from the ticket AI endpoint and calls onChunk with each token.
 * @param ticketId - The ticket ID
 * @param messages - Chat history to send to the AI
 * @param onChunk - Callback fired for each token received
 * @throws Error if the request fails or stream parsing fails
 */
export async function streamTicketAI(
	ticketId: string,
	messages: AIChatMessage[],
	onChunk: (token: string) => void
): Promise<void> {
	const response = await fetch(`/api/tickets/${ticketId}/ai`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ messages }),
		credentials: "include",
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(errText || `HTTP ${response.status}`);
	}

	// Read the SSE stream and call onChunk for each token
	const reader = response.body!.getReader();
	const decoder = new TextDecoder();

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		// Workers AI streams Server-Sent Events: "data: {...}\n\n"
		const chunk = decoder.decode(value, { stream: true });
		const lines = chunk.split("\n");

		for (const line of lines) {
			if (!line.startsWith("data: ")) continue;
			const data = line.slice(6).trim();
			if (data === "[DONE]") break;

			try {
				const parsed = JSON.parse(data) as { response?: string };
				if (parsed.response) {
					onChunk(parsed.response);
				}
			} catch {
				// Ignore malformed SSE chunks
			}
		}
	}
}
