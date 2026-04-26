export type AiAgentStatus = "active" | "inactive";
export type AiAgentAction = "auto_reply" | "escalate" | "status_change" | "note_added" | "routed";

export interface AiAgentRow {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	status: AiAgentStatus;
	system_prompt: string | null;
	confidence_threshold: number;
	max_auto_replies: number;
	created_by: string;
	created_at: number;
	updated_at: number;
}

export interface PublicAiAgent {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	status: AiAgentStatus;
	system_prompt: string | null;
	confidence_threshold: number;
	max_auto_replies: number;
	created_by: string;
	created_at: number;
	updated_at: number;
}

export interface AiAgentMailboxRow {
	id: string;
	ai_agent_id: string;
	mailbox_integration_id: string;
	enabled: number;
	created_at: number;
}

export interface PublicAiAgentMailbox {
	id: string;
	ai_agent_id: string;
	mailbox_integration_id: string;
	mailbox_email: string;
	enabled: boolean;
	created_at: number;
}

export interface AiTicketStateRow {
	id: string;
	ticket_id: string;
	ai_agent_id: string;
	reply_count: number;
	escalated: number;
	escalated_at: number | null;
	escalation_note: string | null;
	created_at: number;
	updated_at: number;
}

export interface PublicAiTicketState {
	id: string;
	ticket_id: string;
	ai_agent_id: string;
	reply_count: number;
	escalated: boolean;
	escalated_at: number | null;
	escalation_note: string | null;
	created_at: number;
	updated_at: number;
}

export interface AiActionLogRow {
	id: string;
	ticket_id: string;
	ai_agent_id: string;
	action: AiAgentAction;
	metadata: string | null;
	created_at: number;
}

export interface PublicAiActionLog {
	id: string;
	ticket_id: string;
	ai_agent_id: string;
	action: AiAgentAction;
	metadata: Record<string, unknown> | null;
	created_at: number;
}

// ─── AI Memories ──────────────────────────────────────────────────────────────

export interface AiMemoryRow {
	id: string;
	workspace_id: string;
	contact_id: string | null;
	content: string;
	last_referenced_at: number | null;
	expires_at: number | null;
	created_at: number;
}

export interface PublicAiMemory {
	id: string;
	workspace_id: string;
	contact_id: string | null;
	content: string;
	last_referenced_at: number | null;
	expires_at: number | null;
	created_at: number;
}
