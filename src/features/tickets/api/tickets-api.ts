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
	subject: string;
	status: TicketStatus;
	priority: TicketPriority;
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

export interface CreateMessageInput {
	content: string;
	type?: MessageType;
}

const API_BASE = "/api/tickets";

export async function apiGetTickets(
	workspaceId: string,
	filters: { status?: TicketStatus; assignee_id?: string; team_id?: string } = {}
): Promise<Ticket[]> {
	const params = new URLSearchParams({ workspace_id: workspaceId });
	if (filters.status) params.set("status", filters.status);
	if (filters.assignee_id) params.set("assignee_id", filters.assignee_id);
	if (filters.team_id) params.set("team_id", filters.team_id);

	const res = await fetch(`${API_BASE}?${params}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch tickets");
	}
	const data = (await res.json()) as { tickets: Ticket[] };
	return data.tickets;
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
