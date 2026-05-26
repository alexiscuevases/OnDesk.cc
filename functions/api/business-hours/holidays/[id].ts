import { jsonOk, jsonError } from "../../../_lib/response";
import {
	findHolidayById,
	deleteHoliday,
	findBusinessHoursById,
	isWorkspaceMember,
} from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter } from "../../../_lib/http";

export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	const id = params.id;
	const holiday = await findHolidayById(env.DB, id);
	if (!holiday) return jsonError("Holiday not found", 404);
	const calendar = await findBusinessHoursById(env.DB, holiday.business_hours_id);
	if (!calendar) return jsonError("Holiday not found", 404);
	const member = await isWorkspaceMember(env.DB, calendar.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		DELETE: async () => {
			await deleteHoliday(env.DB, id);
			return jsonOk({ success: true });
		},
	});
});
