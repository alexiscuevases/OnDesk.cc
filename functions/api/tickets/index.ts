import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findTicketsByWorkspace, createTicket, findUserById, createNotification } from "../../_lib/db";
import type { TicketStatus, TicketPriority } from "../../_lib/types";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

const VALID_STATUSES: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

// GET /api/tickets?workspace_id=&status=&assignee_id=&team_id=
// POST /api/tickets
export const onRequest = withWorkspace(async ({ request, env, payload, workspaceId }) => {
	const url = new URL(request.url);

	return createMethodRouter(request.method, {
		GET: async () => {
			const status = url.searchParams.get("status") as TicketStatus | null;
			const assigneeId = url.searchParams.get("assignee_id");
			const teamId = url.searchParams.get("team_id");

			const filters: { status?: TicketStatus; assignee_id?: string; team_id?: string } = {};
			if (status && VALID_STATUSES.includes(status)) filters.status = status;
			if (assigneeId) filters.assignee_id = assigneeId;
			if (teamId) filters.team_id = teamId;

			const tickets = await findTicketsByWorkspace(env.DB, workspaceId, filters);
			return jsonOk({ tickets });
		},
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const { subject, contact_id, assignee_id, team_id, status, priority } = parsed.body;

			if (typeof subject !== "string" || subject.trim().length === 0) {
				return jsonError("subject is required");
			}
			if (status !== undefined && !VALID_STATUSES.includes(status as TicketStatus)) {
				return jsonError(`status must be one of: ${VALID_STATUSES.join(", ")}`);
			}
			if (priority !== undefined && !VALID_PRIORITIES.includes(priority as TicketPriority)) {
				return jsonError(`priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
			}

			const ticket = await createTicket(env.DB, workspaceId, {
				subject: subject.trim(),
				contact_id: typeof contact_id === "string" ? contact_id : undefined,
				assignee_id: typeof assignee_id === "string" ? assignee_id : undefined,
				team_id: typeof team_id === "string" ? team_id : undefined,
				status: status as TicketStatus | undefined,
				priority: priority as TicketPriority | undefined,
			});

			const actor = await findUserById(env.DB, payload.sub);

			if (typeof assignee_id === "string" && assignee_id !== payload.sub) {
				await createNotification(env.DB, {
					user_id: assignee_id,
					workspace_id: workspaceId,
					type: "assign",
					title: "New ticket assigned to you",
					description: `${actor?.name ?? "Someone"} assigned ticket "${subject.trim()}" to you.`,
					resource_id: ticket.id,
					actor_id: payload.sub,
				});
			}

			return jsonCreated({ ticket });
		},
	});
});
