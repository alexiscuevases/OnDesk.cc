import type { Env } from "./types";
import { AI_MODEL } from "./configs";
import { findMessagesByTicket, createMemory } from "./db";
import { upsertMemory, isDuplicateMemory } from "./vectorize";

export async function extractAndSaveMemories(
	env: Env,
	ticketId: string,
	ticket: { workspace_id: string; contact_id: string; subject: string },
): Promise<void> {
	const messages = await findMessagesByTicket(env.DB, ticketId);
	if (!messages.length) return;

	const conversation = messages
		.slice(-24)
		.map((m) => `[${m.author_type === "agent" ? "Agent" : "Customer"}]: ${m.content}`)
		.join("\n\n");

	const prompt = `You are analyzing a resolved customer support ticket to extract memorable facts about the customer for future reference.

TICKET: ${ticket.subject}

CONVERSATION:
${conversation}

Extract 0 to 3 key facts about this specific customer that would help a support agent in future interactions.
Focus on: preferences, recurring issues, plan/tier, technical setup, language preference, communication style.
Do NOT extract generic ticket summaries — only facts that describe THIS customer specifically.
Output ONLY a valid JSON array of short strings. Example: ["prefers English", "on Business plan", "recurring billing issue"]
If nothing notable, output: []`;

	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = await (env.AI as any).run(AI_MODEL, {
			messages: [{ role: "user" as const, content: prompt }],
			max_tokens: 256,
			stream: false,
		}) as { response?: string };

		const raw = result?.response?.trim() ?? "";
		const match = raw.match(/\[[\s\S]*?\]/);
		if (!match) return;

		const parsed: unknown = JSON.parse(match[0]);
		if (!Array.isArray(parsed)) return;

		const facts = parsed
			.filter((f): f is string => typeof f === "string" && f.trim().length > 0)
			.slice(0, 3);

		for (const content of facts) {
			const trimmed = content.trim();
			const duplicate = await isDuplicateMemory(env, trimmed, ticket.workspace_id, ticket.contact_id);
			if (duplicate) continue;
			const memory = await createMemory(env.DB, ticket.workspace_id, trimmed, ticket.contact_id);
			void upsertMemory(env, memory);
		}
	} catch {
		// best-effort — never break ticket resolution
	}
}
