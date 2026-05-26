import { jsonOk, jsonError } from "../../_lib/response";
import {
	findBusinessHoursById,
	updateBusinessHours,
	deleteBusinessHours,
	replacePeriods,
	isWorkspaceMember,
} from "../../_lib/db";
import type { Weekday } from "../../_lib/types";
import { withAuth } from "../../_lib/middleware";
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

export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	const id = params.id;
	const calendar = await findBusinessHoursById(env.DB, id);
	if (!calendar) return jsonError("Business hours not found", 404);
	const member = await isWorkspaceMember(env.DB, calendar.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: () => jsonOk({ business_hours: calendar }),
		PATCH: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;

			await updateBusinessHours(env.DB, id, calendar.workspace_id, {
				name: typeof body.name === "string" ? body.name.trim() : undefined,
				description:
					typeof body.description === "string"
						? body.description.trim()
						: body.description === null
							? null
							: undefined,
				timezone: typeof body.timezone === "string" && body.timezone.trim().length > 0 ? body.timezone : undefined,
				is_default: typeof body.is_default === "boolean" ? body.is_default : undefined,
				enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
			});

			if (Array.isArray(body.periods)) {
				const periods = body.periods
					.map(parsePeriod)
					.filter((p): p is NonNullable<typeof p> => p !== null);
				await replacePeriods(env.DB, id, periods);
			}

			const updated = await findBusinessHoursById(env.DB, id);
			return jsonOk({ business_hours: updated });
		},
		DELETE: async () => {
			await deleteBusinessHours(env.DB, id);
			return jsonOk({ success: true });
		},
	});
});
