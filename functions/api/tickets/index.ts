import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { isWorkspaceMember, findTicketsByWorkspace, createTicket, findUserById, createNotification } from "../../_lib/db";
import type { TicketStatus, TicketPriority } from "../../_lib/types";

const VALID_STATUSES: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

// GET /api/tickets?workspace_id=&status=&assignee_id=&team_id=
// POST /api/tickets
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspace_id");
  if (!workspaceId) return jsonError("workspace_id is required");

  const member = await isWorkspaceMember(env.DB, workspaceId, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  if (request.method === "GET") {
    const status = url.searchParams.get("status") as TicketStatus | null;
    const assigneeId = url.searchParams.get("assignee_id");
    const teamId = url.searchParams.get("team_id");

    const filters: { status?: TicketStatus; assignee_id?: string; team_id?: string } = {};
    if (status && VALID_STATUSES.includes(status)) filters.status = status;
    if (assigneeId) filters.assignee_id = assigneeId;
    if (teamId) filters.team_id = teamId;

    const tickets = await findTicketsByWorkspace(env.DB, workspaceId, filters);
    return jsonOk({ tickets });
  }

  if (request.method === "POST") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { subject, contact_id, assignee_id, team_id, status, priority } = body as Record<string, unknown>;

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

    // — Notification: ticket assigned on creation
    if (typeof assignee_id === "string" && assignee_id !== payload.sub) {
      const actor = await findUserById(env.DB, payload.sub);
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
  }

  return jsonError("Method not allowed", 405);
};
