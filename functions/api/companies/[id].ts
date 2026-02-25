import { jsonOk, jsonError } from "../../_lib/response";
import { findCompanyById, updateCompany, deleteCompany, isWorkspaceMember } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";

// GET    /api/companies/:id
// PATCH  /api/companies/:id
// DELETE /api/companies/:id
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
  const companyId = params.id;
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

    const { name, domain, description, logo_url } = body as Record<string, unknown>;
    await updateCompany(env.DB, companyId, {
      name: typeof name === "string" ? name.trim() : undefined,
      domain: typeof domain === "string" ? domain.trim() : undefined,
      description: typeof description === "string" ? description.trim() : undefined,
      logo_url: logo_url === null ? null : typeof logo_url === "string" ? logo_url.trim() : undefined,
    });
    const updated = await findCompanyById(env.DB, companyId);
    return jsonOk({ company: updated });
  }

  if (request.method === "DELETE") {
    await deleteCompany(env.DB, companyId);
    return jsonOk({ success: true });
  }

  return jsonError("Method not allowed", 405);
});
