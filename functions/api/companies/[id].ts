import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";
import { findCompanyById, updateCompany, deleteCompany, isWorkspaceMember } from "../../_lib/db";

// GET    /api/companies/:id
// PATCH  /api/companies/:id
// DELETE /api/companies/:id
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const companyId = params.id as string;
  const company = await findCompanyById(env.DB, companyId);
  if (!company) return jsonError("Company not found", 404);

  const member = await isWorkspaceMember(env.DB, company.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  if (request.method === "GET") {
    return jsonOk({ company });
  }

  if (request.method === "PATCH") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, domain, description } = body as Record<string, unknown>;
    await updateCompany(env.DB, companyId, {
      name: typeof name === "string" ? name.trim() : undefined,
      domain: typeof domain === "string" ? domain.trim() : undefined,
      description: typeof description === "string" ? description.trim() : undefined,
    });
    const updated = await findCompanyById(env.DB, companyId);
    return jsonOk({ company: updated });
  }

  if (request.method === "DELETE") {
    await deleteCompany(env.DB, companyId);
    return jsonOk({ success: true });
  }

  return jsonError("Method not allowed", 405);
};
