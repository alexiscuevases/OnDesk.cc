import { jsonOk, jsonError } from "../../_lib/response";
import { findSignatureById, updateSignature, deleteSignature } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";

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

  if (request.method === "GET") {
    return jsonOk({ signature: toPublic(row) });
  }

  if (request.method === "PATCH") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, content, is_default } = body as Record<string, unknown>;
    await updateSignature(env.DB, signatureId, payload.sub, {
      name: typeof name === "string" ? name.trim() : undefined,
      content: typeof content === "string" ? content.trim() : undefined,
      is_default: typeof is_default === "boolean" ? is_default : undefined,
    });
    const updated = await findSignatureById(env.DB, signatureId);
    return jsonOk({ signature: toPublic(updated!) });
  }

  if (request.method === "DELETE") {
    await deleteSignature(env.DB, signatureId);
    return jsonOk({ success: true });
  }

  return jsonError("Method not allowed", 405);
});
