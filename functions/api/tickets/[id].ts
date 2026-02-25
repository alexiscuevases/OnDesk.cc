import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";
import { findTicketById, updateTicket, deleteTicket, isWorkspaceMember, findUserById, createNotification } from "../../_lib/db";
import type { TicketStatus, TicketPriority } from "../../_lib/types";

const VALID_STATUSES: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

// GET  /api/tickets/:id
// PATCH /api/tickets/:id
// DELETE /api/tickets/:id
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const ticketId = params.id as string;
  const ticket = await findTicketById(env.DB, ticketId);
  if (!ticket) return jsonError("Ticket not found", 404);

  const member = await isWorkspaceMember(env.DB, ticket.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  if (request.method === "GET") {
    return jsonOk({ ticket });
  }

  if (request.method === "PATCH") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { subject, status, priority, assignee_id, team_id, contact_id } = body as Record<string, unknown>;

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

    // — Notification: ticket assigned to a different user
    const newAssigneeId = typeof assignee_id === "string" ? assignee_id : prevAssignee;
    if (
      typeof assignee_id === "string" &&
      assignee_id !== prevAssignee &&
      assignee_id !== payload.sub
    ) {
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

    // — Notification: ticket resolved
    if (status === "resolved" && prevStatus !== "resolved" && prevAssignee && prevAssignee !== payload.sub) {
      const actor = await findUserById(env.DB, payload.sub);
      await createNotification(env.DB, {
        user_id: prevAssignee,
        workspace_id: ticket.workspace_id,
        type: "resolved",
        title: "Ticket resolved",
        description: `${actor?.name ?? "Someone"} marked ticket "${ticket.subject}" as resolved.`,
        resource_id: ticketId,
        actor_id: payload.sub,
      });
    }

    // Suppress unused variable warning
    void newAssigneeId;

    return jsonOk({ ticket: updated });
  }

  if (request.method === "DELETE") {
    await deleteTicket(env.DB, ticketId);
    return jsonOk({ success: true });
  }

  return jsonError("Method not allowed", 405);
};
