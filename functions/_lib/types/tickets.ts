export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketRow {
	id: string;
	workspace_id: string;
	contact_id: string | null;
	assignee_id: string | null;
	team_id: string | null;
	number: number;
	subject: string;
	status: TicketStatus;
	priority: TicketPriority;
	channel: string | null;
	conversation_id: string | null;
	created_at: number;
	updated_at: number;
}

export interface PublicTicket {
	id: string;
	workspace_id: string;
	contact_id: string | null;
	assignee_id: string | null;
	team_id: string | null;
	ai_agent_id: string | null;
	ai_agent_name: string | null;
	ai_escalated: boolean;
	number: number;
	subject: string;
	status: TicketStatus;
	priority: TicketPriority;
	channel: string | null;
	created_at: number;
	updated_at: number;
}

export type MessageType = "message" | "note";
export type AuthorType = "agent" | "contact";

export interface TicketMessageRow {
	id: string;
	ticket_id: string;
	author_id: string;
	author_type: AuthorType;
	type: MessageType;
	content: string;
	graph_message_id: string | null;
	created_at: number;
}

export interface PublicTicketMessage {
	id: string;
	ticket_id: string;
	author_id: string;
	author_type: AuthorType;
	type: MessageType;
	content: string;
	graph_message_id: string | null;
	created_at: number;
}
