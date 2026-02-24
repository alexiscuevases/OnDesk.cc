import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import {
  createMailboxIntegration,
  findMailboxIntegrationByEmail,
  findMailboxIntegrationById,
  updateMailboxTokens,
  updateMailboxSubscription,
} from "../../../_lib/db";
import {
  exchangeCodeForTokens,
  getGraphUserProfile,
  createGraphSubscription,
} from "../../../_lib/graph";

function errorRedirect(appUrl: string, slug: string, msg: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${appUrl}/w/${slug}/settings?section=integrations&error=${encodeURIComponent(msg)}`,
    },
  });
}

// GET /api/integrations/microsoft/callback?code=&state=
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  // Parse state to get workspace_id and slug
  let workspaceId = "";
  let slug = "";
  try {
    const decoded = JSON.parse(atob(stateParam ?? ""));
    workspaceId = decoded.workspace_id;
    slug = decoded.slug;
  } catch {
    return new Response("Invalid state parameter", { status: 400 });
  }

  const appUrl = env.APP_URL;

  if (errorParam || !code) {
    return errorRedirect(appUrl, slug, errorParam ?? "access_denied");
  }

  const redirectUri = `${appUrl}/api/integrations/microsoft/callback`;

  try {
    // 1. Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
      env.MS_CLIENT_ID,
      env.MS_CLIENT_SECRET,
      code,
      redirectUri
    );

    const nowSecs = Math.floor(Date.now() / 1000);
    const tokenExpiresAt = nowSecs + tokens.expires_in;

    // 2. Get user profile to get email and MS user ID
    const profile = await getGraphUserProfile(tokens.access_token);
    const email = (profile.mail ?? profile.userPrincipalName).toLowerCase();

    // 3. Upsert mailbox integration
    let mailboxId: string;
    const existing = await findMailboxIntegrationByEmail(env.DB, workspaceId, email);
    if (existing) {
      await updateMailboxTokens(env.DB, existing.id, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokenExpiresAt,
      });
      mailboxId = existing.id;
    } else {
      const clientStateSecret = crypto.randomUUID();
      const mailbox = await createMailboxIntegration(env.DB, {
        workspace_id: workspaceId,
        email,
        ms_user_id: profile.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokenExpiresAt,
        client_state_secret: clientStateSecret,
      });
      mailboxId = mailbox.id;
    }

    // 4. Create (or renew) Graph subscription
    // Note: Graph requires a public HTTPS notificationUrl.
    // In local dev (http://localhost) this step is skipped gracefully —
    // the mailbox is still saved and the subscription can be created later.
    const notificationUrl = `${appUrl}/api/webhooks/microsoft-graph`;
    const mailbox = await findMailboxIntegrationById(env.DB, mailboxId);
    if (!mailbox) throw new Error("Mailbox record not found after upsert");

    if (appUrl.startsWith("https://")) {
      try {
        const subscription = await createGraphSubscription(
          tokens.access_token,
          notificationUrl,
          mailbox.client_state_secret
        );
        const subExpiresAt = Math.floor(
          new Date(subscription.expirationDateTime).getTime() / 1000
        );
        await updateMailboxSubscription(env.DB, mailboxId, {
          subscription_id: subscription.id,
          subscription_expires_at: subExpiresAt,
        });
      } catch (subErr) {
        // Log but don't fail — mailbox is saved, subscription can be retried
        console.error("Graph subscription creation failed:", subErr);
      }
    }

    // 5. Redirect back to settings
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/w/${slug}/settings?section=integrations&connected=1`,
      },
    });
  } catch (err) {
    console.error("Microsoft OAuth callback error:", err);
    const detail = err instanceof Error ? err.message : "oauth_failed";
    return errorRedirect(appUrl, slug, detail);
  }
};
