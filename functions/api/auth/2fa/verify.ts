import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import { verifyJwt, signJwt, generateRefreshToken, hashRefreshToken } from "../../../_lib/crypto";
import {
	findLatestTwoFactorCode,
	markTwoFactorCodeUsed,
	createRefreshToken,
} from "../../../_lib/db";
import {
	serializeCookie,
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	ACCESS_TOKEN_TTL,
	REFRESH_TOKEN_TTL,
	REMEMBER_ME_REFRESH_TOKEN_TTL,
} from "../../../_lib/cookies";
import { jsonError } from "../../../_lib/response";
import { parseJsonBody } from "../../../_lib/http";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const parsed = await parseJsonBody(request);
	if (!parsed.ok) return parsed.response;
	const body = parsed.body as { twoFactorToken?: string; code?: string; rememberMe?: boolean };

	if (!body.twoFactorToken || !body.code) {
		return jsonError("twoFactorToken and code are required");
	}

	const payload = await verifyJwt(body.twoFactorToken, env.JWT_SECRET);
	if (!payload || payload.type !== "2fa_pending") {
		return jsonError("Invalid or expired session. Please sign in again.", 401);
	}

	const now = Math.floor(Date.now() / 1000);
	const userId = payload.sub;

	const record = await findLatestTwoFactorCode(env.DB, userId);
	const codeHash = await hashRefreshToken(body.code.trim());

	if (!record || record.expires_at < now || record.code_hash !== codeHash) {
		return jsonError("Invalid or expired code", 401);
	}

	await markTwoFactorCodeUsed(env.DB, record.id);

	// Issue full session
	const rememberMe = body.rememberMe ?? false;
	const refreshTTL = rememberMe ? REMEMBER_ME_REFRESH_TOKEN_TTL : REFRESH_TOKEN_TTL;

	const accessToken = await signJwt(
		{ sub: payload.sub, email: payload.email, name: payload.name, role: payload.role },
		env.JWT_SECRET,
		ACCESS_TOKEN_TTL
	);

	const refreshToken = generateRefreshToken();
	const refreshTokenHash = await hashRefreshToken(refreshToken);
	await createRefreshToken(env.DB, userId, refreshTokenHash, refreshTTL);

	const isSecure = new URL(request.url).protocol === "https:";
	const cookieOptions = { httpOnly: true, secure: isSecure, sameSite: "Strict" as const, path: "/" };

	const headers = new Headers({ "Content-Type": "application/json" });
	headers.append("Set-Cookie", serializeCookie(ACCESS_TOKEN_COOKIE, accessToken, { ...cookieOptions, maxAge: ACCESS_TOKEN_TTL }));
	headers.append("Set-Cookie", serializeCookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...cookieOptions, maxAge: refreshTTL }));

	return new Response(
		JSON.stringify({ user: { id: payload.sub, name: payload.name, email: payload.email, role: payload.role } }),
		{ status: 200, headers }
	);
};
