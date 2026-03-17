import { jsonOk, jsonError } from "../../_lib/response";
import { findSignatureById, updateSignature, deleteSignature } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET    /api/signatures/:id
// PATCH  /api/signatures/:id
// DELETE /api/signatures/:id
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
  const signatureId = params.id;
  const row = await findSignatureById(env.DB, signatureId);
  if (!row) return jsonError("Signature not found", 404);

  // Signatures are personal — only the owner can access them
  if (row.created_by !== payload.sub) return jsonError("Forbidden", 403);

  const toPublic = (r: typeof row) => ({
    id: r.id,
    created_by: r.created_by,
    workspace_id: r.workspace_id,
    name: r.name,
    content: r.content,
    is_default: r.is_default === 1,
    created_at: r.created_at,
  });

  return createMethodRouter(request.method, {
    GET: () => jsonOk({ signature: toPublic(row) }),
    PATCH: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, content, is_default } = parsed.body;
      await updateSignature(env.DB, signatureId, payload.sub, {
        name: typeof name === "string" ? name.trim() : undefined,
        content: typeof content === "string" ? content.trim() : undefined,
        is_default: typeof is_default === "boolean" ? is_default : undefined,
      });
      const updated = await findSignatureById(env.DB, signatureId);
      return jsonOk({ signature: toPublic(updated!) });
    },
    DELETE: async () => {
      await deleteSignature(env.DB, signatureId);
      return jsonOk({ success: true });
    },
  });
});
