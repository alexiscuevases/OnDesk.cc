import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import { verifyJwt } from "../../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../../_lib/cookies";
import { jsonOk, jsonError } from "../../../_lib/response";
import {
  isWorkspaceMember,
  findMailboxIntegrationById,
  deleteMailboxIntegration,
  findMailboxIntegrationsByWorkspace,
  updateMailboxTokens,
} from "../../../_lib/db";
import { deleteGraphSubscription, refreshAccessToken } from "../../../_lib/graph";

// DELETE /api/integrations/mailboxes/:id?workspace_id=
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  if (request.method !== "DELETE") return jsonError("Method not allowed", 405);

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

  const id = params.id as string;
  const mailbox = await findMailboxIntegrationById(env.DB, id);
  if (!mailbox) return jsonError("Mailbox not found", 404);
  if (mailbox.workspace_id !== workspaceId) return jsonError("Forbidden", 403);

  // Revoke Graph subscription if active
  if (mailbox.subscription_id) {
    try {
      let tokenToUse = mailbox.access_token;
      const nowSecs = Math.floor(Date.now() / 1000);
      if (mailbox.token_expires_at < nowSecs + 60) {
        const refreshed = await refreshAccessToken(
          env.MS_CLIENT_ID,
          env.MS_CLIENT_SECRET,
          mailbox.refresh_token
        );
        tokenToUse = refreshed.access_token;
        await updateMailboxTokens(env.DB, mailbox.id, {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          token_expires_at: nowSecs + refreshed.expires_in,
        });
      }
      await deleteGraphSubscription(tokenToUse, mailbox.subscription_id);
    } catch {
      // Swallow errors — subscription may already be expired
    }
  }

  await deleteMailboxIntegration(env.DB, id);
  return jsonOk({ success: true });
};
