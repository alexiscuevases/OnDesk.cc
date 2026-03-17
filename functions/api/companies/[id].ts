import { jsonOk, jsonError } from "../../_lib/response";
import { findCompanyById, updateCompany, deleteCompany, isWorkspaceMember } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { asNullableTrimmedString, asTrimmedString, createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET    /api/companies/:id
// PATCH  /api/companies/:id
// DELETE /api/companies/:id
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
  const companyId = params.id;
  const company = await findCompanyById(env.DB, companyId);
  if (!company) return jsonError("Company not found", 404);

  const member = await isWorkspaceMember(env.DB, company.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  return createMethodRouter(request.method, {
    GET: () => jsonOk({ company }),
    PATCH: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, domain, description, logo_url } = parsed.body;
      await updateCompany(env.DB, companyId, {
        name: asTrimmedString(name),
        domain: asTrimmedString(domain),
        description: asTrimmedString(description),
        logo_url: asNullableTrimmedString(logo_url),
      });
      const updated = await findCompanyById(env.DB, companyId);
      return jsonOk({ company: updated });
    },
    DELETE: async () => {
      await deleteCompany(env.DB, companyId);
      return jsonOk({ success: true });
    },
  });
});
