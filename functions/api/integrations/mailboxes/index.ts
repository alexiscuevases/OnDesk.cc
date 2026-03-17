import { jsonOk } from "../../../_lib/response";
import { findMailboxIntegrationsByWorkspace } from "../../../_lib/db";
import { withWorkspace } from "../../../_lib/middleware";
import { createMethodRouter } from "../../../_lib/http";

// GET /api/integrations/mailboxes?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
  return createMethodRouter(request.method, {
    GET: async () => {
      const mailboxes = await findMailboxIntegrationsByWorkspace(env.DB, workspaceId);
      return jsonOk({ mailboxes });
    },
  });
});
