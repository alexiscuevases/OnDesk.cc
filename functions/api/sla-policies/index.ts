import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findSlaPoliciesByWorkspace, createSlaPolicy, rowToPublicPolicy } from "../../_lib/db";
import type { TicketPriority } from "../../_lib/types";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

function asNumberOrNull(value: unknown): number | null | undefined {
	if (value === null) return null;
	if (value === undefined) return undefined;
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return undefined;
	return Math.floor(value);
}

// GET  /api/sla-policies?workspace_id=
// POST /api/sla-policies?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const sla_policies = await findSlaPoliciesByWorkspace(env.DB, workspaceId);
			return jsonOk({ sla_policies });
		},
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;
			const name = body.name;
			if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");

			const priorityScope =
				typeof body.applies_to_priority === "string" && VALID_PRIORITIES.includes(body.applies_to_priority as TicketPriority)
					? (body.applies_to_priority as TicketPriority)
					: body.applies_to_priority === null
					? null
					: null;

			const row = await createSlaPolicy(env.DB, workspaceId, {
				name: name.trim(),
				description: typeof body.description === "string" ? body.description.trim() : null,
				enabled: typeof body.enabled === "boolean" ? body.enabled : true,
				applies_to_team_id: typeof body.applies_to_team_id === "string" ? body.applies_to_team_id : null,
				applies_to_company_id: typeof body.applies_to_company_id === "string" ? body.applies_to_company_id : null,
				applies_to_priority: priorityScope,
				response_low: asNumberOrNull(body.response_low) ?? null,
				response_medium: asNumberOrNull(body.response_medium) ?? null,
				response_high: asNumberOrNull(body.response_high) ?? null,
				response_urgent: asNumberOrNull(body.response_urgent) ?? null,
				resolution_low: asNumberOrNull(body.resolution_low) ?? null,
				resolution_medium: asNumberOrNull(body.resolution_medium) ?? null,
				resolution_high: asNumberOrNull(body.resolution_high) ?? null,
				resolution_urgent: asNumberOrNull(body.resolution_urgent) ?? null,
				business_hours_only: Boolean(body.business_hours_only),
				business_hours_id:
					typeof body.business_hours_id === "string" && body.business_hours_id.length > 0
						? body.business_hours_id
						: null,
				priority: typeof body.priority === "number" ? Math.floor(body.priority) : 0,
			});
			return jsonCreated({ sla_policy: rowToPublicPolicy(row) });
		},
	});
});
