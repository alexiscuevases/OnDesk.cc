import { jsonOk, jsonError } from "../../_lib/response";
import { findNotificationsByUser, markAllNotificationsRead } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";

// GET  /api/notifications?workspace_id=
// POST /api/notifications?workspace_id=&action=read-all  (mark all read)
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
  if (request.method === "GET") {
    const notifications = await findNotificationsByUser(env.DB, payload.sub, workspaceId);
    return jsonOk({ notifications });
  }

  if (request.method === "POST") {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    if (action === "read-all") {
      await markAllNotificationsRead(env.DB, payload.sub, workspaceId);
      return jsonOk({ ok: true });
    }
    return jsonError("Unknown action");
  }

  return jsonError("Method not allowed", 405);
});
