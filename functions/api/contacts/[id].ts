import { jsonOk, jsonError } from "../../_lib/response";
import { findContactById, updateContact, deleteContact, isWorkspaceMember } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { asNullableTrimmedString, asTrimmedString, createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET    /api/contacts/:id
// PATCH  /api/contacts/:id
// DELETE /api/contacts/:id
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
  const contactId = params.id;
  const contact = await findContactById(env.DB, contactId);
  if (!contact) return jsonError("Contact not found", 404);

  const member = await isWorkspaceMember(env.DB, contact.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  return createMethodRouter(request.method, {
    GET: () => jsonOk({ contact }),
    PATCH: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, phone, company_id } = parsed.body;
      await updateContact(env.DB, contactId, {
        name: asTrimmedString(name),
        phone: asTrimmedString(phone),
        company_id: asNullableTrimmedString(company_id),
      });
      const updated = await findContactById(env.DB, contactId);
      return jsonOk({ contact: updated });
    },
    DELETE: async () => {
      await deleteContact(env.DB, contactId);
      return jsonOk({ success: true });
    },
  });
});
