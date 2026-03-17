import { jsonOk, jsonError } from "../../_lib/response";
import { markNotificationRead, deleteNotification } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

// PATCH  /api/notifications/:id?workspace_id=   — mark as read
// DELETE /api/notifications/:id?workspace_id=   — dismiss
export const onRequest = withWorkspace<"id">(async ({ request, env, params, payload }) => {
  const id = params.id;

  return createMethodRouter(request.method, {
    PATCH: async () => {
      const updated = await markNotificationRead(env.DB, id, payload.sub);
      if (!updated) return jsonError("Notification not found", 404);
      return jsonOk({ ok: true });
    },
    DELETE: async () => {
      const deleted = await deleteNotification(env.DB, id, payload.sub);
      if (!deleted) return jsonError("Notification not found", 404);
      return jsonOk({ ok: true });
    },
  });
});
