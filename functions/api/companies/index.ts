import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findCompaniesByWorkspace, createCompany } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";

// GET  /api/companies?workspace_id=
// POST /api/companies
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
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
});
