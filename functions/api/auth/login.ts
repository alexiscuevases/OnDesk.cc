import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyPassword, signJwt, generateRefreshToken, hashRefreshToken } from "../../_lib/crypto";
import {
	findUserByEmail,
	createRefreshToken,
	incrementLoginAttempts,
	lockUser,
	resetLoginAttempts,
	createTwoFactorCode,
	invalidateTwoFactorCodes,
} from "../../_lib/db";
import {
	serializeCookie,
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	ACCESS_TOKEN_TTL,
	REFRESH_TOKEN_TTL,
	REMEMBER_ME_REFRESH_TOKEN_TTL,
} from "../../_lib/cookies";
import { jsonError } from "../../_lib/response";
import { parseJsonBody } from "../../_lib/http";
import { sendEmail, accountLockedEmail, twoFactorCodeEmail } from "../../_lib/email";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_SECONDS = 30 * 60; // 30 minutes
const TWO_FA_CODE_TTL = 10 * 60; // 10 minutes

function generateSixDigitCode(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(4));
	const num = (new DataView(bytes.buffer).getUint32(0) % 900000) + 100000;
	return String(num);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const parsed = await parseJsonBody(request);
	if (!parsed.ok) return parsed.response;
	const body = parsed.body as { email?: string; password?: string; rememberMe?: boolean };

	const { email, password, rememberMe = false } = body;
	if (!email || !password) {
		return jsonError("email and password are required");
	}

	const user = await findUserByEmail(env.DB, email);
	if (!user || !user.password_hash) {
		await new Promise((r) => setTimeout(r, 300));
		return jsonError("Invalid credentials", 401);
	}

	const now = Math.floor(Date.now() / 1000);

	// Check if account is locked
	if (user.locked_until && user.locked_until > now) {
		const minutesLeft = Math.ceil((user.locked_until - now) / 60);
		return jsonError(`Account locked. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"} or reset your password.`, 423);
	}

	const passwordValid = await verifyPassword(password, user.password_hash);
	if (!passwordValid) {
		const attempts = (user.login_attempts ?? 0) + 1;
		if (attempts >= MAX_LOGIN_ATTEMPTS) {
			const lockedUntil = now + LOCK_DURATION_SECONDS;
			await lockUser(env.DB, user.id, lockedUntil);
			try {
				await sendEmail(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL, {
					to: user.email,
					subject: "Your OnDesk account has been locked",
					html: accountLockedEmail(env.APP_URL, user.name),
				});
			} catch {
				// Don't fail the request if email fails
			}
			return jsonError("Too many failed attempts. Account locked for 30 minutes. Check your email.", 423);
		}
		await incrementLoginAttempts(env.DB, user.id);
		const remaining = MAX_LOGIN_ATTEMPTS - attempts;
		return jsonError(`Invalid credentials. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining before lockout.`, 401);
	}

	// Password correct — reset lockout counters
	await resetLoginAttempts(env.DB, user.id);

	// 2FA check
	if (user.two_factor_enabled) {
		const code = generateSixDigitCode();
		const codeHash = await hashRefreshToken(code);
		await invalidateTwoFactorCodes(env.DB, user.id);
		await createTwoFactorCode(env.DB, user.id, codeHash, TWO_FA_CODE_TTL);

		try {
			await sendEmail(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL, {
				to: user.email,
				subject: "Your OnDesk sign-in code",
				html: twoFactorCodeEmail(code, user.name),
			});
		} catch {
			return jsonError("Failed to send verification code. Please try again.", 500);
		}

		// Issue a short-lived token that identifies the pending 2FA session
		const twoFactorToken = await signJwt(
			{ sub: user.id, email: user.email, name: user.name, role: user.role, type: "2fa_pending" } as Parameters<typeof signJwt>[0] & { type: string },
			env.JWT_SECRET,
			TWO_FA_CODE_TTL
		);

		return new Response(
			JSON.stringify({ requiresTwoFactor: true, twoFactorToken }),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	}

	// Issue session
	const refreshTTL = rememberMe ? REMEMBER_ME_REFRESH_TOKEN_TTL : REFRESH_TOKEN_TTL;

	const accessToken = await signJwt(
		{ sub: user.id, email: user.email, name: user.name, role: user.role },
		env.JWT_SECRET,
		ACCESS_TOKEN_TTL
	);

	const refreshToken = generateRefreshToken();
	const refreshTokenHash = await hashRefreshToken(refreshToken);
	await createRefreshToken(env.DB, user.id, refreshTokenHash, refreshTTL);

	const isSecure = new URL(request.url).protocol === "https:";
	const cookieOptions = { httpOnly: true, secure: isSecure, sameSite: "Strict" as const, path: "/" };

	const headers = new Headers({ "Content-Type": "application/json" });
	headers.append("Set-Cookie", serializeCookie(ACCESS_TOKEN_COOKIE, accessToken, { ...cookieOptions, maxAge: ACCESS_TOKEN_TTL }));
	headers.append("Set-Cookie", serializeCookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...cookieOptions, maxAge: refreshTTL }));

	return new Response(
		JSON.stringify({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }),
		{ status: 200, headers }
	);
};
