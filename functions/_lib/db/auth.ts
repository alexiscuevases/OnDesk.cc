import type { UserRow, RefreshTokenRow, UserIdentityRow, OAuthProvider } from "../types";
import type { PasswordResetTokenRow, TwoFactorCodeRow } from "../types/auth";

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

// ─── Login lockout ────────────────────────────────────────────────────────────

export async function incrementLoginAttempts(db: D1Database, userId: string): Promise<void> {
	await db.prepare("UPDATE users SET login_attempts = login_attempts + 1 WHERE id = ?").bind(userId).run();
}

export async function lockUser(db: D1Database, userId: string, lockedUntil: number): Promise<void> {
	await db.prepare("UPDATE users SET login_attempts = 0, locked_until = ? WHERE id = ?").bind(lockedUntil, userId).run();
}

export async function resetLoginAttempts(db: D1Database, userId: string): Promise<void> {
	await db.prepare("UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?").bind(userId).run();
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function invalidatePasswordResetTokens(db: D1Database, userId: string): Promise<void> {
	await db.prepare("UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0").bind(userId).run();
}

export async function createPasswordResetToken(db: D1Database, userId: string, tokenHash: string, ttlSeconds: number): Promise<void> {
	const id = crypto.randomUUID();
	const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
	await db.prepare("INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)").bind(id, userId, tokenHash, expiresAt).run();
}

export async function findPasswordResetToken(db: D1Database, tokenHash: string): Promise<PasswordResetTokenRow | null> {
	const result = await db
		.prepare("SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used = 0 LIMIT 1")
		.bind(tokenHash)
		.first<PasswordResetTokenRow>();
	return result ?? null;
}

export async function markPasswordResetTokenUsed(db: D1Database, id: string): Promise<void> {
	await db.prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ?").bind(id).run();
}

export async function updateUserPassword(db: D1Database, userId: string, passwordHash: string): Promise<void> {
	await db.prepare("UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ?").bind(passwordHash, userId).run();
}

// ─── 2FA codes ────────────────────────────────────────────────────────────────

export async function invalidateTwoFactorCodes(db: D1Database, userId: string): Promise<void> {
	await db.prepare("UPDATE two_factor_codes SET used = 1 WHERE user_id = ? AND used = 0").bind(userId).run();
}

export async function createTwoFactorCode(db: D1Database, userId: string, codeHash: string, ttlSeconds: number): Promise<void> {
	const id = crypto.randomUUID();
	const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
	await db.prepare("INSERT INTO two_factor_codes (id, user_id, code_hash, expires_at) VALUES (?, ?, ?, ?)").bind(id, userId, codeHash, expiresAt).run();
}

export async function findLatestTwoFactorCode(db: D1Database, userId: string): Promise<TwoFactorCodeRow | null> {
	const result = await db
		.prepare("SELECT * FROM two_factor_codes WHERE user_id = ? AND used = 0 ORDER BY created_at DESC LIMIT 1")
		.bind(userId)
		.first<TwoFactorCodeRow>();
	return result ?? null;
}

export async function markTwoFactorCodeUsed(db: D1Database, id: string): Promise<void> {
	await db.prepare("UPDATE two_factor_codes SET used = 1 WHERE id = ?").bind(id).run();
}

export async function setTwoFactorEnabled(db: D1Database, userId: string, enabled: boolean): Promise<void> {
	await db.prepare("UPDATE users SET two_factor_enabled = ?, updated_at = unixepoch() WHERE id = ?").bind(enabled ? 1 : 0, userId).run();
}
