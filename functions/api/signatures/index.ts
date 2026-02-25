import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findSignaturesByUser, createSignature, findWorkspacesByUserId } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";

// GET  /api/signatures  — list caller's signatures
// POST /api/signatures
export const onRequest = withAuth(async ({ request, env, payload }) => {
  if (request.method === "GET") {
    const signatures = await findSignaturesByUser(env.DB, payload.sub);
    return jsonOk({ signatures });
  }

  if (request.method === "POST") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, content, is_default } = body as Record<string, unknown>;

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
  }

  return jsonError("Method not allowed", 405);
});
