import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";
import {
  isWorkspaceMember,
  markNotificationRead,
  deleteNotification,
} from "../../_lib/db";

// PATCH  /api/notifications/:id?workspace_id=   — mark as read
// DELETE /api/notifications/:id?workspace_id=   — dismiss
export const onRequest: PagesFunction<Env, "id"> = async ({ request, env, params }) => {
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

  const id = params.id;

  if (request.method === "PATCH") {
    const updated = await markNotificationRead(env.DB, id, payload.sub);
    if (!updated) return jsonError("Notification not found", 404);
    return jsonOk({ ok: true });
  }

  if (request.method === "DELETE") {
    const deleted = await deleteNotification(env.DB, id, payload.sub);
    if (!deleted) return jsonError("Notification not found", 404);
    return jsonOk({ ok: true });
  }

  return jsonError("Method not allowed", 405);
};
