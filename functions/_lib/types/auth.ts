export interface RefreshTokenRow {
	id: string;
	user_id: string;
	token_hash: string;
	expires_at: number;
	created_at: number;
	revoked: number;
}

export interface PasswordResetTokenRow {
	id: string;
	user_id: string;
	token_hash: string;
	expires_at: number;
	used: number;
	created_at: number;
}

export interface TwoFactorCodeRow {
	id: string;
	user_id: string;
	code_hash: string;
	expires_at: number;
	used: number;
	created_at: number;
}

export interface JwtPayload {
	sub: string;
	email: string;
	name: string;
	role: string;
	/** '2fa_pending' for tokens issued mid-login waiting for 2FA verification */
	type?: string;
	iat: number;
	exp: number;
}
