import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";
import { findContactById, updateContact, deleteContact, isWorkspaceMember } from "../../_lib/db";

// GET    /api/contacts/:id
// PATCH  /api/contacts/:id
// DELETE /api/contacts/:id
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const contactId = params.id as string;
  const contact = await findContactById(env.DB, contactId);
  if (!contact) return jsonError("Contact not found", 404);

  const member = await isWorkspaceMember(env.DB, contact.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  if (request.method === "GET") {
    return jsonOk({ contact });
  }

  if (request.method === "PATCH") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, phone, company_id } = body as Record<string, unknown>;
    await updateContact(env.DB, contactId, {
      name: typeof name === "string" ? name.trim() : undefined,
      phone: typeof phone === "string" ? phone.trim() : undefined,
      company_id: company_id === null ? null : typeof company_id === "string" ? company_id : undefined,
    });
    const updated = await findContactById(env.DB, contactId);
    return jsonOk({ contact: updated });
  }

  if (request.method === "DELETE") {
    await deleteContact(env.DB, contactId);
    return jsonOk({ success: true });
  }

  return jsonError("Method not allowed", 405);
};
