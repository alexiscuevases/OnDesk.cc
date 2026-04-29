import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../../_lib/types";
import {
	buildRedirectUri,
	clearOAuthStateCookie,
	findOrCreateOAuthUser,
	issueSessionCookies,
	oauthErrorRedirect,
	verifyOAuthState,
	OAUTH_STATE_COOKIE,
} from "../../../../_lib/oauth";
import { GOOGLE_GMAIL_CONFIG } from "../../../../_lib/configs";
import { parseCookies } from "../../../../_lib/cookies";

interface GoogleTokenResponse {
	access_token: string;
	id_token?: string;
	error?: string;
	error_description?: string;
}

interface GoogleUserInfo {
	id: string;
	email: string;
	verified_email?: boolean;
	name?: string;
	given_name?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
	const url = new URL(request.url);
	const isSecure = url.protocol === "https:";
	const code = url.searchParams.get("code");
	const stateParam = url.searchParams.get("state");
	const errorParam = url.searchParams.get("error");

	const cookies = parseCookies(request.headers.get("Cookie"));
	const stateCookie = cookies[OAUTH_STATE_COOKIE];

	const stateData = stateParam ? await verifyOAuthState(env, stateParam) : null;
	const mode: "signin" | "signup" = stateData?.mode ?? "signin";

	if (errorParam) {
		return oauthErrorRedirect(env, mode, "oauth_denied", isSecure);
	}
	if (!code || !stateParam || !stateCookie || stateCookie !== stateParam || !stateData) {
		return oauthErrorRedirect(env, mode, "oauth_invalid_state", isSecure);
	}

	const redirectUri = buildRedirectUri(env, "google");
	const tokenRes = await fetch(GOOGLE_GMAIL_CONFIG.TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code,
			client_id: env.GOOGLE_CLIENT_ID,
			client_secret: env.GOOGLE_CLIENT_SECRET,
			redirect_uri: redirectUri,
			grant_type: "authorization_code",
		}),
	});

	if (!tokenRes.ok) {
		return oauthErrorRedirect(env, mode, "oauth_token_failed", isSecure);
	}
	const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
	if (!tokenData.access_token) {
		return oauthErrorRedirect(env, mode, "oauth_token_failed", isSecure);
	}

	const userRes = await fetch(GOOGLE_GMAIL_CONFIG.USERINFO_URL, {
		headers: { Authorization: `Bearer ${tokenData.access_token}` },
	});
	if (!userRes.ok) {
		return oauthErrorRedirect(env, mode, "oauth_profile_failed", isSecure);
	}
	const profile = (await userRes.json()) as GoogleUserInfo;
	if (!profile.email || !profile.id) {
		return oauthErrorRedirect(env, mode, "oauth_profile_failed", isSecure);
	}

	const user = await findOrCreateOAuthUser(env.DB, "google", {
		providerUserId: profile.id,
		email: profile.email,
		emailVerified: profile.verified_email === true,
		name: profile.name || profile.given_name || profile.email.split("@")[0],
	});

	const sessionCookies = await issueSessionCookies(env, request, user);

	const headers = new Headers({ Location: `${env.APP_URL.replace(/\/$/, "")}/workspaces` });
	for (const c of sessionCookies) headers.append("Set-Cookie", c);
	headers.append("Set-Cookie", clearOAuthStateCookie(isSecure));

	return new Response(null, { status: 302, headers });
};
