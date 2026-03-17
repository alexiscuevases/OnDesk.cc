import type { UserRow, RefreshTokenRow } from "../types";

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
