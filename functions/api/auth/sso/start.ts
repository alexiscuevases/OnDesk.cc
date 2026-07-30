import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import { serializeCookie } from "../../../_lib/cookies";
import {
	SSO_STATE_COOKIE,
	SSO_VERIFIER_COOKIE,
	SSO_STATE_TTL,
	buildAuthorizeUrl,
	deriveCodeChallenge,
	generateCodeVerifier,
	generateState,
} from "../../../_lib/sso";

/**
 * GET /api/auth/sso/start?next=/w/acme/tickets
 *
 * Kicks off the authorization code flow against OnDesk. The PKCE verifier and
 * the CSRF state are stashed in short-lived HttpOnly cookies; the callback
 * refuses to proceed without both.
 *
 * `next` rides in the state cookie rather than in the OIDC `state` parameter so
 * it never leaves our origin.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
	const url = new URL(request.url);
	const nextRaw = url.searchParams.get("next") ?? "/workspaces";
	// Same-origin paths only — otherwise the callback becomes an open redirect.
	const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/workspaces";

	const verifier = generateCodeVerifier();
	const challenge = await deriveCodeChallenge(verifier);
	const state = generateState();

	const authorizeUrl = buildAuthorizeUrl(env, {
		state,
		codeChallenge: challenge,
		prompt: url.searchParams.get("prompt") ?? undefined,
	});

	const isSecure = url.protocol === "https:";
	const cookieOptions = {
		httpOnly: true,
		secure: isSecure,
		// Lax, not Strict: the callback arrives as a cross-site top-level
		// navigation from ondesk.cc, and Strict would withhold these cookies.
		sameSite: "Lax" as const,
		path: "/",
		maxAge: SSO_STATE_TTL,
	};

	const headers = new Headers({ Location: authorizeUrl, "Cache-Control": "no-store" });
	headers.append("Set-Cookie", serializeCookie(SSO_STATE_COOKIE, `${state}|${next}`, cookieOptions));
	headers.append("Set-Cookie", serializeCookie(SSO_VERIFIER_COOKIE, verifier, cookieOptions));

	return new Response(null, { status: 302, headers });
};
