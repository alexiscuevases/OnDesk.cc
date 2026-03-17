import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findSignaturesByUser, createSignature, findWorkspacesByUserId } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET  /api/signatures  — list caller's signatures
// POST /api/signatures
export const onRequest = withAuth(async ({ request, env, payload }) => {
  return createMethodRouter(request.method, {
    GET: async () => {
      const signatures = await findSignaturesByUser(env.DB, payload.sub);
      return jsonOk({ signatures });
    },
    POST: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, content, is_default } = parsed.body;

      if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");
      if (typeof content !== "string" || content.trim().length === 0) return jsonError("content is required");

      const workspaces = await findWorkspacesByUserId(env.DB, payload.sub);
      if (workspaces.length === 0) return jsonError("No workspace found", 400);

      const signature = await createSignature(env.DB, payload.sub, workspaces[0].id, {
        name: name.trim(),
        content: content.trim(),
        is_default: is_default === true,
      });

      return jsonCreated({ signature });
    },
  });
});
