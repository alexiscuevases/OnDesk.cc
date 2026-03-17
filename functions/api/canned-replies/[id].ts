import { jsonOk, jsonError } from "../../_lib/response";
import { findCannedReplyById, updateCannedReply, deleteCannedReply, isWorkspaceMember } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET    /api/canned-replies/:id
// PATCH  /api/canned-replies/:id
// DELETE /api/canned-replies/:id
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
  const replyId = params.id;
  const reply = await findCannedReplyById(env.DB, replyId);
  if (!reply) return jsonError("Canned reply not found", 404);

  const member = await isWorkspaceMember(env.DB, reply.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  return createMethodRouter(request.method, {
    GET: () => jsonOk({ canned_reply: reply }),
    PATCH: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, content, shortcut } = parsed.body;
      await updateCannedReply(env.DB, replyId, {
        name: typeof name === "string" ? name.trim() : undefined,
        content: typeof content === "string" ? content.trim() : undefined,
        shortcut: typeof shortcut === "string" ? (shortcut.trim().length > 0 ? shortcut.trim() : null) : undefined,
      });
      const updated = await findCannedReplyById(env.DB, replyId);
      return jsonOk({ canned_reply: updated });
    },
    DELETE: async () => {
      await deleteCannedReply(env.DB, replyId);
      return jsonOk({ success: true });
    },
  });
});
