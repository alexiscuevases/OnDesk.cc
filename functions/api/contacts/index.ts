import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findContactsByWorkspace, findOrCreateContact } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";

// GET  /api/contacts?workspace_id=
// POST /api/contacts
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
  if (request.method === "GET") {
    const contacts = await findContactsByWorkspace(env.DB, workspaceId);
    return jsonOk({ contacts });
  }

  if (request.method === "POST") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, email, phone, company_id } = body as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");
    if (typeof email !== "string" || !email.includes("@")) return jsonError("valid email is required");

    const contact = await findOrCreateContact(env.DB, workspaceId, {
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() || undefined : undefined,
      company_id: typeof company_id === "string" ? company_id : undefined,
    });

    return jsonCreated({ contact });
  }

  return jsonError("Method not allowed", 405);
});
