import { jsonOk, jsonError } from "../../../_lib/response";
import {
	findBusinessHoursById,
	computeOpenStatus,
	isWorkspaceMember,
} from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter } from "../../../_lib/http";

export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	const id = params.id;
	const calendar = await findBusinessHoursById(env.DB, id);
	if (!calendar) return jsonError("Business hours not found", 404);
	const member = await isWorkspaceMember(env.DB, calendar.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: () => {
			const now = Math.floor(Date.now() / 1000);
			return jsonOk({ status: computeOpenStatus(calendar, now) });
		},
	});
});
