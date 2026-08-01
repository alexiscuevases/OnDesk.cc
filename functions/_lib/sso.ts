import type { Env } from "./types";

/**
 * OIDC client for the OnDesk control plane.
 *
 * Pulse no longer authenticates anyone: it exchanges a code for an identity and
 * then issues its *own* session, exactly as before. Everything downstream of
 * `withAuth` is untouched by the migration.
 *
 * See ondesk/docs/platform-architecture.md.
 */

export const SSO_STATE_COOKIE = "sso_state";
export const SSO_VERIFIER_COOKIE = "sso_verifier";
export const SSO_STATE_TTL = 60 * 10; // 10 minutes

export interface IdTokenWorkspace {
	id: string;
	name: string;
	slug: string;
	logo_url: string | null;
	/** Tenancy: owner / admin / agent. Who administers the workspace on the platform. */
	role: string;
	/**
	 * What this person may do inside Pulse, resolved by ondesk from the role on
	 * their Pulse seat. Optional because a token minted before roles moved has no
	 * such claim; `getUserPermissions` falls back to the built-in preset.
	 */
	permissions?: string[];
	entitlement: {
		plan: string;
		status: string;
		agent_count: number;
		current_period_end: number | null;
	} | null;
	/** The tenant's logging preference, mirrored so our audit trail honours it. */
	audit_log_enabled: boolean;
}

export interface IdTokenClaims {
	iss: string;
	sub: string;
	aud: string;
	exp: number;
	iat: number;
	nonce?: string;
	email: string;
	email_verified: boolean;
	name: string;
	picture: string | null;
	workspaces: IdTokenWorkspace[];
}

interface TokenResponse {
	access_token: string;
	id_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

interface Jwk {
	kty: string;
	n: string;
	e: string;
	kid?: string;
	alg?: string;
	use?: string;
}

// ─── base64url ────────────────────────────────────────────────────────────────

function base64UrlEncode(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
	const padded = str.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
	return new Uint8Array(Array.from(binary, (c) => c.charCodeAt(0)));
}

// ─── PKCE ─────────────────────────────────────────────────────────────────────

export function generateCodeVerifier(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export async function deriveCodeChallenge(verifier: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
	return base64UrlEncode(digest);
}

export function generateState(): string {
	return generateCodeVerifier();
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export function ondeskIssuer(env: Env): string {
	return (env.ONDESK_ISSUER ?? "https://ondesk.cc").replace(/\/$/, "");
}

export function ssoRedirectUri(env: Env): string {
	return `${env.APP_URL.replace(/\/$/, "")}/api/auth/sso/callback`;
}

export function buildAuthorizeUrl(
	env: Env,
	opts: { state: string; codeChallenge: string; prompt?: string },
): string {
	const url = new URL(`${ondeskIssuer(env)}/api/oidc/authorize`);
	url.searchParams.set("client_id", env.ONDESK_CLIENT_ID);
	url.searchParams.set("redirect_uri", ssoRedirectUri(env));
	url.searchParams.set("response_type", "code");
	url.searchParams.set("scope", "openid profile email workspaces");
	url.searchParams.set("state", opts.state);
	url.searchParams.set("code_challenge", opts.codeChallenge);
	url.searchParams.set("code_challenge_method", "S256");
	if (opts.prompt) url.searchParams.set("prompt", opts.prompt);
	return url.toString();
}

export async function exchangeCode(env: Env, code: string, verifier: string): Promise<TokenResponse> {
	const res = await fetch(`${ondeskIssuer(env)}/api/oidc/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${btoa(`${encodeURIComponent(env.ONDESK_CLIENT_ID)}:${encodeURIComponent(env.ONDESK_CLIENT_SECRET)}`)}`,
		},
		body: new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: ssoRedirectUri(env),
			code_verifier: verifier,
		}),
	});

	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Token exchange failed (${res.status}): ${detail}`);
	}
	return (await res.json()) as TokenResponse;
}

// ─── ID token verification ────────────────────────────────────────────────────

// Cached across requests on a warm isolate. The TTL bounds how long a rotated-out
// key stays trusted here.
let jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;
const JWKS_TTL = 60 * 60;

async function fetchJwks(env: Env): Promise<Jwk[]> {
	const now = Math.floor(Date.now() / 1000);
	if (jwksCache && now - jwksCache.fetchedAt < JWKS_TTL) return jwksCache.keys;

	const res = await fetch(`${ondeskIssuer(env)}/api/oidc/jwks`);
	if (!res.ok) throw new Error(`Failed to fetch JWKS (${res.status})`);

	const body = (await res.json()) as { keys: Jwk[] };
	jwksCache = { keys: body.keys, fetchedAt: now };
	return body.keys;
}

/**
 * Full verification: signature, issuer, audience and expiry. Never decode an ID
 * token without this — an unverified token is attacker-supplied JSON, and its
 * `sub` is what we are about to trust as an identity.
 */
export async function verifyIdToken(env: Env, idToken: string): Promise<IdTokenClaims> {
	const parts = idToken.split(".");
	if (parts.length !== 3) throw new Error("Malformed ID token");

	const [headerB64, payloadB64, sigB64] = parts;
	const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64))) as {
		alg: string;
		kid?: string;
	};
	if (header.alg !== "RS256") throw new Error(`Unexpected ID token algorithm: ${header.alg}`);

	const keys = await fetchJwks(env);
	// Match on kid when present; fall back to the sole key when the set has one.
	const jwk = header.kid ? keys.find((k) => k.kid === header.kid) : keys[0];
	if (!jwk) throw new Error("No matching signing key for this ID token");

	const key = await crypto.subtle.importKey(
		"jwk",
		{ kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true, key_ops: ["verify"] } as JsonWebKey,
		{ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
		false,
		["verify"],
	);

	const valid = await crypto.subtle.verify(
		"RSASSA-PKCS1-v1_5",
		key,
		base64UrlDecode(sigB64).buffer as ArrayBuffer,
		new TextEncoder().encode(`${headerB64}.${payloadB64}`),
	);
	if (!valid) throw new Error("ID token signature is invalid");

	const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64))) as IdTokenClaims;

	if (claims.iss !== ondeskIssuer(env)) throw new Error("ID token issuer mismatch");
	if (claims.aud !== env.ONDESK_CLIENT_ID) throw new Error("ID token audience mismatch");
	if (claims.exp < Math.floor(Date.now() / 1000)) throw new Error("ID token has expired");

	return claims;
}

// ─── Inbound webhook verification ─────────────────────────────────────────────

/**
 * Verifies a mirror-sync webhook from ondesk. The timestamp is inside the signed
 * body, so rejecting old ones bounds how long a captured request stays useful.
 */
export async function verifyPlatformWebhook(
	env: Env,
	body: string,
	signature: string | null,
): Promise<boolean> {
	if (!signature || !env.ONDESK_WEBHOOK_SECRET) return false;

	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(env.ONDESK_WEBHOOK_SECRET),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const expected = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
	const expectedHex = Array.from(new Uint8Array(expected))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	if (expectedHex.length !== signature.length) return false;
	let diff = 0;
	for (let i = 0; i < expectedHex.length; i++) diff |= expectedHex.charCodeAt(i) ^ signature.charCodeAt(i);
	return diff === 0;
}
