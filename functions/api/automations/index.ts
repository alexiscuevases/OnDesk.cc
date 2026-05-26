import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findAutomationsByWorkspace, createAutomation, rowToPublicAutomation } from "../../_lib/db";
import type {
	AutomationTriggerType,
	AutomationConditions,
	AutomationAction,
} from "../../_lib/types";
import { withWorkspace } from "../../_lib/middleware";
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

function validateActions(value: unknown): AutomationAction[] | null {
	if (!Array.isArray(value)) return null;
	return value as AutomationAction[];
}

// GET  /api/automations?workspace_id=
// POST /api/automations?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const automations = await findAutomationsByWorkspace(env.DB, workspaceId);
			return jsonOk({ automations });
		},
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const { name, description, trigger_type, conditions, actions, enabled, schedule_minutes, run_order } = parsed.body;

			if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");
			if (typeof trigger_type !== "string" || !VALID_TRIGGERS.includes(trigger_type as AutomationTriggerType)) {
				return jsonError(`trigger_type must be one of: ${VALID_TRIGGERS.join(", ")}`);
			}
			const validConditions = validateConditions(conditions);
			if (!validConditions) return jsonError("conditions must be an object {match, rules}");
			const validActions = validateActions(actions);
			if (!validActions) return jsonError("actions must be an array");

			const row = await createAutomation(env.DB, workspaceId, payload.sub, {
				name: name.trim(),
				description: typeof description === "string" ? description.trim() : null,
				trigger_type: trigger_type as AutomationTriggerType,
				conditions: validConditions,
				actions: validActions,
				enabled: typeof enabled === "boolean" ? enabled : true,
				schedule_minutes:
					typeof schedule_minutes === "number" && Number.isFinite(schedule_minutes) && schedule_minutes > 0
						? Math.floor(schedule_minutes)
						: null,
				run_order: typeof run_order === "number" ? Math.floor(run_order) : 0,
			});
			return jsonCreated({ automation: rowToPublicAutomation(row) });
		},
	});
});
