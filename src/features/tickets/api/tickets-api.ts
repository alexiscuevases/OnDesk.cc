export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type MessageType = "message" | "note";
export type AuthorType = "agent" | "contact";

export interface Ticket {
	id: string;
	workspace_id: string;
	contact_id: string | null;
	assignee_id: string | null;
	team_id: string | null;
	ai_agent_id?: string | null;
	ai_agent_name?: string | null;
	ai_escalated?: boolean;
	number: number;
	subject: string;
	status: TicketStatus;
	priority: TicketPriority;
	channel: string | null;
	cc_addresses: string | null; // JSON: {name: string, address: string}[]
	created_at: number;
	updated_at: number;
}

export interface TicketMessage {
	id: string;
	ticket_id: string;
	author_id: string;
	author_type: AuthorType;
	type: MessageType;
	content: string;
	created_at: number;
}

export interface CreateTicketInput {
	workspace_id: string;
	subject: string;
	contact_id?: string;
	assignee_id?: string;
	team_id?: string;
	status?: TicketStatus;
	priority?: TicketPriority;
}

export interface UpdateTicketInput {
	subject?: string;
	status?: TicketStatus;
	priority?: TicketPriority;
	assignee_id?: string | null;
	team_id?: string | null;
	contact_id?: string | null;
}

export interface EmailRecipient {
	name: string;
	address: string;
}

export interface CreateMessageInput {
	content: string;
	type?: MessageType;
	cc?: EmailRecipient[];
	bcc?: EmailRecipient[];
}

const API_BASE = "/api/tickets";

export interface TicketListFilters {
	status?: TicketStatus;
	priority?: TicketPriority;
	assignee_id?: string;
	team_id?: string;
	contact_id?: string;
	search?: string;
}

export interface TicketListPage {
	tickets: Ticket[];
	total: number;
	page: number;
	page_size: number;
}

export type TicketSortField = "number" | "subject" | "priority" | "status" | "created_at" | "updated_at";
export type SortDirection = "asc" | "desc";

export interface TicketSort {
	field: TicketSortField;
	direction: SortDirection;
}

export interface TicketStatusCounts {
	open: number;
	pending: number;
	resolved: number;
	closed: number;
}

export async function apiGetTickets(
	workspaceId: string,
	filters: TicketListFilters = {},
	pagination: { page: number; pageSize: number } = { page: 1, pageSize: 25 },
	sort?: TicketSort
): Promise<TicketListPage> {
	const params = new URLSearchParams({ workspace_id: workspaceId });
	if (filters.status) params.set("status", filters.status);
	if (filters.priority) params.set("priority", filters.priority);
	if (filters.assignee_id) params.set("assignee_id", filters.assignee_id);
	if (filters.team_id) params.set("team_id", filters.team_id);
	if (filters.contact_id) params.set("contact_id", filters.contact_id);
	if (filters.search) params.set("search", filters.search);
	params.set("page", String(pagination.page));
	params.set("page_size", String(pagination.pageSize));
	if (sort) {
		params.set("sort_by", sort.field);
		params.set("sort_dir", sort.direction);
	}

	const res = await fetch(`${API_BASE}?${params}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch tickets");
	}
	return (await res.json()) as TicketListPage;
}

export async function apiGetTicketCounts(workspaceId: string): Promise<TicketStatusCounts> {
	const res = await fetch(`${API_BASE}/counts?workspace_id=${workspaceId}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch ticket counts");
	}
	const data = (await res.json()) as { counts: TicketStatusCounts };
	return data.counts;
}

export async function apiGetTicket(id: string): Promise<Ticket> {
	const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Ticket not found");
	}
	const data = (await res.json()) as { ticket: Ticket };
	return data.ticket;
}

export async function apiCreateTicket(input: CreateTicketInput): Promise<Ticket> {
	const { workspace_id, ...body } = input;
	const res = await fetch(`${API_BASE}?workspace_id=${workspace_id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to create ticket");
	}
	const data = (await res.json()) as { ticket: Ticket };
	return data.ticket;
}

export async function apiUpdateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to update ticket");
	}
	const data = (await res.json()) as { ticket: Ticket };
	return data.ticket;
}

export async function apiDeleteTicket(id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to delete ticket");
	}
}

export async function apiGetTicketMessages(ticketId: string): Promise<TicketMessage[]> {
	const res = await fetch(`${API_BASE}/${ticketId}/messages`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch messages");
	}
	const data = (await res.json()) as { messages: TicketMessage[] };
	return data.messages;
}

export async function apiMergeTickets(targetId: string, sourceIds: string[]): Promise<Ticket> {
	const res = await fetch(`${API_BASE}/${targetId}/merge`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ source_ids: sourceIds }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to merge tickets");
	}
	const data = (await res.json()) as { ticket: Ticket };
	return data.ticket;
}

export async function apiCreateTicketMessage(
	ticketId: string,
	input: CreateMessageInput
): Promise<TicketMessage> {
	const res = await fetch(`${API_BASE}/${ticketId}/messages`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to send message");
	}
	const data = (await res.json()) as { message: TicketMessage };
	return data.message;
}
