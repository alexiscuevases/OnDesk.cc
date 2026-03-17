import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findContactsByWorkspace, findOrCreateContact } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { asTrimmedString, createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET  /api/contacts?workspace_id=
// POST /api/contacts
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
  return createMethodRouter(request.method, {
    GET: async () => {
      const contacts = await findContactsByWorkspace(env.DB, workspaceId);
      return jsonOk({ contacts });
    },
    POST: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, email, phone, company_id } = parsed.body;
      const normalizedName = asTrimmedString(name);
      const normalizedEmail = asTrimmedString(email);

      if (!normalizedName) return jsonError("name is required");
      if (!normalizedEmail || !normalizedEmail.includes("@")) return jsonError("valid email is required");

      const contact = await findOrCreateContact(env.DB, workspaceId, {
        name: normalizedName,
        email: normalizedEmail,
        phone: asTrimmedString(phone),
        company_id: typeof company_id === "string" ? company_id : undefined,
      });

      return jsonCreated({ contact });
    },
  });
});
