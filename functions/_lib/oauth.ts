import type { Env } from "./types";
import type { OAuthProvider, UserRow } from "./types";
import { signJwt, verifyJwt, generateRefreshToken, hashRefreshToken } from "./crypto";
import {
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	ACCESS_TOKEN_TTL,
	REFRESH_TOKEN_TTL,
	serializeCookie,
} from "./cookies";
import { createRefreshToken, createOAuthUser, findIdentity, findUserByEmail, linkIdentity } from "./db";

export const OAUTH_STATE_COOKIE = "oauth_state";
export const OAUTH_STATE_TTL = 60 * 10; // 10 minutes

export interface OAuthStatePayload {
	provider: OAuthProvider;
	mode: "signin" | "signup";
	nonce: string;
}

export interface OAuthProviderProfile {
	providerUserId: string;
	email: string;
	emailVerified: boolean;
	name: string;
}

export const GOOGLE_LOGIN_SCOPE = "openid email profile";
// `User.Read` is the minimum scope to read the signed-in user's profile.
// `openid email profile` populate the id_token claims we use as a fallback.
export const MICROSOFT_LOGIN_SCOPE = "openid email profile User.Read";
export const MICROSOFT_LOGIN_AUTH_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
export const MICROSOFT_LOGIN_TOKEN_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
export const MICROSOFT_GRAPH_ME_URL = "https://graph.microsoft.com/v1.0/me";

export function buildRedirectUri(env: Env, provider: OAuthProvider): string {
	return `${env.APP_URL.replace(/\/$/, "")}/api/auth/oauth/${provider}/callback`;
}

export async function signOAuthState(env: Env, payload: OAuthStatePayload): Promise<string> {
	// Reuse the JWT helper for HMAC-signed state. We pack our fields into
	// `sub` (provider) / `email` (mode) / `name` (nonce) since the JwtPayload
	// shape is fixed; we ignore `role`.
	return signJwt(
		{
			sub: payload.provider,
			email: payload.mode,
			name: payload.nonce,
			role: "oauth_state",
		},
		env.JWT_SECRET,
		OAUTH_STATE_TTL
	);
}

export async function verifyOAuthState(env: Env, token: string): Promise<OAuthStatePayload | null> {
	const payload = await verifyJwt(token, env.JWT_SECRET);
	if (!payload || payload.role !== "oauth_state") return null;
	if (payload.sub !== "google" && payload.sub !== "microsoft") return null;
	if (payload.email !== "signin" && payload.email !== "signup") return null;
	return {
		provider: payload.sub as OAuthProvider,
		mode: payload.email as "signin" | "signup",
		nonce: payload.name,
	};
}

export function generateNonce(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Find an existing user by OAuth identity, then by verified email; otherwise create a new
 * OAuth-only user. Always (re)links the identity to the resolved user.
 */
export async function findOrCreateOAuthUser(
	db: D1Database,
	provider: OAuthProvider,
	profile: OAuthProviderProfile
): Promise<UserRow> {
	const identity = await findIdentity(db, provider, profile.providerUserId);
	if (identity) {
		const existing = await findUserByEmail(db, identity.email);
		if (existing) return existing;
	}

	if (profile.emailVerified) {
		const byEmail = await findUserByEmail(db, profile.email);
		if (byEmail) {
			await linkIdentity(db, byEmail.id, provider, profile.providerUserId, profile.email);
			return byEmail;
		}
	}

	const created = await createOAuthUser(db, profile.name || profile.email.split("@")[0], profile.email);
	await linkIdentity(db, created.id, provider, profile.providerUserId, profile.email);
	return created;
}

/**
 * Issue access + refresh cookies for the given user and return them as Set-Cookie headers.
 */
export async function issueSessionCookies(env: Env, request: Request, user: UserRow): Promise<string[]> {
	const accessToken = await signJwt(
		{ sub: user.id, email: user.email, name: user.name, role: user.role },
		env.JWT_SECRET,
		ACCESS_TOKEN_TTL
	);

	const refreshToken = generateRefreshToken();
	const refreshTokenHash = await hashRefreshToken(refreshToken);
	await createRefreshToken(env.DB, user.id, refreshTokenHash, REFRESH_TOKEN_TTL);

	const isSecure = new URL(request.url).protocol === "https:";
	const cookieOptions = {
		httpOnly: true,
		secure: isSecure,
		sameSite: "Lax" as const,
		path: "/",
	};

	return [
		serializeCookie(ACCESS_TOKEN_COOKIE, accessToken, { ...cookieOptions, maxAge: ACCESS_TOKEN_TTL }),
		serializeCookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_TOKEN_TTL }),
	];
}

export function clearOAuthStateCookie(isSecure: boolean): string {
	return serializeCookie(OAUTH_STATE_COOKIE, "", {
		httpOnly: true,
		secure: isSecure,
		sameSite: "Lax",
		path: "/",
		maxAge: 0,
	});
}

export function setOAuthStateCookie(value: string, isSecure: boolean): string {
	return serializeCookie(OAUTH_STATE_COOKIE, value, {
		httpOnly: true,
		secure: isSecure,
		sameSite: "Lax",
		path: "/",
		maxAge: OAUTH_STATE_TTL,
	});
}

/**
 * Redirect to /auth/{signin|signup} with an `error` query param.
 */
export function oauthErrorRedirect(env: Env, mode: "signin" | "signup", code: string, isSecure: boolean): Response {
	const url = `${env.APP_URL.replace(/\/$/, "")}/auth/${mode}?error=${encodeURIComponent(code)}`;
	const headers = new Headers({ Location: url });
	headers.append("Set-Cookie", clearOAuthStateCookie(isSecure));
	return new Response(null, { status: 302, headers });
}
