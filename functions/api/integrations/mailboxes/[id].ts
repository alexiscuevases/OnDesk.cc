import { jsonOk, jsonError } from "../../../_lib/response";
import {
  isWorkspaceMember,
  findMailboxIntegrationById,
  deleteMailboxIntegration,
  updateMailboxTokens,
} from "../../../_lib/db";
import { deleteGraphSubscription, refreshAccessToken } from "../../../_lib/graph";
import { stopGmailWatch, refreshGmailAccessToken } from "../../../_lib/gmail";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter } from "../../../_lib/http";

// DELETE /api/integrations/mailboxes/:id?workspace_id=
export const onRequest = withAuth<"id">(async ({ request, env, payload, params }) => {
  return createMethodRouter(request.method, {
    DELETE: async () => {
      const url = new URL(request.url);
      const workspaceId = url.searchParams.get("workspace_id");
      if (!workspaceId) return jsonError("workspace_id is required");

      const member = await isWorkspaceMember(env.DB, workspaceId, payload.sub);
      if (!member) return jsonError("Forbidden", 403);

      const id = params.id;
      const mailbox = await findMailboxIntegrationById(env.DB, id);
      if (!mailbox) return jsonError("Mailbox not found", 404);
      if (mailbox.workspace_id !== workspaceId) return jsonError("Forbidden", 403);

      const nowSecs = Math.floor(Date.now() / 1000);
      let accessToken = mailbox.access_token;

      try {
        if (mailbox.provider === "google") {
          // Refresh Google token if needed, then stop watch
          if (mailbox.token_expires_at < nowSecs + 60) {
            const refreshed = await refreshGmailAccessToken(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, mailbox.refresh_token);
            accessToken = refreshed.access_token;
          }
          await stopGmailWatch(accessToken);
        } else if (mailbox.subscription_id) {
          // Revoke Graph subscription
          if (mailbox.token_expires_at < nowSecs + 60) {
            const refreshed = await refreshAccessToken(env.MS_CLIENT_ID, env.MS_CLIENT_SECRET, mailbox.refresh_token);
            accessToken = refreshed.access_token;
            await updateMailboxTokens(env.DB, mailbox.id, {
              access_token: refreshed.access_token,
              refresh_token: refreshed.refresh_token,
              token_expires_at: nowSecs + refreshed.expires_in,
            });
          }
          await deleteGraphSubscription(accessToken, mailbox.subscription_id);
        }
      } catch {
        // Swallow — subscription/watch may already be expired
      }

      await deleteMailboxIntegration(env.DB, id);
      return jsonOk({ success: true });
    },
  });
});
