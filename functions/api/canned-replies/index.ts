import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findCannedRepliesByWorkspace, createCannedReply } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET  /api/canned-replies?workspace_id=
// POST /api/canned-replies
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
  return createMethodRouter(request.method, {
    GET: async () => {
      const replies = await findCannedRepliesByWorkspace(env.DB, workspaceId);
      return jsonOk({ canned_replies: replies });
    },
    POST: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, content, shortcut } = parsed.body;

      if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");
      if (typeof content !== "string" || content.trim().length === 0) return jsonError("content is required");

      const reply = await createCannedReply(env.DB, workspaceId, payload.sub, {
        name: name.trim(),
        content: content.trim(),
        shortcut: typeof shortcut === "string" && shortcut.trim().length > 0 ? shortcut.trim() : undefined,
      });

      return jsonCreated({ canned_reply: reply });
    },
  });
});
