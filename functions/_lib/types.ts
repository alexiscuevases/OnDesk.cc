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

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface TeamRow {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}

export interface PublicTeam {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_at: number;
}

// ─── Companies ────────────────────────────────────────────────────────────────

export interface CompanyRow {
  id: string;
  workspace_id: string;
  name: string;
  domain: string | null;
  description: string | null;
  created_at: number;
  updated_at: number;
}

export interface PublicCompany {
  id: string;
  workspace_id: string;
  name: string;
  domain: string | null;
  description: string | null;
  created_at: number;
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export interface ContactRow {
  id: string;
  workspace_id: string;
  company_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  created_at: number;
  updated_at: number;
}

export interface PublicContact {
  id: string;
  workspace_id: string;
  company_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  created_at: number;
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketRow {
  id: string;
  workspace_id: string;
  contact_id: string | null;
  assignee_id: string | null;
  team_id: string | null;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: number;
  updated_at: number;
}

export interface PublicTicket {
  id: string;
  workspace_id: string;
  contact_id: string | null;
  assignee_id: string | null;
  team_id: string | null;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: number;
  updated_at: number;
}

// ─── Ticket Messages ──────────────────────────────────────────────────────────

export type MessageType = "message" | "note";
export type AuthorType = "agent" | "contact";

export interface TicketMessageRow {
  id: string;
  ticket_id: string;
  author_id: string;
  author_type: AuthorType;
  type: MessageType;
  content: string;
  created_at: number;
}

export interface PublicTicketMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  author_type: AuthorType;
  type: MessageType;
  content: string;
  created_at: number;
}

// ─── Canned Replies ───────────────────────────────────────────────────────────

export interface CannedReplyRow {
  id: string;
  workspace_id: string;
  name: string;
  content: string;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface PublicCannedReply {
  id: string;
  workspace_id: string;
  name: string;
  content: string;
  created_by: string;
  created_at: number;
}

// ─── Signatures ───────────────────────────────────────────────────────────────

export interface SignatureRow {
  id: string;
  user_id: string;
  name: string;
  content: string;
  is_default: number; // SQLite boolean: 0 | 1
  created_at: number;
  updated_at: number;
}

export interface PublicSignature {
  id: string;
  user_id: string;
  name: string;
  content: string;
  is_default: boolean;
  created_at: number;
}

// ─── Workspace Invitations ────────────────────────────────────────────────────

export interface WorkspaceInvitationRow {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  invited_by: string;
  token: string;
  status: string;
  expires_at: number;
  created_at: number;
}

export interface PublicInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  status: string;
  expires_at: number;
  created_at: number;
}
