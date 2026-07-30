/** Backs pulse's own session cookie, issued by the SSO callback. */
export interface RefreshTokenRow {
	id: string;
	user_id: string;
	token_hash: string;
	expires_at: number;
	created_at: number;
	revoked: number;
}

/**
 * Payload of pulse's local access token (HS256, never leaves this origin).
 *
 * `sub` is the OnDesk user id — the same value in every product — which is what
 * lets the mirrored users table keep its foreign keys.
 */
export interface JwtPayload {
	sub: string;
	email: string;
	name: string;
	role: string;
	iat: number;
	exp: number;
}
