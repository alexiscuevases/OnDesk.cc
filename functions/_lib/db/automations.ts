import type {
	AutomationRow,
	PublicAutomation,
	AutomationTriggerType,
	AutomationConditions,
	AutomationAction,
	AutomationRunRow,
} from "../types/automations";

function parseConditions(raw: string): AutomationConditions {
	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === "object" && Array.isArray(parsed.rules)) {
			return { match: parsed.match === "any" ? "any" : "all", rules: parsed.rules };
		}
	} catch {
		// fall through
	}
	return { match: "all", rules: [] };
}

function parseActions(raw: string): AutomationAction[] {
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed;
	} catch {
		// fall through
	}
	return [];
}

export function rowToPublicAutomation(row: AutomationRow): PublicAutomation {
	return {
		id: row.id,
		workspace_id: row.workspace_id,
		name: row.name,
		description: row.description,
		trigger_type: row.trigger_type,
		conditions: parseConditions(row.conditions),
		actions: parseActions(row.actions),
		enabled: Boolean(row.enabled),
		schedule_minutes: row.schedule_minutes,
		run_order: row.run_order,
		run_count: row.run_count,
		last_run_at: row.last_run_at,
		created_by: row.created_by,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

export async function findAutomationsByWorkspace(db: D1Database, workspaceId: string): Promise<PublicAutomation[]> {
	const result = await db
		.prepare("SELECT * FROM automations WHERE workspace_id = ? ORDER BY run_order ASC, created_at ASC")
		.bind(workspaceId)
		.all<AutomationRow>();
	return (result.results ?? []).map(rowToPublicAutomation);
}

export async function findAutomationsByTrigger(
	db: D1Database,
	workspaceId: string,
	trigger: AutomationTriggerType,
): Promise<PublicAutomation[]> {
	const result = await db
		.prepare(
			"SELECT * FROM automations WHERE workspace_id = ? AND trigger_type = ? AND enabled = 1 ORDER BY run_order ASC, created_at ASC",
		)
		.bind(workspaceId, trigger)
		.all<AutomationRow>();
	return (result.results ?? []).map(rowToPublicAutomation);
}

export async function findScheduledAutomations(db: D1Database): Promise<PublicAutomation[]> {
	const result = await db
		.prepare(
			"SELECT * FROM automations WHERE enabled = 1 AND trigger_type IN ('scheduled.time_since_created', 'scheduled.time_since_updated')",
		)
		.all<AutomationRow>();
	return (result.results ?? []).map(rowToPublicAutomation);
}

export async function findAutomationById(db: D1Database, id: string): Promise<AutomationRow | null> {
	const result = await db.prepare("SELECT * FROM automations WHERE id = ? LIMIT 1").bind(id).first<AutomationRow>();
	return result ?? null;
}

export interface CreateAutomationInput {
	name: string;
	description?: string | null;
	trigger_type: AutomationTriggerType;
	conditions: AutomationConditions;
	actions: AutomationAction[];
	enabled?: boolean;
	schedule_minutes?: number | null;
	run_order?: number;
}

export async function createAutomation(
	db: D1Database,
	workspaceId: string,
	userId: string,
	data: CreateAutomationInput,
): Promise<AutomationRow> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO automations (id, workspace_id, name, description, trigger_type, conditions, actions, enabled, schedule_minutes, run_order, created_by)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			workspaceId,
			data.name,
			data.description ?? null,
			data.trigger_type,
			JSON.stringify(data.conditions),
			JSON.stringify(data.actions),
			data.enabled === false ? 0 : 1,
			data.schedule_minutes ?? null,
			data.run_order ?? 0,
			userId,
		)
		.run();
	return (await findAutomationById(db, id))!;
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

export async function updateAutomation(db: D1Database, id: string, data: UpdateAutomationInput): Promise<void> {
	const fields: string[] = [];
	const values: (string | number | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.trigger_type !== undefined) {
		fields.push("trigger_type = ?");
		values.push(data.trigger_type);
	}
	if (data.conditions !== undefined) {
		fields.push("conditions = ?");
		values.push(JSON.stringify(data.conditions));
	}
	if (data.actions !== undefined) {
		fields.push("actions = ?");
		values.push(JSON.stringify(data.actions));
	}
	if (data.enabled !== undefined) {
		fields.push("enabled = ?");
		values.push(data.enabled ? 1 : 0);
	}
	if (data.schedule_minutes !== undefined) {
		fields.push("schedule_minutes = ?");
		values.push(data.schedule_minutes);
	}
	if (data.run_order !== undefined) {
		fields.push("run_order = ?");
		values.push(data.run_order);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(id);
	await db
		.prepare(`UPDATE automations SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteAutomation(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM automations WHERE id = ?").bind(id).run();
}

export async function incrementAutomationRun(db: D1Database, id: string): Promise<void> {
	await db
		.prepare("UPDATE automations SET run_count = run_count + 1, last_run_at = unixepoch() WHERE id = ?")
		.bind(id)
		.run();
}

export async function recordAutomationRun(
	db: D1Database,
	data: { automation_id: string; ticket_id: string; status: "success" | "error" | "skipped"; error?: string },
): Promise<void> {
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO automation_runs (id, automation_id, ticket_id, status, error) VALUES (?, ?, ?, ?, ?)")
		.bind(id, data.automation_id, data.ticket_id, data.status, data.error ?? null)
		.run();
}

export async function findRecentAutomationRuns(db: D1Database, automationId: string, limit = 50): Promise<AutomationRunRow[]> {
	const result = await db
		.prepare("SELECT * FROM automation_runs WHERE automation_id = ? ORDER BY created_at DESC LIMIT ?")
		.bind(automationId, limit)
		.all<AutomationRunRow>();
	return result.results ?? [];
}

export async function hasScheduledRunForTicket(db: D1Database, automationId: string, ticketId: string): Promise<boolean> {
	const result = await db
		.prepare("SELECT id FROM automation_runs WHERE automation_id = ? AND ticket_id = ? AND status = 'success' LIMIT 1")
		.bind(automationId, ticketId)
		.first<{ id: string }>();
	return result !== null;
}
