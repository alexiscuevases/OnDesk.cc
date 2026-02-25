import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { isWorkspaceMember, findCompaniesByWorkspace, createCompany } from "../../_lib/db";

// GET  /api/companies?workspace_id=
// POST /api/companies
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
    const companies = await findCompaniesByWorkspace(env.DB, workspaceId);
    return jsonOk({ companies });
  }

  if (request.method === "POST") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, domain, description, logo_url } = body as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) {
      return jsonError("name is required");
    }

    const company = await createCompany(env.DB, workspaceId, {
      name: name.trim(),
      domain: typeof domain === "string" ? domain.trim() || undefined : undefined,
      description: typeof description === "string" ? description.trim() || undefined : undefined,
      logo_url: typeof logo_url === "string" ? logo_url.trim() || undefined : undefined,
    });

    return jsonCreated({ company });
  }

  return jsonError("Method not allowed", 405);
};
