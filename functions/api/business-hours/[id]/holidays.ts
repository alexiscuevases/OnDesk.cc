import { jsonOk, jsonCreated, jsonError } from "../../../_lib/response";
import {
	findBusinessHoursById,
	createHoliday,
	isWorkspaceMember,
} from "../../../_lib/db";
import type { HolidayKind } from "../../../_lib/types";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	const id = params.id;
	const calendar = await findBusinessHoursById(env.DB, id);
	if (!calendar) return jsonError("Business hours not found", 404);
	const member = await isWorkspaceMember(env.DB, calendar.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: () => jsonOk({ holidays: calendar.holidays }),
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;
			const date = body.date;
			const name = body.name;
			if (typeof date !== "string" || !DATE_RE.test(date)) return jsonError("date must be YYYY-MM-DD");
			if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");

			const kind: HolidayKind = body.kind === "open" ? "open" : "closed";
			let startMin: number | null = null;
			let endMin: number | null = null;
			if (kind === "open") {
				if (
					typeof body.start_minute !== "number" ||
					typeof body.end_minute !== "number" ||
					body.start_minute < 0 || body.start_minute > 1440 ||
					body.end_minute <= body.start_minute || body.end_minute > 1440
				) {
					return jsonError("kind=open requires valid start_minute/end_minute");
				}
				startMin = Math.floor(body.start_minute);
				endMin = Math.floor(body.end_minute);
			}

			const holidayId = await createHoliday(env.DB, id, {
				date,
				name: name.trim(),
				kind,
				start_minute: startMin,
				end_minute: endMin,
			});
			const refreshed = await findBusinessHoursById(env.DB, id);
			const created = refreshed?.holidays.find((h) => h.id === holidayId) ?? null;
			return jsonCreated({ holiday: created });
		},
	});
});
