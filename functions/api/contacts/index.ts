import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { isWorkspaceMember, findContactsByWorkspace, findOrCreateContact } from "../../_lib/db";

// GET  /api/contacts?workspace_id=
// POST /api/contacts
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspace_id");
  if (!workspaceId) return jsonError("workspace_id is required");

  const member = await isWorkspaceMember(env.DB, workspaceId, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

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
};
