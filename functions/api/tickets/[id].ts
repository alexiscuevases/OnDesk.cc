import { jsonOk, jsonError } from "../../_lib/response";
import { findTicketById, updateTicket, deleteTicket, isWorkspaceMember, findUserById, findMessagesByTicket, findTeamById } from "../../_lib/db";
import type { TicketStatus, TicketPriority } from "../../_lib/types";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";
import { upsertTicket, deleteTicketVector, deleteMessageVectors } from "../../_lib/vectorize";
import { triggerTicketUpdated } from "../../_lib/automations-runner";
import { markSlaResolved, applySlaToTicket } from "../../_lib/db";
import { extractAndSaveMemories } from "../../_lib/memory-extraction";
import { buildTicketAudience, notify, ticketDetails } from "../../_lib/notify";

const VALID_STATUSES: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

// GET  /api/tickets/:id
// PATCH /api/tickets/:id
// DELETE /api/tickets/:id
export const onRequest = withAuth<"id">(async ({ request, env, payload, params, waitUntil }) => {
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
			const target = updated ?? ticket;

			const prevTeam = ticket.team_id;
			const assigneeChanged = typeof assignee_id === "string" && assignee_id !== prevAssignee;
			const teamChanged = typeof team_id === "string" && team_id !== prevTeam;
			const priorityChanged = typeof priority === "string" && priority !== ticket.priority;
			const isClosingStatus = status === "resolved" || status === "closed";
			const wasAlreadyClosed = prevStatus === "resolved" || prevStatus === "closed";
			const justClosed = isClosingStatus && !wasAlreadyClosed;

			// Only look the actor up when a change is actually worth announcing.
			const notifiable = assigneeChanged || teamChanged || priorityChanged || justClosed;
			const actor = notifiable ? await findUserById(env.DB, payload.sub) : null;
			const actorName = actor?.name ?? "Someone";

			// — Ticket handed to a new assignee
			if (assigneeChanged && assignee_id !== payload.sub) {
				waitUntil(
					notify(env, {
						workspaceId: ticket.workspace_id,
						recipients: [{ userId: assignee_id as string, pref: "ticket_assigned_to_me" }],
						type: "assign",
						title: "Ticket assigned to you",
						description: `${actorName} assigned ticket "${ticket.subject}" to you.`,
						resourceId: ticketId,
						actorId: payload.sub,
						email: {
							subject: `[#${target.number}] Assigned to you: ${target.subject}`,
							heading: "Ticket assigned to you",
							body: `${actorName} assigned this ticket to you.`,
							details: ticketDetails(target),
							ticketId,
							ctaLabel: "View ticket",
						},
					}),
				);
			}

			// — Ticket handed to a new team
			if (teamChanged) {
				const team = await findTeamById(env.DB, team_id as string);
				const teamAudience = await buildTicketAudience(
					env.DB,
					{ ...target, assignee_id: null },
					{
						selfPref: "ticket_assigned_to_team",
						teamPref: "ticket_assigned_to_team",
						exclude: [payload.sub, assigneeChanged ? (assignee_id as string) : null],
						workspaceFallback: false,
					},
				);
				if (teamAudience.length > 0) {
					waitUntil(
						notify(env, {
							workspaceId: ticket.workspace_id,
							recipients: teamAudience,
							type: "assign",
							title: "Ticket assigned to your team",
							description: `${actorName} assigned ticket "${ticket.subject}" to ${team?.name ?? "your team"}.`,
							resourceId: ticketId,
							actorId: payload.sub,
							email: {
								subject: `[#${target.number}] Assigned to your team: ${target.subject}`,
								heading: "Ticket assigned to your team",
								body: `${actorName} assigned this ticket to ${team?.name ?? "your team"}.`,
								details: ticketDetails(target),
								ticketId,
								ctaLabel: "View ticket",
							},
						}),
					);
				}
			}

			// — Ticket resolved or closed
			if (justClosed) {
				const audience = await buildTicketAudience(
					env.DB,
					{ ...target, assignee_id: prevAssignee },
					{
						selfPref: "ticket_status",
						teamPref: "ticket_status",
						exclude: [payload.sub],
						workspaceFallback: false,
					},
				);
				if (audience.length > 0) {
					const label = status === "closed" ? "closed" : "resolved";
					waitUntil(
						notify(env, {
							workspaceId: ticket.workspace_id,
							recipients: audience,
							type: "resolved",
							title: status === "closed" ? "Ticket closed" : "Ticket resolved",
							description: `${actorName} marked ticket "${ticket.subject}" as ${status}.`,
							resourceId: ticketId,
							actorId: payload.sub,
							email: {
								subject: `[#${target.number}] Ticket ${label}: ${target.subject}`,
								heading: `Ticket ${label}`,
								body: `${actorName} marked this ticket as ${label}.`,
								details: ticketDetails(target),
								ticketId,
								ctaLabel: "View ticket",
							},
						}),
					);
				}
			}

			// — Priority changed
			if (priorityChanged) {
				const audience = await buildTicketAudience(env.DB, target, {
					selfPref: "ticket_status",
					teamPref: "ticket_status",
					exclude: [payload.sub],
					workspaceFallback: false,
				});
				if (audience.length > 0) {
					waitUntil(
						notify(env, {
							workspaceId: ticket.workspace_id,
							recipients: audience,
							type: "ticket",
							title: "Ticket priority changed",
							description: `${actorName} changed priority of "${ticket.subject}" to ${priority}.`,
							resourceId: ticketId,
							actorId: payload.sub,
							email: {
								subject: `[#${target.number}] Priority now ${priority}: ${target.subject}`,
								heading: "Ticket priority changed",
								body: `${actorName} changed the priority of this ticket from ${ticket.priority} to ${priority}.`,
								details: ticketDetails(target),
								ticketId,
								ctaLabel: "View ticket",
							},
						}),
					);
				}
			}

			if (updated) {
				void upsertTicket(env, updated);
				void triggerTicketUpdated(env, updated, {
					statusChanged: typeof status === "string" && status !== prevStatus,
					priorityChanged,
					assigneeChanged,
				});
				if (justClosed) {
					void markSlaResolved(env.DB, ticketId, Math.floor(Date.now() / 1000));
				}
				if (priorityChanged) {
					// Re-apply SLA when priority changes (targets are priority-dependent)
					void applySlaToTicket(env.DB, updated);
				}
			}

			if (status === "resolved" && prevStatus !== "resolved" && ticket.contact_id) {
				void extractAndSaveMemories(env, ticketId, {
					workspace_id: ticket.workspace_id,
					contact_id: ticket.contact_id,
					subject: ticket.subject,
				});
			}

			return jsonOk({ ticket: updated });
		},
		DELETE: async () => {
			const messages = await findMessagesByTicket(env.DB, ticketId);
			await deleteTicket(env.DB, ticketId);
			void Promise.all([
				deleteTicketVector(env, ticketId),
				deleteMessageVectors(env, messages.map((m) => m.id)),
			]);
			return jsonOk({ success: true });
		},
	});
});
