import { jsonOk, jsonError } from "../../_lib/response";
import { findNotificationsByUser, markAllNotificationsRead } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

// GET  /api/notifications?workspace_id=
// POST /api/notifications?workspace_id=&action=read-all  (mark all read)
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
  return createMethodRouter(request.method, {
    GET: async () => {
      const notifications = await findNotificationsByUser(env.DB, payload.sub, workspaceId);
      return jsonOk({ notifications });
    },
    POST: async () => {
      const url = new URL(request.url);
      const action = url.searchParams.get("action");
      if (action === "read-all") {
        await markAllNotificationsRead(env.DB, payload.sub, workspaceId);
        return jsonOk({ ok: true });
      }
      return jsonError("Unknown action");
    },
  });
});
