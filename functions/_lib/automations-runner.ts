import type { Env } from "./types/env";
import type {
	PublicAutomation,
	AutomationConditionRule,
	AutomationConditionOp,
	AutomationTriggerType,
	AutomationAction,
} from "./types/automations";
import type { TicketRow, TicketStatus, TicketPriority, PublicTicketMessage } from "./types";
import {
	findAutomationsByTrigger,
	findScheduledAutomations,
	incrementAutomationRun,
	recordAutomationRun,
	hasScheduledRunForTicket,
} from "./db/automations";
import { findTicketById, updateTicket, createTicketMessage, findCannedReplyById, findContactById } from "./db";

// ─── Condition evaluation ─────────────────────────────────────────────────────

interface EvalContext {
	ticket: TicketRow;
	message?: PublicTicketMessage;
	contactEmail?: string;
	contactCompanyId?: string | null;
}

function getFieldValue(field: AutomationConditionRule["field"], ctx: EvalContext): string | number | null {
	switch (field) {
		case "subject":
			return ctx.ticket.subject;
		case "status":
			return ctx.ticket.status;
		case "priority":
			return ctx.ticket.priority;
		case "channel":
			return ctx.ticket.channel ?? null;
		case "assignee_id":
			return ctx.ticket.assignee_id ?? null;
		case "team_id":
			return ctx.ticket.team_id ?? null;
		case "contact_id":
			return ctx.ticket.contact_id ?? null;
		case "contact_email":
			return ctx.contactEmail ?? null;
		case "company_id":
			return ctx.contactCompanyId ?? null;
		case "message_content":
			return ctx.message?.content ?? null;
	}
}

function evalRule(rule: AutomationConditionRule, ctx: EvalContext): boolean {
	const actual = getFieldValue(rule.field, ctx);
	const op: AutomationConditionOp = rule.op;
	const expected = rule.value;

	switch (op) {
		case "eq":
			return String(actual ?? "") === String(expected ?? "");
		case "neq":
			return String(actual ?? "") !== String(expected ?? "");
		case "contains":
			return typeof actual === "string" && typeof expected === "string" && actual.toLowerCase().includes(expected.toLowerCase());
		case "not_contains":
			return !(typeof actual === "string" && typeof expected === "string" && actual.toLowerCase().includes(expected.toLowerCase()));
		case "gt":
			return Number(actual) > Number(expected);
		case "lt":
			return Number(actual) < Number(expected);
		case "in":
			return Array.isArray(expected) && expected.map(String).includes(String(actual ?? ""));
		case "is_empty":
			return actual === null || actual === undefined || actual === "";
		case "is_not_empty":
			return !(actual === null || actual === undefined || actual === "");
		default:
			return false;
	}
}

export function evaluateConditions(automation: PublicAutomation, ctx: EvalContext): boolean {
	const { match, rules } = automation.conditions;
	if (rules.length === 0) return true;
	if (match === "any") return rules.some((r) => evalRule(r, ctx));
	return rules.every((r) => evalRule(r, ctx));
}

// ─── Action execution ─────────────────────────────────────────────────────────

interface ActionContext {
	env: Env;
	ticket: TicketRow;
	workspaceId: string;
	systemUserId: string; // user that "performed" the automation (creator)
}

async function executeAction(action: AutomationAction, ctx: ActionContext): Promise<{ stop: boolean }> {
	switch (action.type) {
		case "set_status": {
			const status = action.params.status as TicketStatus | undefined;
			if (status) await updateTicket(ctx.env.DB, ctx.ticket.id, { status });
			return { stop: false };
		}
		case "set_priority": {
			const priority = action.params.priority as TicketPriority | undefined;
			if (priority) await updateTicket(ctx.env.DB, ctx.ticket.id, { priority });
			return { stop: false };
		}
		case "assign_user": {
			const userId = action.params.user_id as string | undefined;
			await updateTicket(ctx.env.DB, ctx.ticket.id, { assignee_id: userId ?? null });
			return { stop: false };
		}
		case "assign_team": {
			const teamId = action.params.team_id as string | undefined;
			await updateTicket(ctx.env.DB, ctx.ticket.id, { team_id: teamId ?? null });
			return { stop: false };
		}
		case "send_canned_reply": {
			const replyId = action.params.canned_reply_id as string | undefined;
			if (!replyId) return { stop: false };
			const reply = await findCannedReplyById(ctx.env.DB, replyId);
			if (!reply || reply.workspace_id !== ctx.workspaceId) return { stop: false };
			await createTicketMessage(ctx.env.DB, {
				ticket_id: ctx.ticket.id,
				author_id: ctx.systemUserId,
				author_type: "agent",
				type: "message",
				content: reply.content,
			});
			return { stop: false };
		}
		case "add_internal_note": {
			const note = action.params.content as string | undefined;
			if (!note) return { stop: false };
			await createTicketMessage(ctx.env.DB, {
				ticket_id: ctx.ticket.id,
				author_id: ctx.systemUserId,
				author_type: "agent",
				type: "note",
				content: note,
			});
			return { stop: false };
		}
		case "escalate_to_human": {
			await ctx.env.DB.prepare(
				"UPDATE ai_ticket_state SET escalated = 1, escalated_at = unixepoch(), escalation_note = ? WHERE ticket_id = ?",
			)
				.bind((action.params.note as string) ?? "Escalated by automation", ctx.ticket.id)
				.run();
			return { stop: false };
		}
		case "stop_processing":
			return { stop: true };
		default:
			return { stop: false };
	}
}

