import { jsonOk, jsonError } from "../../_lib/response";
import {
	findAutomationById,
	updateAutomation,
	deleteAutomation,
	rowToPublicAutomation,
	findRecentAutomationRuns,
	isWorkspaceMember,
} from "../../_lib/db";
import type { AutomationTriggerType, AutomationConditions, AutomationAction } from "../../_lib/types";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

const VALID_TRIGGERS: AutomationTriggerType[] = [
	"ticket.created",
	"ticket.updated",
	"ticket.status_changed",
	"ticket.priority_changed",
	"ticket.assigned",
	"message.received",
	"message.sent",
	"scheduled.time_since_created",
	"scheduled.time_since_updated",
];

function validateConditions(value: unknown): AutomationConditions | null {
	if (!value || typeof value !== "object") return null;
	const obj = value as Record<string, unknown>;
	const match = obj.match === "any" ? "any" : "all";
	const rules = Array.isArray(obj.rules) ? obj.rules : [];
	return { match, rules: rules as AutomationConditions["rules"] };
}

// GET    /api/automations/:id
// PATCH  /api/automations/:id
// DELETE /api/automations/:id
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	const id = params.id;
	const row = await findAutomationById(env.DB, id);
	if (!row) return jsonError("Automation not found", 404);
	const member = await isWorkspaceMember(env.DB, row.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: async () => {
			const runs = await findRecentAutomationRuns(env.DB, id, 20);
			return jsonOk({ automation: rowToPublicAutomation(row), runs });
		},
		PATCH: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const { name, description, trigger_type, conditions, actions, enabled, schedule_minutes, run_order } = parsed.body;

			if (trigger_type !== undefined && (typeof trigger_type !== "string" || !VALID_TRIGGERS.includes(trigger_type as AutomationTriggerType))) {
				return jsonError(`trigger_type must be one of: ${VALID_TRIGGERS.join(", ")}`);
			}
			let validConditions: AutomationConditions | undefined;
			if (conditions !== undefined) {
				const v = validateConditions(conditions);
				if (!v) return jsonError("conditions must be an object {match, rules}");
				validConditions = v;
			}
			let validActions: AutomationAction[] | undefined;
			if (actions !== undefined) {
				if (!Array.isArray(actions)) return jsonError("actions must be an array");
				validActions = actions as AutomationAction[];
			}

			await updateAutomation(env.DB, id, {
				name: typeof name === "string" ? name.trim() : undefined,
				description: typeof description === "string" ? description.trim() : description === null ? null : undefined,
				trigger_type: trigger_type as AutomationTriggerType | undefined,
				conditions: validConditions,
				actions: validActions,
				enabled: typeof enabled === "boolean" ? enabled : undefined,
				schedule_minutes:
					schedule_minutes === null
						? null
						: typeof schedule_minutes === "number" && Number.isFinite(schedule_minutes) && schedule_minutes > 0
						? Math.floor(schedule_minutes)
						: undefined,
				run_order: typeof run_order === "number" ? Math.floor(run_order) : undefined,
			});

			const updated = await findAutomationById(env.DB, id);
			return jsonOk({ automation: updated ? rowToPublicAutomation(updated) : null });
		},
		DELETE: async () => {
			await deleteAutomation(env.DB, id);
			return jsonOk({ success: true });
		},
	});
});
