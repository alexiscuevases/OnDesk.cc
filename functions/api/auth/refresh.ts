import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { signJwt, generateRefreshToken, hashRefreshToken } from "../../_lib/crypto";
import { findRefreshToken, revokeRefreshToken, createRefreshToken, findUserById } from "../../_lib/db";
import {
	parseCookies,
	serializeCookie,
	REFRESH_TOKEN_COOKIE,
	ACCESS_TOKEN_COOKIE,
	ACCESS_TOKEN_TTL,
	REFRESH_TOKEN_TTL,
} from "../../_lib/cookies";
import { jsonError } from "../../_lib/response";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const cookies = parseCookies(request.headers.get("Cookie"));
	const rawRefreshToken = cookies[REFRESH_TOKEN_COOKIE];

	if (!rawRefreshToken) {
		return jsonError("No refresh token", 401);
	}

	const tokenHash = await hashRefreshToken(rawRefreshToken);
	const storedToken = await findRefreshToken(env.DB, tokenHash);

	if (!storedToken || storedToken.expires_at < Math.floor(Date.now() / 1000)) {
		return jsonError("Invalid or expired refresh token", 401);
	}

	const user = await findUserById(env.DB, storedToken.user_id);
	if (!user) {
		return jsonError("User not found", 401);
	}

	await revokeRefreshToken(env.DB, tokenHash);

	const newAccessToken = await signJwt(
		{ sub: user.id, email: user.email, name: user.name, role: user.role },
		env.JWT_SECRET,
		ACCESS_TOKEN_TTL
	);

	const newRefreshToken = generateRefreshToken();
	const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);
	await createRefreshToken(env.DB, user.id, newRefreshTokenHash, REFRESH_TOKEN_TTL);

	const isSecure = new URL(request.url).protocol === "https:";
	const cookieOptions = {
		httpOnly: true,
		secure: isSecure,
		sameSite: "Strict" as const,
		path: "/",
	};

	const headers = new Headers({ "Content-Type": "application/json" });
	headers.append(
		"Set-Cookie",
		serializeCookie(ACCESS_TOKEN_COOKIE, newAccessToken, {
			...cookieOptions,
			maxAge: ACCESS_TOKEN_TTL,
		})
	);
	headers.append(
		"Set-Cookie",
		serializeCookie(REFRESH_TOKEN_COOKIE, newRefreshToken, {
			...cookieOptions,
			maxAge: REFRESH_TOKEN_TTL,
		})
	);

	return new Response(
		JSON.stringify({
			user: { id: user.id, name: user.name, email: user.email, role: user.role },
		}),
		{ status: 200, headers }
	);
};
