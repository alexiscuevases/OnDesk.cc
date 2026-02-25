import { jsonOk, jsonError } from "../../_lib/response";
import { findCannedReplyById, updateCannedReply, deleteCannedReply, isWorkspaceMember } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";

// GET    /api/canned-replies/:id
// PATCH  /api/canned-replies/:id
// DELETE /api/canned-replies/:id
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
  const replyId = params.id;
  const reply = await findCannedReplyById(env.DB, replyId);
  if (!reply) return jsonError("Canned reply not found", 404);

  const member = await isWorkspaceMember(env.DB, reply.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  if (request.method === "GET") {
    return jsonOk({ canned_reply: reply });
  }

  if (request.method === "PATCH") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, content, shortcut } = body as Record<string, unknown>;
    await updateCannedReply(env.DB, replyId, {
      name: typeof name === "string" ? name.trim() : undefined,
      content: typeof content === "string" ? content.trim() : undefined,
      shortcut: typeof shortcut === "string" ? (shortcut.trim().length > 0 ? shortcut.trim() : null) : undefined,
    });
    const updated = await findCannedReplyById(env.DB, replyId);
    return jsonOk({ canned_reply: updated });
  }

  if (request.method === "DELETE") {
    await deleteCannedReply(env.DB, replyId);
    return jsonOk({ success: true });
  }

  return jsonError("Method not allowed", 405);
});
