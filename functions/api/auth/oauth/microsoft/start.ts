import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../../_lib/types";
import {
	MICROSOFT_LOGIN_AUTH_ENDPOINT,
	MICROSOFT_LOGIN_SCOPE,
	buildRedirectUri,
	generateNonce,
	setOAuthStateCookie,
	signOAuthState,
} from "../../../../_lib/oauth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
	const url = new URL(request.url);
	const modeParam = url.searchParams.get("mode");
	const mode: "signin" | "signup" = modeParam === "signup" ? "signup" : "signin";

	const nonce = generateNonce();
	const state = await signOAuthState(env, { provider: "microsoft", mode, nonce });

	const redirectUri = buildRedirectUri(env, "microsoft");
	const authUrl = new URL(MICROSOFT_LOGIN_AUTH_ENDPOINT);
	authUrl.searchParams.set("client_id", env.MS_CLIENT_ID);
	authUrl.searchParams.set("redirect_uri", redirectUri);
	authUrl.searchParams.set("response_type", "code");
	authUrl.searchParams.set("response_mode", "query");
	authUrl.searchParams.set("scope", MICROSOFT_LOGIN_SCOPE);
	authUrl.searchParams.set("state", state);
	authUrl.searchParams.set("prompt", "select_account");

	const isSecure = url.protocol === "https:";
	const headers = new Headers({ Location: authUrl.toString() });
	headers.append("Set-Cookie", setOAuthStateCookie(state, isSecure));

	return new Response(null, { status: 302, headers });
};
