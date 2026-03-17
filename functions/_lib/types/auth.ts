export interface RefreshTokenRow {
	id: string;
	user_id: string;
	token_hash: string;
	expires_at: number;
	created_at: number;
	revoked: number;
}

export interface JwtPayload {
	sub: string;
	email: string;
	name: string;
	role: string;
	iat: number;
	exp: number;
}
