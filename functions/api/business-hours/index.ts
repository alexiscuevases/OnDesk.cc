import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import {
	findBusinessHoursByWorkspace,
	createBusinessHours,
	replacePeriods,
	findBusinessHoursById,
} from "../../_lib/db";
import type { Weekday } from "../../_lib/types";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

function parsePeriod(value: unknown): { weekday: Weekday; start_minute: number; end_minute: number } | null {
	if (!value || typeof value !== "object") return null;
	const v = value as Record<string, unknown>;
	const weekday = v.weekday;
	const start = v.start_minute;
	const end = v.end_minute;
	if (typeof weekday !== "number" || weekday < 0 || weekday > 6) return null;
	if (typeof start !== "number" || typeof end !== "number") return null;
	if (start < 0 || start > 1440 || end <= start || end > 1440) return null;
	return {
		weekday: Math.floor(weekday) as Weekday,
		start_minute: Math.floor(start),
		end_minute: Math.floor(end),
	};
}

// GET  /api/business-hours?workspace_id=
// POST /api/business-hours?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const business_hours = await findBusinessHoursByWorkspace(env.DB, workspaceId);
			return jsonOk({ business_hours });
		},
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;
			const name = body.name;
			if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");

			const timezone = typeof body.timezone === "string" && body.timezone.trim().length > 0 ? body.timezone : "UTC";

			const periodsInput = Array.isArray(body.periods) ? body.periods : [];
			const periods = periodsInput.map(parsePeriod).filter((p): p is NonNullable<typeof p> => p !== null);

			const id = await createBusinessHours(env.DB, workspaceId, {
				name: name.trim(),
				description: typeof body.description === "string" ? body.description.trim() : null,
				timezone,
				is_default: Boolean(body.is_default),
				enabled: typeof body.enabled === "boolean" ? body.enabled : true,
			});
			if (periods.length > 0) {
				await replacePeriods(env.DB, id, periods);
			}
			const business_hours = await findBusinessHoursById(env.DB, id);
			return jsonCreated({ business_hours });
		},
	});
});
