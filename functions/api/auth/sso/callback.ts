import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import { signJwt, generateRefreshToken, hashRefreshToken } from "../../../_lib/crypto";
import { createRefreshToken } from "../../../_lib/db";
import { provisionFromIdToken, entitledWorkspaces } from "../../../_lib/db/mirror";
import {
	parseCookies,
	serializeCookie,
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	ACCESS_TOKEN_TTL,
	REFRESH_TOKEN_TTL,
} from "../../../_lib/cookies";
import { SSO_STATE_COOKIE, SSO_VERIFIER_COOKIE, exchangeCode, verifyIdToken } from "../../../_lib/sso";

function errorRedirect(env: Env, code: string): Response {
	const url = `${env.APP_URL.replace(/\/$/, "")}/auth/error?reason=${encodeURIComponent(code)}`;
	return new Response(null, { status: 302, headers: { Location: url } });
}

/**
 * GET /api/auth/sso/callback?code=...&state=...
 *
 * Exchanges the code, verifies the ID token, refreshes the local mirror, and
 * issues pulse's own session cookies. From here on nothing else in the codebase
 * knows that authentication moved — `withAuth` reads the same cookie it always
 * did.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
	const url = new URL(request.url);
	const isSecure = url.protocol === "https:";

	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const oauthError = url.searchParams.get("error");

	if (oauthError) return errorRedirect(env, oauthError);
	if (!code || !state) return errorRedirect(env, "missing_code");

	const cookies = parseCookies(request.headers.get("Cookie"));
	const stateCookie = cookies[SSO_STATE_COOKIE];
	const verifier = cookies[SSO_VERIFIER_COOKIE];

	if (!stateCookie || !verifier) return errorRedirect(env, "missing_state");

	const separator = stateCookie.indexOf("|");
	const expectedState = separator === -1 ? stateCookie : stateCookie.slice(0, separator);
	const next = separator === -1 ? "/workspaces" : stateCookie.slice(separator + 1);

	if (expectedState !== state) return errorRedirect(env, "state_mismatch");

	let claims;
	try {
		const tokens = await exchangeCode(env, code, verifier);
		claims = await verifyIdToken(env, tokens.id_token);
	} catch {
		return errorRedirect(env, "exchange_failed");
	}

	// Refresh the mirror before issuing a session — the very next request will
	// JOIN against these rows.
	await provisionFromIdToken(env.DB, claims);

	const entitled = entitledWorkspaces(claims);
	if (entitled.length === 0) {
		// Authenticated, but this tenant doesn't have Pulse. Send them back to
		// OnDesk to subscribe rather than into an empty app.
		const subscribe = `${(env.ONDESK_ISSUER ?? "https://ondesk.cc").replace(/\/$/, "")}/apps/pulse`;
		return new Response(null, { status: 302, headers: { Location: subscribe } });
	}

	const accessToken = await signJwt(
		{ sub: claims.sub, email: claims.email, name: claims.name, role: "agent" },
		env.JWT_SECRET,
		ACCESS_TOKEN_TTL,
	);

	const refreshToken = generateRefreshToken();
	const refreshTokenHash = await hashRefreshToken(refreshToken);
	await createRefreshToken(env.DB, claims.sub, refreshTokenHash, REFRESH_TOKEN_TTL);

	const sessionOptions = { httpOnly: true, secure: isSecure, sameSite: "Strict" as const, path: "/" };
	const clearOptions = { httpOnly: true, secure: isSecure, sameSite: "Lax" as const, path: "/", maxAge: 0 };

	const headers = new Headers({
		Location: `${env.APP_URL.replace(/\/$/, "")}${next}`,
		"Cache-Control": "no-store",
	});
	headers.append(
		"Set-Cookie",
		serializeCookie(ACCESS_TOKEN_COOKIE, accessToken, { ...sessionOptions, maxAge: ACCESS_TOKEN_TTL }),
	);
	headers.append(
		"Set-Cookie",
		serializeCookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...sessionOptions, maxAge: REFRESH_TOKEN_TTL }),
	);
	headers.append("Set-Cookie", serializeCookie(SSO_STATE_COOKIE, "", clearOptions));
	headers.append("Set-Cookie", serializeCookie(SSO_VERIFIER_COOKIE, "", clearOptions));

	return new Response(null, { status: 302, headers });
};
