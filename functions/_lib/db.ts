import type { UserRow, RefreshTokenRow, WorkspaceRow, PublicWorkspace } from "./types";

export async function findUserByEmail(
  db: D1Database,
  email: string
): Promise<UserRow | null> {
  const result = await db
    .prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
    .bind(email.toLowerCase())
    .first<UserRow>();
  return result ?? null;
}

export async function findUserById(
  db: D1Database,
  id: string
): Promise<UserRow | null> {
  const result = await db
    .prepare("SELECT * FROM users WHERE id = ? LIMIT 1")
    .bind(id)
    .first<UserRow>();
  return result ?? null;
}

export async function createUser(
  db: D1Database,
  name: string,
  email: string,
  passwordHash: string
): Promise<UserRow> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)"
    )
    .bind(id, name, email.toLowerCase(), passwordHash)
    .run();
  return (await findUserById(db, id))!;
}

export async function createRefreshToken(
  db: D1Database,
  userId: string,
  tokenHash: string,
  ttlSeconds: number
): Promise<void> {
  const id = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  await db
    .prepare(
      "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
    )
    .bind(id, userId, tokenHash, expiresAt)
    .run();
}

export async function findRefreshToken(
  db: D1Database,
  tokenHash: string
): Promise<RefreshTokenRow | null> {
  const result = await db
    .prepare(
      "SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0 LIMIT 1"
    )
    .bind(tokenHash)
    .first<RefreshTokenRow>();
  return result ?? null;
}

export async function revokeRefreshToken(
  db: D1Database,
  tokenHash: string
): Promise<void> {
  await db
    .prepare("UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?")
    .bind(tokenHash)
    .run();
}

export async function revokeAllUserRefreshTokens(
  db: D1Database,
  userId: string
): Promise<void> {
  await db
    .prepare("UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?")
    .bind(userId)
    .run();
}

// ─── Workspace queries ────────────────────────────────────────────────────────

export async function findWorkspacesByUserId(
  db: D1Database,
  userId: string
): Promise<PublicWorkspace[]> {
  const result = await db
    .prepare(
      `SELECT w.id, w.name, w.slug, w.description, w.logo_url, w.created_at, wm.role
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id
       WHERE wm.user_id = ?
       ORDER BY w.created_at ASC`
    )
    .bind(userId)
    .all<PublicWorkspace>();
  return result.results ?? [];
}

export async function findWorkspaceBySlug(
  db: D1Database,
  slug: string
): Promise<WorkspaceRow | null> {
  const result = await db
    .prepare("SELECT * FROM workspaces WHERE slug = ? LIMIT 1")
    .bind(slug)
    .first<WorkspaceRow>();
  return result ?? null;
}

export async function slugExists(
  db: D1Database,
  slug: string
): Promise<boolean> {
  const result = await db
    .prepare("SELECT id FROM workspaces WHERE slug = ? LIMIT 1")
    .bind(slug)
    .first<{ id: string }>();
  return result !== null;
}

export async function isWorkspaceMember(
  db: D1Database,
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .prepare(
      "SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1"
    )
    .bind(workspaceId, userId)
    .first<{ id: string }>();
  return result !== null;
}

export async function createWorkspace(
  db: D1Database,
  data: { name: string; slug: string; description?: string; logo_url?: string },
  userId: string
): Promise<WorkspaceRow> {
  const id = crypto.randomUUID();
  const memberId = crypto.randomUUID();
  await db
    .prepare(
      "INSERT INTO workspaces (id, name, slug, description, logo_url, created_by) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, data.name, data.slug, data.description ?? null, data.logo_url ?? null, userId)
    .run();
  // Add creator as owner
  await db
    .prepare(
      "INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES (?, ?, ?, 'owner')"
    )
    .bind(memberId, id, userId)
    .run();
  return (await findWorkspaceBySlug(db, data.slug))!;
}

export async function updateWorkspace(
  db: D1Database,
  workspaceId: string,
  data: { name?: string; description?: string; logo_url?: string }
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
  if (data.logo_url !== undefined) { fields.push("logo_url = ?"); values.push(data.logo_url); }
  if (fields.length === 0) return;
  fields.push("updated_at = unixepoch()");
  values.push(workspaceId);
  await db
    .prepare(`UPDATE workspaces SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteWorkspace(
  db: D1Database,
  workspaceId: string
): Promise<void> {
  await db
    .prepare("DELETE FROM workspaces WHERE id = ?")
    .bind(workspaceId)
    .run();
}

export async function getWorkspaceMemberRole(
  db: D1Database,
  workspaceId: string,
  userId: string
): Promise<string | null> {
  const result = await db
    .prepare(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1"
    )
    .bind(workspaceId, userId)
    .first<{ role: string }>();
  return result?.role ?? null;
}
