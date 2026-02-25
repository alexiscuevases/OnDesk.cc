import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";
import {
  isWorkspaceMember,
  findNotificationsByUser,
  markAllNotificationsRead,
} from "../../_lib/db";

// GET  /api/notifications?workspace_id=
// POST /api/notifications/read-all?workspace_id=  (mark all read)
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
    const notifications = await findNotificationsByUser(env.DB, payload.sub, workspaceId);
    return jsonOk({ notifications });
  }

  if (request.method === "POST") {
    // POST /api/notifications?workspace_id=&action=read-all
    const action = url.searchParams.get("action");
    if (action === "read-all") {
      await markAllNotificationsRead(env.DB, payload.sub, workspaceId);
      return jsonOk({ ok: true });
    }
    return jsonError("Unknown action");
  }

  return jsonError("Method not allowed", 405);
};
