import { jsonOk, jsonError } from "../../_lib/response";
import { findTicketById, updateTicket, deleteTicket, isWorkspaceMember, findUserById, createNotification } from "../../_lib/db";
import type { TicketStatus, TicketPriority } from "../../_lib/types";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

const VALID_STATUSES: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

// GET  /api/tickets/:id
// PATCH /api/tickets/:id
// DELETE /api/tickets/:id
export const onRequest = withAuth<"id">(async ({ request, env, payload, params }) => {
	const ticketId = params.id;
	const ticket = await findTicketById(env.DB, ticketId);
	if (!ticket) return jsonError("Ticket not found", 404);

	const member = await isWorkspaceMember(env.DB, ticket.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: () => jsonOk({ ticket }),
		PATCH: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const { subject, status, priority, assignee_id, team_id, contact_id } = parsed.body;

			if (status !== undefined && !VALID_STATUSES.includes(status as TicketStatus)) {
				return jsonError(`status must be one of: ${VALID_STATUSES.join(", ")}`);
			}
			if (priority !== undefined && !VALID_PRIORITIES.includes(priority as TicketPriority)) {
				return jsonError(`priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
			}

			const prevAssignee = ticket.assignee_id;
			const prevStatus = ticket.status;

			await updateTicket(env.DB, ticketId, {
				subject: typeof subject === "string" ? subject.trim() : undefined,
				status: status as TicketStatus | undefined,
				priority: priority as TicketPriority | undefined,
				assignee_id: assignee_id === null ? null : typeof assignee_id === "string" ? assignee_id : undefined,
				team_id: team_id === null ? null : typeof team_id === "string" ? team_id : undefined,
				contact_id: contact_id === null ? null : typeof contact_id === "string" ? contact_id : undefined,
			});

			const updated = await findTicketById(env.DB, ticketId);

			const newAssigneeId = typeof assignee_id === "string" ? assignee_id : prevAssignee;
			if (typeof assignee_id === "string" && assignee_id !== prevAssignee && assignee_id !== payload.sub) {
				const actor = await findUserById(env.DB, payload.sub);
				await createNotification(env.DB, {
					user_id: assignee_id,
					workspace_id: ticket.workspace_id,
					type: "assign",
					title: "Ticket assigned to you",
					description: `${actor?.name ?? "Someone"} assigned ticket "${ticket.subject}" to you.`,
					resource_id: ticketId,
					actor_id: payload.sub,
				});
			}

			const isClosingStatus = status === "resolved" || status === "closed";
			const wasAlreadyClosed = prevStatus === "resolved" || prevStatus === "closed";
			if (isClosingStatus && !wasAlreadyClosed && prevAssignee && prevAssignee !== payload.sub) {
				const actor = await findUserById(env.DB, payload.sub);
				await createNotification(env.DB, {
					user_id: prevAssignee,
					workspace_id: ticket.workspace_id,
					type: "resolved",
					title: status === "closed" ? "Ticket closed" : "Ticket resolved",
					description: `${actor?.name ?? "Someone"} marked ticket "${ticket.subject}" as ${status}.`,
					resource_id: ticketId,
					actor_id: payload.sub,
				});
			}

			if (
				typeof priority === "string" &&
				priority !== ticket.priority &&
				ticket.assignee_id &&
				ticket.assignee_id !== payload.sub
			) {
				const actor = await findUserById(env.DB, payload.sub);
				await createNotification(env.DB, {
					user_id: ticket.assignee_id,
					workspace_id: ticket.workspace_id,
					type: "ticket",
					title: "Ticket priority changed",
					description: `${actor?.name ?? "Someone"} changed priority of "${ticket.subject}" to ${priority}.`,
					resource_id: ticketId,
					actor_id: payload.sub,
				});
			}

			void newAssigneeId;
			return jsonOk({ ticket: updated });
		},
		DELETE: async () => {
			await deleteTicket(env.DB, ticketId);
			return jsonOk({ success: true });
		},
	});
});
