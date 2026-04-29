import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../../_lib/types";
import {
	GOOGLE_LOGIN_SCOPE,
	buildRedirectUri,
	generateNonce,
	setOAuthStateCookie,
	signOAuthState,
} from "../../../../_lib/oauth";
import { GOOGLE_GMAIL_CONFIG } from "../../../../_lib/configs";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
	const url = new URL(request.url);
	const modeParam = url.searchParams.get("mode");
	const mode: "signin" | "signup" = modeParam === "signup" ? "signup" : "signin";

	const nonce = generateNonce();
	const state = await signOAuthState(env, { provider: "google", mode, nonce });

	const redirectUri = buildRedirectUri(env, "google");
	const authUrl = new URL(GOOGLE_GMAIL_CONFIG.AUTH_ENDPOINT);
	authUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
	authUrl.searchParams.set("redirect_uri", redirectUri);
	authUrl.searchParams.set("response_type", "code");
	authUrl.searchParams.set("scope", GOOGLE_LOGIN_SCOPE);
	authUrl.searchParams.set("state", state);
	authUrl.searchParams.set("access_type", "online");
	authUrl.searchParams.set("prompt", "select_account");

	const isSecure = url.protocol === "https:";
	const headers = new Headers({ Location: authUrl.toString() });
	headers.append("Set-Cookie", setOAuthStateCookie(state, isSecure));

	return new Response(null, { status: 302, headers });
};
