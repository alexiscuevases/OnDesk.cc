import { jsonOk, jsonError } from "../../../_lib/response";
import { findTicketById, findSlaTrackingByTicket, isWorkspaceMember } from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";

// GET /api/tickets/:id/sla
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	if (request.method !== "GET") return jsonError("Method not allowed", 405);
	const ticketId = params.id;
	const ticket = await findTicketById(env.DB, ticketId);
	if (!ticket) return jsonError("Ticket not found", 404);
	const member = await isWorkspaceMember(env.DB, ticket.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);
	const tracking = await findSlaTrackingByTicket(env.DB, ticketId);
	return jsonOk({ sla: tracking });
});
