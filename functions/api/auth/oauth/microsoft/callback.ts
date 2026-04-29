import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../../_lib/types";
import {
	MICROSOFT_GRAPH_ME_URL,
	MICROSOFT_LOGIN_SCOPE,
	MICROSOFT_LOGIN_TOKEN_ENDPOINT,
	OAUTH_STATE_COOKIE,
	buildRedirectUri,
	clearOAuthStateCookie,
	findOrCreateOAuthUser,
	issueSessionCookies,
	oauthErrorRedirect,
	verifyOAuthState,
} from "../../../../_lib/oauth";
import { parseCookies } from "../../../../_lib/cookies";

interface MsTokenResponse {
	access_token: string;
	id_token?: string;
	error?: string;
	error_description?: string;
}

interface MsGraphUser {
	id: string;
	mail?: string;
	userPrincipalName?: string;
	displayName?: string;
	givenName?: string;
}

interface MsIdTokenClaims {
	oid?: string;
	sub?: string;
	email?: string;
	preferred_username?: string;
	name?: string;
}

function decodeIdTokenClaims(idToken: string): MsIdTokenClaims | null {
	const parts = idToken.split(".");
	if (parts.length !== 3) return null;
	try {
		const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
		return JSON.parse(json) as MsIdTokenClaims;
	} catch {
		return null;
	}
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

	const redirectUri = buildRedirectUri(env, "microsoft");
	const tokenRes = await fetch(MICROSOFT_LOGIN_TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code,
			client_id: env.MS_CLIENT_ID,
			client_secret: env.MS_CLIENT_SECRET,
			redirect_uri: redirectUri,
			grant_type: "authorization_code",
			scope: MICROSOFT_LOGIN_SCOPE,
		}),
	});

	if (!tokenRes.ok) {
		return oauthErrorRedirect(env, mode, "oauth_token_failed", isSecure);
	}
	const tokenData = (await tokenRes.json()) as MsTokenResponse;
	if (!tokenData.access_token) {
		return oauthErrorRedirect(env, mode, "oauth_token_failed", isSecure);
	}

	const meRes = await fetch(MICROSOFT_GRAPH_ME_URL, {
		headers: { Authorization: `Bearer ${tokenData.access_token}` },
	});
	if (!meRes.ok) {
		return oauthErrorRedirect(env, mode, "oauth_profile_failed", isSecure);
	}
	const me = (await meRes.json()) as MsGraphUser;
	const claims = tokenData.id_token ? decodeIdTokenClaims(tokenData.id_token) : null;

	const providerUserId = me.id || claims?.oid || claims?.sub || "";
	const email = me.mail || me.userPrincipalName || claims?.email || claims?.preferred_username || "";
	const name = me.displayName || claims?.name || me.givenName || (email ? email.split("@")[0] : "");

	if (!providerUserId || !email) {
		return oauthErrorRedirect(env, mode, "oauth_profile_failed", isSecure);
	}

	// Microsoft work/school accounts are issued by an org-controlled tenant, so the email
	// is implicitly verified. For consumer (live.com / outlook.com) accounts the same applies —
	// users can't sign in to MS without owning the address.
	const user = await findOrCreateOAuthUser(env.DB, "microsoft", {
		providerUserId,
		email,
		emailVerified: true,
		name,
	});

	const sessionCookies = await issueSessionCookies(env, request, user);

	const headers = new Headers({ Location: `${env.APP_URL.replace(/\/$/, "")}/workspaces` });
	for (const c of sessionCookies) headers.append("Set-Cookie", c);
	headers.append("Set-Cookie", clearOAuthStateCookie(isSecure));

	return new Response(null, { status: 302, headers });
};
