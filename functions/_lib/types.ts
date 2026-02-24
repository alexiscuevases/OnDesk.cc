// Cloudflare Pages Functions environment bindings
export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

// Database row shapes
export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: number;
  updated_at: number;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: number;
  created_at: number;
  revoked: number;
}

// JWT payload shape
export interface JwtPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

// Public user shape returned to frontend
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Database row shapes for workspaces
export interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface WorkspaceMemberRow {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  joined_at: number;
}

// Public workspace shape returned to frontend
export interface PublicWorkspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  role: string; // caller's role in this workspace
  created_at: number;
}
