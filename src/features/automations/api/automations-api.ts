import { createWorkspaceScopedApi, apiFetch } from "@/lib/crud-api";

export type AutomationTriggerType =
	| "ticket.created"
	| "ticket.updated"
	| "ticket.status_changed"
	| "ticket.priority_changed"
	| "ticket.assigned"
	| "message.received"
	| "message.sent"
	| "scheduled.time_since_created"
	| "scheduled.time_since_updated";

export type AutomationConditionField =
	| "subject"
	| "status"
	| "priority"
	| "channel"
	| "assignee_id"
	| "team_id"
	| "contact_id"
	| "contact_email"
	| "company_id"
	| "message_content";

export type AutomationConditionOp =
	| "eq"
	| "neq"
	| "contains"
	| "not_contains"
	| "gt"
	| "lt"
	| "in"
	| "is_empty"
	| "is_not_empty";

export interface AutomationConditionRule {
	field: AutomationConditionField;
	op: AutomationConditionOp;
	value?: string | number | string[] | null;
}

export interface AutomationConditions {
	match: "all" | "any";
	rules: AutomationConditionRule[];
}

export type AutomationActionType =
	| "set_status"
	| "set_priority"
	| "assign_user"
	| "assign_team"
	| "send_canned_reply"
	| "add_internal_note"
	| "escalate_to_human"
	| "stop_processing";

export interface AutomationAction {
	type: AutomationActionType;
	params: Record<string, unknown>;
}

export interface Automation {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	trigger_type: AutomationTriggerType;
	conditions: AutomationConditions;
	actions: AutomationAction[];
	enabled: boolean;
	schedule_minutes: number | null;
	run_order: number;
	run_count: number;
	last_run_at: number | null;
	created_by: string;
	created_at: number;
	updated_at: number;
}

export interface AutomationRun {
	id: string;
	automation_id: string;
	ticket_id: string;
	status: "success" | "error" | "skipped";
	error: string | null;
	created_at: number;
}

export interface CreateAutomationInput {
	workspace_id: string;
	name: string;
	description?: string | null;
	trigger_type: AutomationTriggerType;
	conditions: AutomationConditions;
	actions: AutomationAction[];
	enabled?: boolean;
	schedule_minutes?: number | null;
	run_order?: number;
}

export interface UpdateAutomationInput {
	name?: string;
	description?: string | null;
	trigger_type?: AutomationTriggerType;
	conditions?: AutomationConditions;
	actions?: AutomationAction[];
	enabled?: boolean;
	schedule_minutes?: number | null;
	run_order?: number;
}

const _api = createWorkspaceScopedApi<Automation, CreateAutomationInput, UpdateAutomationInput>({
	basePath: "/api/automations",
	listKey: "automations",
	itemKey: "automation",
});

export const apiGetAutomations = _api.getAll;
export const apiGetAutomation = _api.getById;
export const apiCreateAutomation = _api.create;
export const apiUpdateAutomation = (id: string, input: UpdateAutomationInput) => _api.update(id, input);
export const apiDeleteAutomation = _api.delete;

export async function apiGetAutomationRuns(id: string): Promise<AutomationRun[]> {
	const res = await apiFetch(`/api/automations/${id}`);
	if (!res.ok) {
		const err = (await res.json()) as { error?: string };
		throw new Error(err.error ?? "Failed to load automation runs");
	}
	const data = (await res.json()) as { runs: AutomationRun[] };
	return data.runs ?? [];
}
