import type {
	SlaPolicyRow,
	PublicSlaPolicy,
	SlaTrackingRow,
	PublicSlaTracking,
	SlaStatus,
} from "../types/sla";
import type { TicketPriority, TicketRow } from "../types";
import {
	findBusinessHoursById,
	findDefaultBusinessHours,
	addBusinessMinutes,
} from "./business-hours";

export function rowToPublicPolicy(row: SlaPolicyRow): PublicSlaPolicy {
	return {
		...row,
		enabled: Boolean(row.enabled),
		business_hours_only: Boolean(row.business_hours_only),
	};
}

export async function findSlaPoliciesByWorkspace(db: D1Database, workspaceId: string): Promise<PublicSlaPolicy[]> {
	const result = await db
		.prepare("SELECT * FROM sla_policies WHERE workspace_id = ? ORDER BY priority DESC, created_at ASC")
		.bind(workspaceId)
		.all<SlaPolicyRow>();
	return (result.results ?? []).map(rowToPublicPolicy);
}

export async function findSlaPolicyById(db: D1Database, id: string): Promise<SlaPolicyRow | null> {
	const result = await db.prepare("SELECT * FROM sla_policies WHERE id = ? LIMIT 1").bind(id).first<SlaPolicyRow>();
	return result ?? null;
}

export interface CreateSlaPolicyInput {
	name: string;
	description?: string | null;
	enabled?: boolean;
	applies_to_team_id?: string | null;
	applies_to_company_id?: string | null;
	applies_to_priority?: TicketPriority | null;
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

export async function createSlaPolicy(db: D1Database, workspaceId: string, data: CreateSlaPolicyInput): Promise<SlaPolicyRow> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO sla_policies (
				id, workspace_id, name, description, enabled,
				applies_to_team_id, applies_to_company_id, applies_to_priority,
				response_low, response_medium, response_high, response_urgent,
				resolution_low, resolution_medium, resolution_high, resolution_urgent,
				business_hours_only, business_hours_id, priority
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			workspaceId,
			data.name,
			data.description ?? null,
			data.enabled === false ? 0 : 1,
			data.applies_to_team_id ?? null,
			data.applies_to_company_id ?? null,
			data.applies_to_priority ?? null,
			data.response_low ?? null,
			data.response_medium ?? null,
			data.response_high ?? null,
			data.response_urgent ?? null,
			data.resolution_low ?? null,
			data.resolution_medium ?? null,
			data.resolution_high ?? null,
			data.resolution_urgent ?? null,
			data.business_hours_only ? 1 : 0,
			data.business_hours_id ?? null,
			data.priority ?? 0,
		)
		.run();
	return (await findSlaPolicyById(db, id))!;
}

export type UpdateSlaPolicyInput = Partial<CreateSlaPolicyInput>;

