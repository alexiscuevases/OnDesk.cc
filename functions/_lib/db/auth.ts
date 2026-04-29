import type { UserRow, RefreshTokenRow, UserIdentityRow, OAuthProvider } from "../types";

export async function findUserByEmail(db: D1Database, email: string): Promise<UserRow | null> {
	const result = await db.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").bind(email.toLowerCase()).first<UserRow>();
	return result ?? null;
}

export async function findUserById(db: D1Database, id: string): Promise<UserRow | null> {
	const result = await db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(id).first<UserRow>();
	return result ?? null;
}

export async function createUser(db: D1Database, name: string, email: string, passwordHash: string): Promise<UserRow> {
	const id = crypto.randomUUID();
	await db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)").bind(id, name, email.toLowerCase(), passwordHash).run();
	return (await findUserById(db, id))!;
}

export async function createOAuthUser(db: D1Database, name: string, email: string): Promise<UserRow> {
	const id = crypto.randomUUID();
	// Empty-string placeholder satisfies legacy NOT NULL on existing DBs;
	// verifyPassword always returns false for empty hashes, so password login is impossible.
	await db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)").bind(id, name, email.toLowerCase(), "").run();
	return (await findUserById(db, id))!;
}

export async function findIdentity(
	db: D1Database,
	provider: OAuthProvider,
	providerUserId: string
): Promise<UserIdentityRow | null> {
	const result = await db
		.prepare("SELECT * FROM user_identities WHERE provider = ? AND provider_user_id = ? LIMIT 1")
		.bind(provider, providerUserId)
		.first<UserIdentityRow>();
	return result ?? null;
}

export async function linkIdentity(
	db: D1Database,
	userId: string,
	provider: OAuthProvider,
	providerUserId: string,
	email: string
): Promise<void> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			"INSERT OR IGNORE INTO user_identities (id, user_id, provider, provider_user_id, email) VALUES (?, ?, ?, ?, ?)"
		)
		.bind(id, userId, provider, providerUserId, email.toLowerCase())
		.run();
}

export async function createRefreshToken(db: D1Database, userId: string, tokenHash: string, ttlSeconds: number): Promise<void> {
	const id = crypto.randomUUID();
	const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
	await db.prepare("INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)").bind(id, userId, tokenHash, expiresAt).run();
}

export async function findRefreshToken(db: D1Database, tokenHash: string): Promise<RefreshTokenRow | null> {
	const result = await db.prepare("SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0 LIMIT 1").bind(tokenHash).first<RefreshTokenRow>();
	return result ?? null;
}

export async function revokeRefreshToken(db: D1Database, tokenHash: string): Promise<void> {
	await db.prepare("UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?").bind(tokenHash).run();
}

export async function revokeAllUserRefreshTokens(db: D1Database, userId: string): Promise<void> {
	await db.prepare("UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?").bind(userId).run();
}
