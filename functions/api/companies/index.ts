import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findCompaniesByWorkspace, createCompany } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { asTrimmedString, createMethodRouter, parseJsonBody } from "../../_lib/http";
import { upsertCompany } from "../../_lib/vectorize";

// GET  /api/companies?workspace_id=
// POST /api/companies
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
  return createMethodRouter(request.method, {
    GET: async () => {
      const companies = await findCompaniesByWorkspace(env.DB, workspaceId);
      return jsonOk({ companies });
    },
    POST: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, domain, description, logo_url } = parsed.body;
      const normalizedName = asTrimmedString(name);
      if (!normalizedName) return jsonError("name is required");

      const company = await createCompany(env.DB, workspaceId, {
        name: normalizedName,
        domain: asTrimmedString(domain),
        description: asTrimmedString(description),
        logo_url: asTrimmedString(logo_url),
      });

      void upsertCompany(env, company);
      return jsonCreated({ company });
    },
  });
});
