import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findCannedRepliesByWorkspace, createCannedReply } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";

// GET  /api/canned-replies?workspace_id=
// POST /api/canned-replies
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
  if (request.method === "GET") {
    const replies = await findCannedRepliesByWorkspace(env.DB, workspaceId);
    return jsonOk({ canned_replies: replies });
  }

  if (request.method === "POST") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, content, shortcut } = body as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");
    if (typeof content !== "string" || content.trim().length === 0) return jsonError("content is required");

    const reply = await createCannedReply(env.DB, workspaceId, payload.sub, {
      name: name.trim(),
      content: content.trim(),
      shortcut: typeof shortcut === "string" && shortcut.trim().length > 0 ? shortcut.trim() : undefined,
    });

    return jsonCreated({ canned_reply: reply });
  }

  return jsonError("Method not allowed", 405);
});
