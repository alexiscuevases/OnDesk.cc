import type { TicketRow, PublicTicket, TicketStatus, TicketPriority, PublicTicketMessage, MessageType, AuthorType } from "../types";

// ─── Tickets ──────────────────────────────────────────────────────────────────

export interface TicketListFilters {
	status?: TicketStatus;
	priority?: TicketPriority;
	assignee_id?: string;
	team_id?: string;
	contact_id?: string;
	search?: string;
}

export type TicketSortField = "number" | "subject" | "priority" | "status" | "created_at" | "updated_at";
export type SortDirection = "asc" | "desc";

const SORT_EXPRESSIONS: Record<TicketSortField, string> = {
	number: "t.number",
	subject: "t.subject COLLATE NOCASE",
	created_at: "t.created_at",
	updated_at: "t.updated_at",
	// Custom orderings: most urgent / most active first when DESC
	priority: "CASE t.priority WHEN 'urgent' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END",
	status: "CASE t.status WHEN 'open' THEN 4 WHEN 'pending' THEN 3 WHEN 'resolved' THEN 2 WHEN 'closed' THEN 1 ELSE 0 END",
};

function buildTicketFilterClause(workspaceId: string, filters: TicketListFilters): { sql: string; values: (string | null)[] } {
	const conditions = ["t.workspace_id = ?"];
	const values: (string | null)[] = [workspaceId];
	if (filters.status) {
		conditions.push("t.status = ?");
		values.push(filters.status);
	}
	if (filters.priority) {
		conditions.push("t.priority = ?");
		values.push(filters.priority);
	}
	if (filters.assignee_id) {
		conditions.push("t.assignee_id = ?");
		values.push(filters.assignee_id);
	}
	if (filters.team_id) {
		conditions.push("t.team_id = ?");
		values.push(filters.team_id);
	}
	if (filters.contact_id) {
		conditions.push("t.contact_id = ?");
		values.push(filters.contact_id);
	}
	if (filters.search) {
		const q = `%${filters.search.toLowerCase()}%`;
		conditions.push("(LOWER(t.subject) LIKE ? OR LOWER(t.id) LIKE ? OR LOWER(COALESCE(c.name, '')) LIKE ?)");
		values.push(q, q, q);
	}
	return { sql: conditions.join(" AND "), values };
}

export async function findTicketsByWorkspace(
	db: D1Database,
	workspaceId: string,
	filters: TicketListFilters = {},
	pagination: { limit: number; offset: number } = { limit: 25, offset: 0 },
	sort: { field: TicketSortField; direction: SortDirection } = { field: "created_at", direction: "desc" },
): Promise<{ tickets: PublicTicket[]; total: number }> {
	const { sql: whereClause, values } = buildTicketFilterClause(workspaceId, filters);
	const orderExpr = SORT_EXPRESSIONS[sort.field] ?? SORT_EXPRESSIONS.created_at;
	const orderDir = sort.direction === "asc" ? "ASC" : "DESC";
	// Stable secondary sort by id so repeated requests are deterministic
	const orderClause = `${orderExpr} ${orderDir}, t.id ${orderDir}`;

	const countResult = await db
		.prepare(
			`SELECT COUNT(*) AS total
			FROM tickets t
			LEFT JOIN contacts c ON c.id = t.contact_id
			WHERE ${whereClause}`,
		)
		.bind(...values)
		.first<{ total: number }>();
	const total = countResult?.total ?? 0;

	const listResult = await db
		.prepare(
			`SELECT
				t.id,
				t.workspace_id,
				t.contact_id,
				t.assignee_id,
				t.team_id,
				ats.ai_agent_id,
				aa.name AS ai_agent_name,
				COALESCE(ats.escalated, 0) AS ai_escalated,
				t.number,
				t.subject,
				t.status,
				t.priority,
				t.channel,
				t.created_at,
				t.updated_at
			FROM tickets t
			LEFT JOIN ai_ticket_state ats ON ats.ticket_id = t.id
			LEFT JOIN ai_agents aa ON aa.id = ats.ai_agent_id
			LEFT JOIN contacts c ON c.id = t.contact_id
			WHERE ${whereClause}
			ORDER BY ${orderClause}
			LIMIT ? OFFSET ?`,
		)
		.bind(...values, pagination.limit, pagination.offset)
		.all<PublicTicket & { ai_escalated: number | boolean }>();

	const tickets = (listResult.results ?? []).map((ticket) => ({
		...ticket,
		ai_escalated: Boolean(ticket.ai_escalated),
	}));
	return { tickets, total };
}

export async function countTicketsByStatus(
	db: D1Database,
	workspaceId: string,
): Promise<Record<TicketStatus, number>> {
	const result = await db
		.prepare("SELECT status, COUNT(*) AS count FROM tickets WHERE workspace_id = ? GROUP BY status")
		.bind(workspaceId)
		.all<{ status: TicketStatus; count: number }>();
	const counts: Record<TicketStatus, number> = { open: 0, pending: 0, resolved: 0, closed: 0 };
	for (const row of result.results ?? []) {
		counts[row.status] = row.count;
	}
	return counts;
}

export async function findTicketById(db: D1Database, ticketId: string): Promise<TicketRow | null> {
	const result = await db.prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1").bind(ticketId).first<TicketRow>();
	return result ?? null;
}