// ─── Trigger entry points ─────────────────────────────────────────────────────

async function buildEvalContext(env: Env, ticket: TicketRow, message?: PublicTicketMessage): Promise<EvalContext> {
	let contactEmail: string | undefined;
	let contactCompanyId: string | null | undefined;
	if (ticket.contact_id) {
		const contact = await findContactById(env.DB, ticket.contact_id);
		if (contact) {
			contactEmail = contact.email;
			contactCompanyId = contact.company_id;
		}
	}
	return { ticket, message, contactEmail, contactCompanyId };
}

async function runAutomationsForTrigger(
	env: Env,
	workspaceId: string,
	trigger: AutomationTriggerType,
	ticketId: string,
	message?: PublicTicketMessage,
): Promise<void> {
	const ticket = await findTicketById(env.DB, ticketId);
	if (!ticket) return;
	const automations = await findAutomationsByTrigger(env.DB, workspaceId, trigger);
	if (automations.length === 0) return;
	const evalCtx = await buildEvalContext(env, ticket, message);

	for (const automation of automations) {
		try {
			if (!evaluateConditions(automation, evalCtx)) continue;
			// Re-read ticket between rules so later ones see prior mutations
			const freshTicket = await findTicketById(env.DB, ticketId);
			if (!freshTicket) break;
			let stopped = false;
			for (const action of automation.actions) {
				const result = await executeAction(action, {
					env,
					ticket: freshTicket,
					workspaceId,
					systemUserId: automation.created_by,
				});
				if (result.stop) {
					stopped = true;
					break;
				}
			}
			await incrementAutomationRun(env.DB, automation.id);
			await recordAutomationRun(env.DB, {
				automation_id: automation.id,
				ticket_id: ticketId,
				status: "success",
			});
			if (stopped) break;
		} catch (err) {
			await recordAutomationRun(env.DB, {
				automation_id: automation.id,
				ticket_id: ticketId,
				status: "error",
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}
}

export async function triggerTicketCreated(env: Env, ticket: TicketRow): Promise<void> {
	await runAutomationsForTrigger(env, ticket.workspace_id, "ticket.created", ticket.id);
}

export async function triggerTicketUpdated(env: Env, ticket: TicketRow, changes: {
	statusChanged?: boolean;
	priorityChanged?: boolean;
	assigneeChanged?: boolean;
}): Promise<void> {
	await runAutomationsForTrigger(env, ticket.workspace_id, "ticket.updated", ticket.id);
	if (changes.statusChanged) await runAutomationsForTrigger(env, ticket.workspace_id, "ticket.status_changed", ticket.id);
	if (changes.priorityChanged) await runAutomationsForTrigger(env, ticket.workspace_id, "ticket.priority_changed", ticket.id);
	if (changes.assigneeChanged) await runAutomationsForTrigger(env, ticket.workspace_id, "ticket.assigned", ticket.id);
}

export async function triggerMessageReceived(env: Env, ticket: TicketRow, message: PublicTicketMessage): Promise<void> {
	await runAutomationsForTrigger(env, ticket.workspace_id, "message.received", ticket.id, message);
}

export async function triggerMessageSent(env: Env, ticket: TicketRow, message: PublicTicketMessage): Promise<void> {
	await runAutomationsForTrigger(env, ticket.workspace_id, "message.sent", ticket.id, message);
}

// ─── Scheduled runner (invoked by cron) ───────────────────────────────────────

export async function runScheduledAutomations(env: Env): Promise<{ evaluated: number; fired: number }> {
	const automations = await findScheduledAutomations(env.DB);
	const now = Math.floor(Date.now() / 1000);
	let fired = 0;

	for (const automation of automations) {
		const thresholdMinutes = automation.schedule_minutes ?? 0;
		if (thresholdMinutes <= 0) continue;
		const thresholdSeconds = thresholdMinutes * 60;
		const timeColumn =
			automation.trigger_type === "scheduled.time_since_updated" ? "updated_at" : "created_at";

		const candidates = await env.DB
			.prepare(
				`SELECT * FROM tickets WHERE workspace_id = ? AND status NOT IN ('resolved','closed') AND (? - ${timeColumn}) >= ?`,
			)
			.bind(automation.workspace_id, now, thresholdSeconds)
			.all<TicketRow>();

		for (const ticket of candidates.results ?? []) {
			const already = await hasScheduledRunForTicket(env.DB, automation.id, ticket.id);
			if (already) continue;
			const evalCtx = await buildEvalContext(env, ticket);
			if (!evaluateConditions(automation, evalCtx)) continue;

			try {
				for (const action of automation.actions) {
					const fresh = await findTicketById(env.DB, ticket.id);
					if (!fresh) break;
					const result = await executeAction(action, {
						env,
						ticket: fresh,
						workspaceId: automation.workspace_id,
						systemUserId: automation.created_by,
					});
					if (result.stop) break;
				}
				await incrementAutomationRun(env.DB, automation.id);
				await recordAutomationRun(env.DB, {
					automation_id: automation.id,
					ticket_id: ticket.id,
					status: "success",
				});
				fired++;
			} catch (err) {
				await recordAutomationRun(env.DB, {
					automation_id: automation.id,
					ticket_id: ticket.id,
					status: "error",
					error: err instanceof Error ? err.message : String(err),
				});
			}
		}
	}

	return { evaluated: automations.length, fired };
}
