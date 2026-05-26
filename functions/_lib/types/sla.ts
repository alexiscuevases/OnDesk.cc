import type { TicketPriority } from "./tickets";

export type SlaStatus =
	| "on_track"
	| "response_breached"
	| "resolution_breached"
	| "met"
	| "paused";

export interface SlaPolicyRow {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	enabled: number;
	applies_to_team_id: string | null;
	applies_to_company_id: string | null;
	applies_to_priority: TicketPriority | null;
	response_low: number | null;
	response_medium: number | null;
	response_high: number | null;
	response_urgent: number | null;
	resolution_low: number | null;
	resolution_medium: number | null;
	resolution_high: number | null;
	resolution_urgent: number | null;
	business_hours_only: number;
	business_hours_id: string | null;
	priority: number;
	created_at: number;
	updated_at: number;
}

export interface PublicSlaPolicy {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	enabled: boolean;
	applies_to_team_id: string | null;
	applies_to_company_id: string | null;
	applies_to_priority: TicketPriority | null;
	response_low: number | null;
	response_medium: number | null;
	response_high: number | null;
	response_urgent: number | null;
	resolution_low: number | null;
	resolution_medium: number | null;
	resolution_high: number | null;
	resolution_urgent: number | null;
	business_hours_only: boolean;
	business_hours_id: string | null;
	priority: number;
	created_at: number;
	updated_at: number;
}

export interface SlaTrackingRow {
	id: string;
	workspace_id: string;
	ticket_id: string;
	sla_policy_id: string;
	response_due_at: number | null;
	resolution_due_at: number | null;
	first_response_at: number | null;
	resolved_at: number | null;
	response_breached_at: number | null;
	resolution_breached_at: number | null;
	status: SlaStatus;
	created_at: number;
	updated_at: number;
}

export interface PublicSlaTracking extends SlaTrackingRow {
	policy_name?: string;
}
