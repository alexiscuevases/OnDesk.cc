import { jsonOk, jsonError } from "../../_lib/response";
import { markNotificationRead, deleteNotification } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";

// PATCH  /api/notifications/:id?workspace_id=   — mark as read
// DELETE /api/notifications/:id?workspace_id=   — dismiss
export const onRequest = withWorkspace<"id">(async ({ request, env, params, payload }) => {
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
});
