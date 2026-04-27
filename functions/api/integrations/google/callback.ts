import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import {
	createMailboxIntegration,
	findMailboxIntegrationByEmail,
	updateMailboxTokens,
	updateMailboxSubscription,
	updateMailboxLastHistoryId,
} from "../../../_lib/db";
import {
	exchangeGmailCodeForTokens,
	getGmailUserProfile,
	watchGmailMailbox,
} from "../../../_lib/gmail";

function errorRedirect(appUrl: string, slug: string, msg: string): Response {
	return new Response(null, {
		status: 302,
		headers: {
			Location: `${appUrl}/w/${slug}/settings?section=integrations&error=${encodeURIComponent(msg)}`,
		},
	});
}

// GET /api/integrations/google/callback?code=&state=
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const stateParam = url.searchParams.get("state");
	const errorParam = url.searchParams.get("error");

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

	const redirectUri = `${appUrl}/api/integrations/google/callback`;

	try {
		// 1. Exchange code for tokens
		const tokens = await exchangeGmailCodeForTokens(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, code, redirectUri);

		const nowSecs = Math.floor(Date.now() / 1000);
		const tokenExpiresAt = nowSecs + tokens.expires_in;

		// 2. Get user profile
		const profile = await getGmailUserProfile(tokens.access_token);
		const email = profile.email.toLowerCase();

		// 3. Upsert mailbox integration
		let mailboxId: string;
		const existing = await findMailboxIntegrationByEmail(env.DB, workspaceId, email);

		if (existing) {
			const updateData: { access_token: string; refresh_token: string; token_expires_at: number } = {
				access_token: tokens.access_token,
				// Google only sends refresh_token on first auth — keep old one if not provided
				refresh_token: tokens.refresh_token ?? existing.refresh_token,
				token_expires_at: tokenExpiresAt,
			};
			await updateMailboxTokens(env.DB, existing.id, updateData);
			mailboxId = existing.id;
		} else {
			if (!tokens.refresh_token) {
				return errorRedirect(appUrl, slug, "no_refresh_token");
			}
			const mailbox = await createMailboxIntegration(env.DB, {
				workspace_id: workspaceId,
				email,
				provider: "google",
				ms_user_id: profile.id, // store Google user ID in ms_user_id
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token,
				token_expires_at: tokenExpiresAt,
				client_state_secret: crypto.randomUUID(),
			});
			mailboxId = mailbox.id;
		}

		// 4. Set up Gmail push notifications (requires HTTPS)
		if (appUrl.startsWith("https://") && env.GOOGLE_PUBSUB_TOPIC) {
			try {
				const watch = await watchGmailMailbox(tokens.access_token, env.GOOGLE_PUBSUB_TOPIC);
				const subExpiresAt = Math.floor(Number(watch.expiration) / 1000);
				await updateMailboxSubscription(env.DB, mailboxId, {
					subscription_id: watch.historyId,
					subscription_expires_at: subExpiresAt,
				});
				await updateMailboxLastHistoryId(env.DB, mailboxId, watch.historyId);
			} catch (watchErr) {
				// Non-fatal — mailbox saved, watch can be retried
				console.error("Gmail watch setup failed:", watchErr);
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
		console.error("Google OAuth callback error:", err);
		const detail = err instanceof Error ? err.message : "oauth_failed";
		return errorRedirect(appUrl, slug, detail);
	}
};
