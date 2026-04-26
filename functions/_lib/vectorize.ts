import type { Env } from "./types";

const EMBEDDING_MODEL = "@cf/baai/bge-small-en-v1.5";

async function embed(env: Env, text: string): Promise<number[]> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const res = await (env.AI as any).run(EMBEDDING_MODEL, { text }) as { data: number[][] };
	return res.data[0];
}

// ── Upsert ───────────────────────────────────────────────────────────────────

export async function upsertTicket(
	env: Env,
	ticket: { id: string; workspace_id: string; subject: string; status: string; priority: string; channel?: string | null }
): Promise<void> {
	const text = `${ticket.subject} | status: ${ticket.status} | priority: ${ticket.priority}${ticket.channel ? ` | channel: ${ticket.channel}` : ""}`;
	const values = await embed(env, text);
	await env.VECTORIZE_TICKETS.upsert([{ id: ticket.id, values, metadata: { workspace_id: ticket.workspace_id } }]);
}

export async function upsertMessage(
	env: Env,
	message: { id: string; ticket_id: string; content: string },
	workspaceId: string
): Promise<void> {
	const text = message.content.trim();
	if (!text) return;
	const values = await embed(env, text);
	await env.VECTORIZE_MESSAGES.upsert([{
		id: message.id,
		values,
		metadata: { workspace_id: workspaceId, ticket_id: message.ticket_id },
	}]);
}

export async function upsertContact(
	env: Env,
	contact: { id: string; workspace_id: string; name: string; email: string; phone?: string | null }
): Promise<void> {
	const text = `${contact.name} | ${contact.email}${contact.phone ? ` | ${contact.phone}` : ""}`;
	const values = await embed(env, text);
	await env.VECTORIZE_CONTACTS.upsert([{ id: contact.id, values, metadata: { workspace_id: contact.workspace_id } }]);
}

export async function upsertCompany(
	env: Env,
	company: { id: string; workspace_id: string; name: string; domain?: string | null; description?: string | null }
): Promise<void> {
	const text = `${company.name}${company.domain ? ` | ${company.domain}` : ""}${company.description ? ` | ${company.description}` : ""}`;
	const values = await embed(env, text);
	await env.VECTORIZE_COMPANIES.upsert([{ id: company.id, values, metadata: { workspace_id: company.workspace_id } }]);
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteTicketVector(env: Env, ticketId: string): Promise<void> {
	await env.VECTORIZE_TICKETS.deleteByIds([ticketId]);
}

export async function deleteMessageVectors(env: Env, messageIds: string[]): Promise<void> {
	if (!messageIds.length) return;
	await env.VECTORIZE_MESSAGES.deleteByIds(messageIds);
}

export async function deleteContactVector(env: Env, contactId: string): Promise<void> {
	await env.VECTORIZE_CONTACTS.deleteByIds([contactId]);
}

export async function deleteCompanyVector(env: Env, companyId: string): Promise<void> {
	await env.VECTORIZE_COMPANIES.deleteByIds([companyId]);
}

// ── Search ───────────────────────────────────────────────────────────────────

export async function searchTickets(env: Env, query: string, workspaceId: string, topK = 8): Promise<string[]> {
	const values = await embed(env, query);
	const results = await env.VECTORIZE_TICKETS.query(values, {
		topK,
		returnMetadata: "none",
		filter: { workspace_id: workspaceId },
	});
	return results.matches.map((m) => m.id);
}

export async function searchContacts(env: Env, query: string, workspaceId: string, topK = 8): Promise<string[]> {
	const values = await embed(env, query);
	const results = await env.VECTORIZE_CONTACTS.query(values, {
		topK,
		returnMetadata: "none",
		filter: { workspace_id: workspaceId },
	});
	return results.matches.map((m) => m.id);
}

export async function searchCompanies(env: Env, query: string, workspaceId: string, topK = 5): Promise<string[]> {
	const values = await embed(env, query);
	const results = await env.VECTORIZE_COMPANIES.query(values, {
		topK,
		returnMetadata: "none",
		filter: { workspace_id: workspaceId },
	});
	return results.matches.map((m) => m.id);
}

export async function upsertMemory(
	env: Env,
	memory: { id: string; workspace_id: string; contact_id?: string | null; content: string }
): Promise<void> {
	const values = await embed(env, memory.content);
	const metadata: Record<string, string> = { workspace_id: memory.workspace_id };
	if (memory.contact_id) metadata.contact_id = memory.contact_id;
	await env.VECTORIZE_MEMORIES.upsert([{ id: memory.id, values, metadata }]);
}

export async function deleteMemoryVector(env: Env, memoryId: string): Promise<void> {
	await env.VECTORIZE_MEMORIES.deleteByIds([memoryId]);
}

export async function searchMemories(
	env: Env,
	query: string,
	workspaceId: string,
	contactId?: string | null,
	topK = 6,
): Promise<string[]> {
	const values = await embed(env, query);
	const filter: Record<string, string> = { workspace_id: workspaceId };
	if (contactId) filter.contact_id = contactId;
	const results = await env.VECTORIZE_MEMORIES.query(values, {
		topK,
		returnMetadata: "none",
		filter,
	});
	return results.matches.map((m) => m.id);
}

const MEMORY_DEDUP_THRESHOLD = 0.92;

export async function isDuplicateMemory(
	env: Env,
	content: string,
	workspaceId: string,
	contactId?: string | null,
): Promise<boolean> {
	const values = await embed(env, content);
	const filter: Record<string, string> = { workspace_id: workspaceId };
	if (contactId) filter.contact_id = contactId;
	const results = await env.VECTORIZE_MEMORIES.query(values, {
		topK: 1,
		returnMetadata: "none",
		filter,
	});
	const top = results.matches[0];
	return !!top && top.score >= MEMORY_DEDUP_THRESHOLD;
}
