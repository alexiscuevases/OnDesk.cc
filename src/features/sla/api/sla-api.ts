import { createWorkspaceScopedApi } from "@/lib/crud-api";

export type SlaPriority = "low" | "medium" | "high" | "urgent";
export type SlaStatus =
	| "on_track"
	| "response_breached"
	| "resolution_breached"
	| "met"
	| "paused";

export interface SlaPolicy {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	enabled: boolean;
	applies_to_team_id: string | null;
	applies_to_company_id: string | null;
	applies_to_priority: SlaPriority | null;
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

export interface SlaTracking {
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
	policy_name?: string;
}

export interface CreateSlaPolicyInput {
	workspace_id: string;
	name: string;
	description?: string | null;
	enabled?: boolean;
	applies_to_team_id?: string | null;
	applies_to_company_id?: string | null;
	applies_to_priority?: SlaPriority | null;
	response_low?: number | null;
	response_medium?: number | null;
	response_high?: number | null;
	response_urgent?: number | null;
	resolution_low?: number | null;
	resolution_medium?: number | null;
	resolution_high?: number | null;
	resolution_urgent?: number | null;
	business_hours_only?: boolean;
	business_hours_id?: string | null;
	priority?: number;
}

export type UpdateSlaPolicyInput = Omit<Partial<CreateSlaPolicyInput>, "workspace_id">;

const _api = createWorkspaceScopedApi<SlaPolicy, CreateSlaPolicyInput, UpdateSlaPolicyInput>({
	basePath: "/api/sla-policies",
	listKey: "sla_policies",
	itemKey: "sla_policy",
});

export const apiGetSlaPolicies = _api.getAll;
export const apiGetSlaPolicy = _api.getById;
export const apiCreateSlaPolicy = _api.create;
export const apiUpdateSlaPolicy = (id: string, input: UpdateSlaPolicyInput) => _api.update(id, input);
export const apiDeleteSlaPolicy = _api.delete;

export async function apiGetTicketSla(ticketId: string): Promise<SlaTracking | null> {
	const res = await fetch(`/api/tickets/${ticketId}/sla`, { credentials: "include" });
	if (!res.ok) return null;
	const data = (await res.json()) as { sla: SlaTracking | null };
	return data.sla;
}