export async function findTicketByThreadId(db: D1Database, workspaceId: string, threadId: string): Promise<TicketRow | null> {
	const result = await db
		.prepare("SELECT * FROM tickets WHERE workspace_id = ? AND thread_id = ? ORDER BY created_at ASC LIMIT 1")
		.bind(workspaceId, threadId)
		.first<TicketRow>();
	return result ?? null;
}

export async function createTicket(
	db: D1Database,
	workspaceId: string,
	data: {
		subject: string;
		contact_id?: string;
		assignee_id?: string;
		team_id?: string;
		status?: TicketStatus;
		priority?: TicketPriority;
		channel?: string;
		thread_id?: string;
		cc_addresses?: string; // JSON: {name, address}[]
	},
): Promise<TicketRow> {
	const id = crypto.randomUUID();
	// Compute next sequential number for this workspace
	const row = await db.prepare("SELECT COALESCE(MAX(number), 0) + 1 AS next FROM tickets WHERE workspace_id = ?").bind(workspaceId).first<{ next: number }>();
	const number = row?.next ?? 1;
	await db
		.prepare(
			`INSERT INTO tickets (id, workspace_id, contact_id, assignee_id, team_id, number, subject, status, priority, channel, thread_id, cc_addresses)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			workspaceId,
			data.contact_id ?? null,
			data.assignee_id ?? null,
			data.team_id ?? null,
			number,
			data.subject,
			data.status ?? "open",
			data.priority ?? "medium",
			data.channel ?? null,
			data.thread_id ?? null,
			data.cc_addresses ?? null,
		)
		.run();
	return (await findTicketById(db, id))!;
}

export async function updateTicket(
	db: D1Database,
	ticketId: string,
	data: {
		subject?: string;
		status?: TicketStatus;
		priority?: TicketPriority;
		assignee_id?: string | null;
		team_id?: string | null;
		contact_id?: string | null;
		thread_id?: string | null;
		channel?: string | null;
		cc_addresses?: string | null; // JSON: {name, address}[]
	},
): Promise<void> {
	const fields: string[] = [];
	const values: (string | null)[] = [];
	if (data.subject !== undefined) {
		fields.push("subject = ?");
		values.push(data.subject);
	}
	if (data.status !== undefined) {
		fields.push("status = ?");
		values.push(data.status);
	}
	if (data.priority !== undefined) {
		fields.push("priority = ?");
		values.push(data.priority);
	}
	if (data.assignee_id !== undefined) {
		fields.push("assignee_id = ?");
		values.push(data.assignee_id);
	}
	if (data.team_id !== undefined) {
		fields.push("team_id = ?");
		values.push(data.team_id);
	}
	if (data.contact_id !== undefined) {
		fields.push("contact_id = ?");
		values.push(data.contact_id);
	}
	if (data.thread_id !== undefined) {
		fields.push("thread_id = ?");
		values.push(data.thread_id);
	}
	if (data.channel !== undefined) {
		fields.push("channel = ?");
		values.push(data.channel);
	}
	if (data.cc_addresses !== undefined) {
		fields.push("cc_addresses = ?");
		values.push(data.cc_addresses);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(ticketId);
	await db
		.prepare(`UPDATE tickets SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteTicket(db: D1Database, ticketId: string): Promise<void> {
	await db.prepare("DELETE FROM ticket_messages WHERE ticket_id = ?").bind(ticketId).run();
	await db.prepare("DELETE FROM email_tickets WHERE ticket_id = ?").bind(ticketId).run();
	await db.prepare("DELETE FROM tickets WHERE id = ?").bind(ticketId).run();
}

// ─── Ticket Messages ──────────────────────────────────────────────────────────

export async function findMessagesByTicket(db: D1Database, ticketId: string): Promise<PublicTicketMessage[]> {
	const result = await db
		.prepare(
			"SELECT id, ticket_id, author_id, author_type, type, content, provider_message_id, created_at FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC",
		)
		.bind(ticketId)
		.all<PublicTicketMessage>();
	return result.results ?? [];
}

export async function findLastInboundMessageByTicket(db: D1Database, ticketId: string): Promise<PublicTicketMessage | null> {
	const result = await db
		.prepare(
			"SELECT id, ticket_id, author_id, author_type, type, content, provider_message_id, created_at FROM ticket_messages WHERE ticket_id = ? AND author_type = 'contact' AND provider_message_id IS NOT NULL ORDER BY created_at DESC LIMIT 1",
		)
		.bind(ticketId)
		.first<PublicTicketMessage>();
	return result ?? null;
}

export async function createTicketMessage(
	db: D1Database,
	data: {
		ticket_id: string;
		author_id: string;
		author_type: AuthorType;
		type: MessageType;
		content: string;
		provider_message_id?: string;
	},
): Promise<PublicTicketMessage> {
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO ticket_messages (id, ticket_id, author_id, author_type, type, content, provider_message_id) VALUES (?, ?, ?, ?, ?, ?, ?)")
		.bind(id, data.ticket_id, data.author_id, data.author_type, data.type, data.content, data.provider_message_id ?? null)
		.run();
	// bump ticket updated_at
	await db.prepare("UPDATE tickets SET updated_at = unixepoch() WHERE id = ?").bind(data.ticket_id).run();
	const result = await db.prepare("SELECT * FROM ticket_messages WHERE id = ? LIMIT 1").bind(id).first<PublicTicketMessage>();
	return result!;
}

export async function deleteTicketMessage(db: D1Database, messageId: string): Promise<void> {
	await db.prepare("DELETE FROM ticket_messages WHERE id = ?").bind(messageId).run();
}