export async function updateSlaPolicy(db: D1Database, id: string, data: UpdateSlaPolicyInput): Promise<void> {
	const fields: string[] = [];
	const values: (string | number | null)[] = [];
	const pushField = (key: string, val: string | number | null | undefined) => {
		if (val === undefined) return;
		fields.push(`${key} = ?`);
		values.push(val);
	};
	pushField("name", data.name);
	pushField("description", data.description);
	if (data.enabled !== undefined) {
		fields.push("enabled = ?");
		values.push(data.enabled ? 1 : 0);
	}
	pushField("applies_to_team_id", data.applies_to_team_id);
	pushField("applies_to_company_id", data.applies_to_company_id);
	pushField("applies_to_priority", data.applies_to_priority ?? null);
	pushField("response_low", data.response_low);
	pushField("response_medium", data.response_medium);
	pushField("response_high", data.response_high);
	pushField("response_urgent", data.response_urgent);
	pushField("resolution_low", data.resolution_low);
	pushField("resolution_medium", data.resolution_medium);
	pushField("resolution_high", data.resolution_high);
	pushField("resolution_urgent", data.resolution_urgent);
	if (data.business_hours_only !== undefined) {
		fields.push("business_hours_only = ?");
		values.push(data.business_hours_only ? 1 : 0);
	}
	if (data.business_hours_id !== undefined) {
		fields.push("business_hours_id = ?");
		values.push(data.business_hours_id);
	}
	pushField("priority", data.priority);

	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(id);
	await db.prepare(`UPDATE sla_policies SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
}

export async function deleteSlaPolicy(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM sla_policies WHERE id = ?").bind(id).run();
}

// ─── Tracking ─────────────────────────────────────────────────────────────────

export async function findSlaTrackingByTicket(db: D1Database, ticketId: string): Promise<PublicSlaTracking | null> {
	const result = await db
		.prepare(
			`SELECT t.*, p.name AS policy_name FROM sla_ticket_tracking t
			 LEFT JOIN sla_policies p ON p.id = t.sla_policy_id
			 WHERE t.ticket_id = ? LIMIT 1`,
		)
		.bind(ticketId)
		.first<PublicSlaTracking>();
	return result ?? null;
}

export async function findSlaTrackingByWorkspace(db: D1Database, workspaceId: string): Promise<PublicSlaTracking[]> {
	const result = await db
		.prepare(
			`SELECT t.*, p.name AS policy_name FROM sla_ticket_tracking t
			 LEFT JOIN sla_policies p ON p.id = t.sla_policy_id
			 WHERE t.workspace_id = ? ORDER BY t.created_at DESC LIMIT 200`,
		)
		.bind(workspaceId)
		.all<PublicSlaTracking>();
	return result.results ?? [];
}

export async function upsertSlaTracking(
	db: D1Database,
	data: {
		workspace_id: string;
		ticket_id: string;
		sla_policy_id: string;
		response_due_at: number | null;
		resolution_due_at: number | null;
	},
): Promise<void> {
	const existing = await db
		.prepare("SELECT id FROM sla_ticket_tracking WHERE ticket_id = ? LIMIT 1")
		.bind(data.ticket_id)
		.first<{ id: string }>();
	if (existing) {
		await db
			.prepare(
				"UPDATE sla_ticket_tracking SET sla_policy_id = ?, response_due_at = ?, resolution_due_at = ?, updated_at = unixepoch() WHERE id = ?",
			)
			.bind(data.sla_policy_id, data.response_due_at, data.resolution_due_at, existing.id)
			.run();
		return;
	}
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO sla_ticket_tracking (id, workspace_id, ticket_id, sla_policy_id, response_due_at, resolution_due_at)
			 VALUES (?, ?, ?, ?, ?, ?)`,
		)
		.bind(id, data.workspace_id, data.ticket_id, data.sla_policy_id, data.response_due_at, data.resolution_due_at)
		.run();
}

export async function markSlaFirstResponse(db: D1Database, ticketId: string, at: number): Promise<void> {
	await db
		.prepare(
			"UPDATE sla_ticket_tracking SET first_response_at = COALESCE(first_response_at, ?), updated_at = unixepoch() WHERE ticket_id = ?",
		)
		.bind(at, ticketId)
		.run();
}

export async function markSlaResolved(db: D1Database, ticketId: string, at: number): Promise<void> {
	await db
		.prepare(
			"UPDATE sla_ticket_tracking SET resolved_at = ?, status = CASE WHEN status IN ('on_track','paused') THEN 'met' ELSE status END, updated_at = unixepoch() WHERE ticket_id = ?",
		)
		.bind(at, ticketId)
		.run();
}

export async function updateSlaStatus(db: D1Database, ticketId: string, status: SlaStatus, breachAt?: number): Promise<void> {
	if (status === "response_breached" && breachAt) {
		await db
			.prepare("UPDATE sla_ticket_tracking SET status = ?, response_breached_at = ?, updated_at = unixepoch() WHERE ticket_id = ?")
			.bind(status, breachAt, ticketId)
			.run();
	} else if (status === "resolution_breached" && breachAt) {
		await db
			.prepare("UPDATE sla_ticket_tracking SET status = ?, resolution_breached_at = ?, updated_at = unixepoch() WHERE ticket_id = ?")
			.bind(status, breachAt, ticketId)
			.run();
	} else {
		await db
			.prepare("UPDATE sla_ticket_tracking SET status = ?, updated_at = unixepoch() WHERE ticket_id = ?")
			.bind(status, ticketId)
			.run();
	}
}

// ─── Policy matching ──────────────────────────────────────────────────────────

