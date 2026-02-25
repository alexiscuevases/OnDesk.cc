import { jsonOk, jsonError } from "../../../_lib/response";
import { findMailboxIntegrationsByWorkspace } from "../../../_lib/db";
import { withWorkspace } from "../../../_lib/middleware";

// GET /api/integrations/mailboxes?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
  if (request.method !== "GET") return jsonError("Method not allowed", 405);

  const mailboxes = await findMailboxIntegrationsByWorkspace(env.DB, workspaceId);
  return jsonOk({ mailboxes });
});
