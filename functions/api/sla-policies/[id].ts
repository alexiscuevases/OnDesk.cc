import { jsonOk, jsonError } from "../../_lib/response";
import {
	findSlaPolicyById,
	updateSlaPolicy,
	deleteSlaPolicy,
	rowToPublicPolicy,
	isWorkspaceMember,
} from "../../_lib/db";
import type { TicketPriority } from "../../_lib/types";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

function asNumberOrNull(value: unknown): number | null | undefined {
	if (value === null) return null;
	if (value === undefined) return undefined;
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return undefined;
	return Math.floor(value);
}

export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	const id = params.id;
	const row = await findSlaPolicyById(env.DB, id);
	if (!row) return jsonError("SLA policy not found", 404);
	const member = await isWorkspaceMember(env.DB, row.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: () => jsonOk({ sla_policy: rowToPublicPolicy(row) }),
		PATCH: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;

			let priorityScope: TicketPriority | null | undefined = undefined;
			if (body.applies_to_priority === null) priorityScope = null;
			else if (typeof body.applies_to_priority === "string" && VALID_PRIORITIES.includes(body.applies_to_priority as TicketPriority)) {
				priorityScope = body.applies_to_priority as TicketPriority;
			}

			await updateSlaPolicy(env.DB, id, {
				name: typeof body.name === "string" ? body.name.trim() : undefined,
				description: typeof body.description === "string" ? body.description.trim() : body.description === null ? null : undefined,
				enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
				applies_to_team_id: typeof body.applies_to_team_id === "string" ? body.applies_to_team_id : body.applies_to_team_id === null ? null : undefined,
				applies_to_company_id: typeof body.applies_to_company_id === "string" ? body.applies_to_company_id : body.applies_to_company_id === null ? null : undefined,
				applies_to_priority: priorityScope,
				response_low: asNumberOrNull(body.response_low),
				response_medium: asNumberOrNull(body.response_medium),
				response_high: asNumberOrNull(body.response_high),
				response_urgent: asNumberOrNull(body.response_urgent),
				resolution_low: asNumberOrNull(body.resolution_low),
				resolution_medium: asNumberOrNull(body.resolution_medium),
				resolution_high: asNumberOrNull(body.resolution_high),
				resolution_urgent: asNumberOrNull(body.resolution_urgent),
				business_hours_only: typeof body.business_hours_only === "boolean" ? body.business_hours_only : undefined,
				priority: typeof body.priority === "number" ? Math.floor(body.priority) : undefined,
			});

			const updated = await findSlaPolicyById(env.DB, id);
			return jsonOk({ sla_policy: updated ? rowToPublicPolicy(updated) : null });
		},
		DELETE: async () => {
			await deleteSlaPolicy(env.DB, id);
			return jsonOk({ success: true });
		},
	});
});