export async function findApplicableSlaPolicy(
	db: D1Database,
	workspaceId: string,
	ticket: { priority: TicketPriority; team_id: string | null; contact_id: string | null },
): Promise<SlaPolicyRow | null> {
	// Get the contact's company_id if any
	let companyId: string | null = null;
	if (ticket.contact_id) {
		const c = await db
			.prepare("SELECT company_id FROM contacts WHERE id = ? LIMIT 1")
			.bind(ticket.contact_id)
			.first<{ company_id: string | null }>();
		companyId = c?.company_id ?? null;
	}

	const policies = await db
		.prepare("SELECT * FROM sla_policies WHERE workspace_id = ? AND enabled = 1 ORDER BY priority DESC, created_at ASC")
		.bind(workspaceId)
		.all<SlaPolicyRow>();

	for (const p of policies.results ?? []) {
		if (p.applies_to_priority && p.applies_to_priority !== ticket.priority) continue;
		if (p.applies_to_team_id && p.applies_to_team_id !== ticket.team_id) continue;
		if (p.applies_to_company_id && p.applies_to_company_id !== companyId) continue;
		return p;
	}
	return null;
}

export function getResponseMinutes(policy: SlaPolicyRow, priority: TicketPriority): number | null {
	switch (priority) {
		case "low":
			return policy.response_low;
		case "medium":
			return policy.response_medium;
		case "high":
			return policy.response_high;
		case "urgent":
			return policy.response_urgent;
	}
}

export function getResolutionMinutes(policy: SlaPolicyRow, priority: TicketPriority): number | null {
	switch (priority) {
		case "low":
			return policy.resolution_low;
		case "medium":
			return policy.resolution_medium;
		case "high":
			return policy.resolution_high;
		case "urgent":
			return policy.resolution_urgent;
	}
}

export async function applySlaToTicket(db: D1Database, ticket: TicketRow): Promise<void> {
	const policy = await findApplicableSlaPolicy(db, ticket.workspace_id, ticket);
	if (!policy) return;
	const respMin = getResponseMinutes(policy, ticket.priority);
	const resMin = getResolutionMinutes(policy, ticket.priority);
	const base = ticket.created_at;

	// If business_hours_only is set, advance the clock only during open windows.
	// Use the policy's calendar if specified, else workspace default. If no
	// calendar is found, fall back to wall-clock seconds.
	let respDue: number | null = respMin ? base + respMin * 60 : null;
	let resDue: number | null = resMin ? base + resMin * 60 : null;

	if (policy.business_hours_only) {
		const calendar = policy.business_hours_id
			? await findBusinessHoursById(db, policy.business_hours_id)
			: await findDefaultBusinessHours(db, ticket.workspace_id);
		if (calendar && calendar.enabled) {
			if (respMin) respDue = addBusinessMinutes(calendar, base, respMin);
			if (resMin) resDue = addBusinessMinutes(calendar, base, resMin);
		}
	}

	await upsertSlaTracking(db, {
		workspace_id: ticket.workspace_id,
		ticket_id: ticket.id,
		sla_policy_id: policy.id,
		response_due_at: respDue,
		resolution_due_at: resDue,
	});
}

export async function scanSlaBreaches(db: D1Database): Promise<{ scanned: number; breached: number }> {
	const now = Math.floor(Date.now() / 1000);
	const rows = await db
		.prepare(
			"SELECT * FROM sla_ticket_tracking WHERE status = 'on_track' AND ((response_due_at IS NOT NULL AND first_response_at IS NULL AND response_due_at < ?) OR (resolution_due_at IS NOT NULL AND resolved_at IS NULL AND resolution_due_at < ?))",
		)
		.bind(now, now)
		.all<SlaTrackingRow>();

	let breached = 0;
	for (const t of rows.results ?? []) {
		if (t.response_due_at && !t.first_response_at && t.response_due_at < now) {
			await updateSlaStatus(db, t.ticket_id, "response_breached", now);
			breached++;
		} else if (t.resolution_due_at && !t.resolved_at && t.resolution_due_at < now) {
			await updateSlaStatus(db, t.ticket_id, "resolution_breached", now);
			breached++;
		}
	}
	return { scanned: rows.results?.length ?? 0, breached };
}
