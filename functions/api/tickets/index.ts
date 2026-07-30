import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findTicketsByWorkspace, createTicket, findUserById } from "../../_lib/db";
import type { TicketStatus, TicketPriority } from "../../_lib/types";
import type { TicketSortField, SortDirection } from "../../_lib/db/tickets";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";
import { upsertTicket } from "../../_lib/vectorize";
import { triggerTicketCreated } from "../../_lib/automations-runner";
import { applySlaToTicket } from "../../_lib/db";
import { buildTicketAudience, notify, ticketDetails } from "../../_lib/notify";

const VALID_STATUSES: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];
const VALID_SORT_FIELDS: TicketSortField[] = ["number", "subject", "priority", "status", "created_at", "updated_at"];

// GET /api/tickets?workspace_id=&status=&priority=&assignee_id=&team_id=&contact_id=&search=&page=&page_size=
// POST /api/tickets
export const onRequest = withWorkspace(async ({ request, env, payload, workspaceId, waitUntil }) => {
	const url = new URL(request.url);

	return createMethodRouter(request.method, {
		GET: async () => {
			const status = url.searchParams.get("status") as TicketStatus | null;
			const priority = url.searchParams.get("priority") as TicketPriority | null;
			const assigneeId = url.searchParams.get("assignee_id");
			const teamId = url.searchParams.get("team_id");
			const contactId = url.searchParams.get("contact_id");
			const search = url.searchParams.get("search");

			const filters: {
				status?: TicketStatus;
				priority?: TicketPriority;
				assignee_id?: string;
				team_id?: string;
				contact_id?: string;
				search?: string;
			} = {};
			if (status && VALID_STATUSES.includes(status)) filters.status = status;
			if (priority && VALID_PRIORITIES.includes(priority)) filters.priority = priority;
			if (assigneeId) filters.assignee_id = assigneeId;
			if (teamId) filters.team_id = teamId;
			if (contactId) filters.contact_id = contactId;
			if (search && search.trim().length > 0) filters.search = search.trim();

			const pageRaw = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
			const pageSizeRaw = Number.parseInt(url.searchParams.get("page_size") ?? "25", 10);
			const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
			const pageSize = Number.isFinite(pageSizeRaw) ? Math.min(Math.max(pageSizeRaw, 1), 100) : 25;
			const offset = (page - 1) * pageSize;

			const sortByRaw = url.searchParams.get("sort_by");
			const sortDirRaw = url.searchParams.get("sort_dir");
			const sortField: TicketSortField =
				sortByRaw && VALID_SORT_FIELDS.includes(sortByRaw as TicketSortField)
					? (sortByRaw as TicketSortField)
					: "created_at";
			const sortDirection: SortDirection = sortDirRaw === "asc" ? "asc" : "desc";

			const { tickets, total } = await findTicketsByWorkspace(
				env.DB,
				workspaceId,
				filters,
				{ limit: pageSize, offset },
				{ field: sortField, direction: sortDirection },
			);
			return jsonOk({ tickets, total, page, page_size: pageSize });
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
			const actorName = actor?.name ?? "Someone";

			// — Notify the assignee and/or the assigned team. A manually created ticket
			// with neither is nobody's news yet, so no workspace-wide fallback here.
			const audience = await buildTicketAudience(env.DB, ticket, {
				selfPref: "ticket_assigned_to_me",
				teamPref: "ticket_assigned_to_team",
				exclude: [payload.sub],
				workspaceFallback: false,
			});
			if (audience.length > 0) {
				waitUntil(
					notify(env, {
						workspaceId,
						recipients: audience,
						type: "assign",
						title: ticket.assignee_id ? "New ticket assigned to you" : "New ticket for your team",
						description: `${actorName} assigned ticket "${ticket.subject}" ${ticket.assignee_id ? "to you" : "to your team"}.`,
						resourceId: ticket.id,
						actorId: payload.sub,
						email: {
							subject: `[#${ticket.number}] ${ticket.subject}`,
							heading: ticket.assignee_id ? "New ticket assigned to you" : "New ticket for your team",
							body: `${actorName} assigned this ticket to ${ticket.assignee_id ? "you" : "your team"}.`,
							details: ticketDetails(ticket),
							ticketId: ticket.id,
							ctaLabel: "View ticket",
						},
					}),
				);
			}

			void upsertTicket(env, ticket);
			void applySlaToTicket(env.DB, ticket);
			void triggerTicketCreated(env, ticket);
			return jsonCreated({ ticket });
		},
	});
});
