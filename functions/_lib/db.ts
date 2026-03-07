import type {
  UserRow, RefreshTokenRow, WorkspaceRow, PublicWorkspace,
  TeamRow, PublicTeam,
  CompanyRow, PublicCompany,
  ContactRow, PublicContact,
  TicketRow, PublicTicket, TicketStatus, TicketPriority,
  TicketMessageRow, PublicTicketMessage, MessageType, AuthorType,
  CannedReplyRow, PublicCannedReply,
  SignatureRow, PublicSignature,
  WorkspaceInvitationRow, PublicInvitation,
  MailboxIntegrationRow, PublicMailboxIntegration,
  NotificationRow, PublicNotification, NotificationType,
} from "./types";

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

// ─── Users (workspace members) ────────────────────────────────────────────────

export async function findWorkspaceMembers(
  db: D1Database,
  workspaceId: string
): Promise<(UserRow & { workspace_role: string })[]> {
  const result = await db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.logo_url, u.created_at, u.updated_at, wm.role AS workspace_role
       FROM users u
       JOIN workspace_members wm ON wm.user_id = u.id
       WHERE wm.workspace_id = ?
       ORDER BY u.name ASC`
    )
    .bind(workspaceId)
    .all<UserRow & { workspace_role: string }>();
  return result.results ?? [];
}

export async function updateWorkspaceMemberRole(
  db: D1Database,
  workspaceId: string,
  userId: string,
  role: string
): Promise<void> {
  await db
    .prepare("UPDATE workspace_members SET role = ? WHERE workspace_id = ? AND user_id = ?")
    .bind(role, workspaceId, userId)
    .run();
}

export async function removeWorkspaceMember(
  db: D1Database,
  workspaceId: string,
  userId: string
): Promise<void> {
  await db
    .prepare("DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
    .bind(workspaceId, userId)
    .run();
}

export async function addWorkspaceMember(
  db: D1Database,
  workspaceId: string,
  userId: string,
  role: string
): Promise<void> {
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES (?, ?, ?, ?)")
    .bind(id, workspaceId, userId, role)
    .run();
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function findTeamsByWorkspace(
  db: D1Database,
  workspaceId: string
): Promise<PublicTeam[]> {
  const result = await db
    .prepare(
      "SELECT id, workspace_id, name, description, leader_id, logo_url, created_at FROM teams WHERE workspace_id = ? ORDER BY name ASC"
    )
    .bind(workspaceId)
    .all<PublicTeam>();
  return result.results ?? [];
}

export async function findTeamById(
  db: D1Database,
  teamId: string
): Promise<TeamRow | null> {
  const result = await db
    .prepare("SELECT * FROM teams WHERE id = ? LIMIT 1")
    .bind(teamId)
    .first<TeamRow>();
  return result ?? null;
}

export async function createTeam(
  db: D1Database,
  workspaceId: string,
  data: { name: string; description?: string; leader_id?: string; logo_url?: string }
): Promise<TeamRow> {
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO teams (id, workspace_id, name, description, leader_id, logo_url) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, workspaceId, data.name, data.description ?? null, data.leader_id ?? null, data.logo_url ?? null)
    .run();
  return (await findTeamById(db, id))!;
}

export async function updateTeam(
  db: D1Database,
  teamId: string,
  data: { name?: string; description?: string; leader_id?: string | null; logo_url?: string | null }
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
  if (data.leader_id !== undefined) { fields.push("leader_id = ?"); values.push(data.leader_id); }
  if (data.logo_url !== undefined) { fields.push("logo_url = ?"); values.push(data.logo_url); }
  if (fields.length === 0) return;
  fields.push("updated_at = unixepoch()");
  values.push(teamId);
  await db
    .prepare(`UPDATE teams SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteTeam(db: D1Database, teamId: string): Promise<void> {
  await db.prepare("DELETE FROM teams WHERE id = ?").bind(teamId).run();
}

export async function findTeamMembers(
  db: D1Database,
  teamId: string
): Promise<{ id: string; name: string; email: string }[]> {
  const result = await db
    .prepare(
      `SELECT u.id, u.name, u.email FROM users u
       JOIN team_members tm ON tm.user_id = u.id
       WHERE tm.team_id = ? ORDER BY u.name ASC`
    )
    .bind(teamId)
    .all<{ id: string; name: string; email: string }>();
  return result.results ?? [];
}

export async function addTeamMember(
  db: D1Database,
  teamId: string,
  userId: string
): Promise<void> {
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT OR IGNORE INTO team_members (id, team_id, user_id) VALUES (?, ?, ?)")
    .bind(id, teamId, userId)
    .run();
}

export async function removeTeamMember(
  db: D1Database,
  teamId: string,
  userId: string
): Promise<void> {
  await db
    .prepare("DELETE FROM team_members WHERE team_id = ? AND user_id = ?")
    .bind(teamId, userId)
    .run();
}

// ─── Companies ────────────────────────────────────────────────────────────────

export async function findCompaniesByWorkspace(
  db: D1Database,
  workspaceId: string
): Promise<PublicCompany[]> {
  const result = await db
    .prepare(
      "SELECT id, workspace_id, name, domain, description, logo_url, created_at FROM companies WHERE workspace_id = ? ORDER BY name ASC"
    )
    .bind(workspaceId)
    .all<PublicCompany>();
  return result.results ?? [];
}

export async function findCompanyById(
  db: D1Database,
  companyId: string
): Promise<CompanyRow | null> {
  const result = await db
    .prepare("SELECT * FROM companies WHERE id = ? LIMIT 1")
    .bind(companyId)
    .first<CompanyRow>();
  return result ?? null;
}

export async function createCompany(
  db: D1Database,
  workspaceId: string,
  data: { name: string; domain?: string; description?: string; logo_url?: string }
): Promise<CompanyRow> {
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO companies (id, workspace_id, name, domain, description, logo_url) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, workspaceId, data.name, data.domain ?? null, data.description ?? null, data.logo_url ?? null)
    .run();
  return (await findCompanyById(db, id))!;
}

export async function updateCompany(
  db: D1Database,
  companyId: string,
  data: { name?: string; domain?: string; description?: string; logo_url?: string | null }
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.domain !== undefined) { fields.push("domain = ?"); values.push(data.domain); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
  if (data.logo_url !== undefined) { fields.push("logo_url = ?"); values.push(data.logo_url); }
  if (fields.length === 0) return;
  fields.push("updated_at = unixepoch()");
  values.push(companyId);
  await db
    .prepare(`UPDATE companies SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteCompany(db: D1Database, companyId: string): Promise<void> {
  await db.prepare("DELETE FROM companies WHERE id = ?").bind(companyId).run();
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export async function findContactsByWorkspace(
  db: D1Database,
  workspaceId: string
): Promise<PublicContact[]> {
  const result = await db
    .prepare(
      "SELECT id, workspace_id, company_id, name, email, phone, logo_url, created_at FROM contacts WHERE workspace_id = ? ORDER BY name ASC"
    )
    .bind(workspaceId)
    .all<PublicContact>();
  return result.results ?? [];
}

export async function findContactById(
  db: D1Database,
  contactId: string
): Promise<ContactRow | null> {
  const result = await db
    .prepare("SELECT * FROM contacts WHERE id = ? LIMIT 1")
    .bind(contactId)
    .first<ContactRow>();
  return result ?? null;
}

export async function findOrCreateContact(
  db: D1Database,
  workspaceId: string,
  data: { name: string; email: string; phone?: string; company_id?: string }
): Promise<ContactRow> {
  const existing = await db
    .prepare("SELECT * FROM contacts WHERE workspace_id = ? AND email = ? LIMIT 1")
    .bind(workspaceId, data.email.toLowerCase())
    .first<ContactRow>();
  if (existing) return existing;
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO contacts (id, workspace_id, company_id, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, workspaceId, data.company_id ?? null, data.name, data.email.toLowerCase(), data.phone ?? null)
    .run();
  return (await findContactById(db, id))!;
}

export async function updateContact(
  db: D1Database,
  contactId: string,
  data: { name?: string; phone?: string; company_id?: string | null }
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.phone !== undefined) { fields.push("phone = ?"); values.push(data.phone); }
  if (data.company_id !== undefined) { fields.push("company_id = ?"); values.push(data.company_id); }
  if (fields.length === 0) return;
  fields.push("updated_at = unixepoch()");
  values.push(contactId);
  await db
    .prepare(`UPDATE contacts SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteContact(db: D1Database, contactId: string): Promise<void> {
  await db.prepare("DELETE FROM contacts WHERE id = ?").bind(contactId).run();
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export async function findTicketsByWorkspace(
  db: D1Database,
  workspaceId: string,
  filters: { status?: TicketStatus; assignee_id?: string; team_id?: string } = {}
): Promise<PublicTicket[]> {
  const conditions = ["t.workspace_id = ?"];
  const values: (string | null)[] = [workspaceId];
  if (filters.status) { conditions.push("t.status = ?"); values.push(filters.status); }
  if (filters.assignee_id) { conditions.push("t.assignee_id = ?"); values.push(filters.assignee_id); }
  if (filters.team_id) { conditions.push("t.team_id = ?"); values.push(filters.team_id); }
  const result = await db
    .prepare(
      `SELECT id, workspace_id, contact_id, assignee_id, team_id, number, subject, status, priority, created_at, updated_at
       FROM tickets t WHERE ${conditions.join(" AND ")} ORDER BY t.created_at DESC`
    )
    .bind(...values)
    .all<PublicTicket>();
  return result.results ?? [];
}

export async function findTicketById(
  db: D1Database,
  ticketId: string
): Promise<TicketRow | null> {
  const result = await db
    .prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1")
    .bind(ticketId)
    .first<TicketRow>();
  return result ?? null;
}

export async function findTicketByConversationId(
  db: D1Database,
  workspaceId: string,
  conversationId: string
): Promise<TicketRow | null> {
  const result = await db
    .prepare("SELECT * FROM tickets WHERE workspace_id = ? AND conversation_id = ? ORDER BY created_at ASC LIMIT 1")
    .bind(workspaceId, conversationId)
    .first<TicketRow>();
  return result ?? null;
}

export async function createTicket(
  db: D1Database,
  workspaceId: string,
  data: {
    subject: string;
    contact_id?: string;
    assignee_id?: string;
    team_id?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    channel?: string;
    conversation_id?: string;
  }
): Promise<TicketRow> {
  const id = crypto.randomUUID();
  // Compute next sequential number for this workspace
  const row = await db
    .prepare("SELECT COALESCE(MAX(number), 0) + 1 AS next FROM tickets WHERE workspace_id = ?")
    .bind(workspaceId)
    .first<{ next: number }>();
  const number = row?.next ?? 1;
  await db
    .prepare(
      `INSERT INTO tickets (id, workspace_id, contact_id, assignee_id, team_id, number, subject, status, priority, channel, conversation_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id, workspaceId,
      data.contact_id ?? null, data.assignee_id ?? null, data.team_id ?? null,
      number,
      data.subject, data.status ?? "open", data.priority ?? "medium",
      data.channel ?? null, data.conversation_id ?? null
    )
    .run();
  return (await findTicketById(db, id))!;
}

export async function updateTicket(
  db: D1Database,
  ticketId: string,
  data: {
    subject?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignee_id?: string | null;
    team_id?: string | null;
    contact_id?: string | null;
    conversation_id?: string | null;
    channel?: string | null;
  }
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  if (data.subject !== undefined) { fields.push("subject = ?"); values.push(data.subject); }
  if (data.status !== undefined) { fields.push("status = ?"); values.push(data.status); }
  if (data.priority !== undefined) { fields.push("priority = ?"); values.push(data.priority); }
  if (data.assignee_id !== undefined) { fields.push("assignee_id = ?"); values.push(data.assignee_id); }
  if (data.team_id !== undefined) { fields.push("team_id = ?"); values.push(data.team_id); }
  if (data.contact_id !== undefined) { fields.push("contact_id = ?"); values.push(data.contact_id); }
  if (data.conversation_id !== undefined) { fields.push("conversation_id = ?"); values.push(data.conversation_id); }
  if (data.channel !== undefined) { fields.push("channel = ?"); values.push(data.channel); }
  if (fields.length === 0) return;
  fields.push("updated_at = unixepoch()");
  values.push(ticketId);
  await db
    .prepare(`UPDATE tickets SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteTicket(db: D1Database, ticketId: string): Promise<void> {
  await db.prepare("DELETE FROM ticket_messages WHERE ticket_id = ?").bind(ticketId).run();
  await db.prepare("DELETE FROM email_tickets WHERE ticket_id = ?").bind(ticketId).run();
  await db.prepare("DELETE FROM tickets WHERE id = ?").bind(ticketId).run();
}

// ─── Ticket Messages ──────────────────────────────────────────────────────────

export async function findMessagesByTicket(
  db: D1Database,
  ticketId: string
): Promise<PublicTicketMessage[]> {
  const result = await db
    .prepare(
      "SELECT id, ticket_id, author_id, author_type, type, content, graph_message_id, created_at FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC"
    )
    .bind(ticketId)
    .all<PublicTicketMessage>();
  return result.results ?? [];
}

export async function findLastInboundMessageByTicket(
  db: D1Database,
  ticketId: string
): Promise<PublicTicketMessage | null> {
  const result = await db
    .prepare(
      "SELECT id, ticket_id, author_id, author_type, type, content, graph_message_id, created_at FROM ticket_messages WHERE ticket_id = ? AND author_type = 'contact' AND graph_message_id IS NOT NULL ORDER BY created_at DESC LIMIT 1"
    )
    .bind(ticketId)
    .first<PublicTicketMessage>();
  return result ?? null;
}

export async function createTicketMessage(
  db: D1Database,
  data: {
    ticket_id: string;
    author_id: string;
    author_type: AuthorType;
    type: MessageType;
    content: string;
    graph_message_id?: string;
  }
): Promise<PublicTicketMessage> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      "INSERT INTO ticket_messages (id, ticket_id, author_id, author_type, type, content, graph_message_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, data.ticket_id, data.author_id, data.author_type, data.type, data.content, data.graph_message_id ?? null)
    .run();
  // bump ticket updated_at
  await db
    .prepare("UPDATE tickets SET updated_at = unixepoch() WHERE id = ?")
    .bind(data.ticket_id)
    .run();
  const result = await db
    .prepare("SELECT * FROM ticket_messages WHERE id = ? LIMIT 1")
    .bind(id)
    .first<PublicTicketMessage>();
  return result!;
}

export async function deleteTicketMessage(
  db: D1Database,
  messageId: string
): Promise<void> {
  await db.prepare("DELETE FROM ticket_messages WHERE id = ?").bind(messageId).run();
}

// ─── Canned Replies ───────────────────────────────────────────────────────────

export async function findCannedRepliesByWorkspace(
  db: D1Database,
  workspaceId: string
): Promise<PublicCannedReply[]> {
  const result = await db
    .prepare(
      "SELECT id, workspace_id, name, content, shortcut, created_by, created_at FROM canned_replies WHERE workspace_id = ? ORDER BY name ASC"
    )
    .bind(workspaceId)
    .all<PublicCannedReply>();
  return result.results ?? [];
}

export async function findCannedReplyById(
  db: D1Database,
  replyId: string
): Promise<CannedReplyRow | null> {
  const result = await db
    .prepare("SELECT * FROM canned_replies WHERE id = ? LIMIT 1")
    .bind(replyId)
    .first<CannedReplyRow>();
  return result ?? null;
}

export async function createCannedReply(
  db: D1Database,
  workspaceId: string,
  userId: string,
  data: { name: string; content: string; shortcut?: string }
): Promise<CannedReplyRow> {
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO canned_replies (id, workspace_id, name, content, shortcut, created_by) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, workspaceId, data.name, data.content, data.shortcut ?? null, userId)
    .run();
  return (await findCannedReplyById(db, id))!;
}

export async function updateCannedReply(
  db: D1Database,
  replyId: string,
  data: { name?: string; content?: string; shortcut?: string | null }
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.content !== undefined) { fields.push("content = ?"); values.push(data.content); }
  if (data.shortcut !== undefined) { fields.push("shortcut = ?"); values.push(data.shortcut); }
  if (fields.length === 0) return;
  fields.push("updated_at = unixepoch()");
  values.push(replyId);
  await db
    .prepare(`UPDATE canned_replies SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteCannedReply(db: D1Database, replyId: string): Promise<void> {
  await db.prepare("DELETE FROM canned_replies WHERE id = ?").bind(replyId).run();
}

// ─── Signatures ───────────────────────────────────────────────────────────────

export async function findSignaturesByUser(
  db: D1Database,
  userId: string
): Promise<PublicSignature[]> {
  const result = await db
    .prepare(
      "SELECT id, created_by, workspace_id, name, content, is_default, created_at FROM signatures WHERE created_by = ? ORDER BY name ASC"
    )
    .bind(userId)
    .all<SignatureRow>();
  return (result.results ?? []).map(toPublicSignature);
}

export async function findSignatureById(
  db: D1Database,
  signatureId: string
): Promise<SignatureRow | null> {
  const result = await db
    .prepare("SELECT * FROM signatures WHERE id = ? LIMIT 1")
    .bind(signatureId)
    .first<SignatureRow>();
  return result ?? null;
}

export async function createSignature(
  db: D1Database,
  userId: string,
  workspaceId: string,
  data: { name: string; content: string; is_default?: boolean }
): Promise<PublicSignature> {
  const id = crypto.randomUUID();
  const isDefault = data.is_default ? 1 : 0;
  if (isDefault) {
    await db
      .prepare("UPDATE signatures SET is_default = 0 WHERE created_by = ?")
      .bind(userId)
      .run();
  }
  await db
    .prepare("INSERT INTO signatures (id, created_by, workspace_id, name, content, is_default) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, userId, workspaceId, data.name, data.content, isDefault)
    .run();
  return toPublicSignature((await findSignatureById(db, id))!);
}

export async function updateSignature(
  db: D1Database,
  signatureId: string,
  userId: string,
  data: { name?: string; content?: string; is_default?: boolean }
): Promise<void> {
  if (data.is_default) {
    await db
      .prepare("UPDATE signatures SET is_default = 0 WHERE created_by = ?")
      .bind(userId)
      .run();
  }
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.content !== undefined) { fields.push("content = ?"); values.push(data.content); }
  if (data.is_default !== undefined) { fields.push("is_default = ?"); values.push(data.is_default ? 1 : 0); }
  if (fields.length === 0) return;
  fields.push("updated_at = unixepoch()");
  values.push(signatureId);
  await db
    .prepare(`UPDATE signatures SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteSignature(db: D1Database, signatureId: string): Promise<void> {
  await db.prepare("DELETE FROM signatures WHERE id = ?").bind(signatureId).run();
}

function toPublicSignature(row: SignatureRow): PublicSignature {
  return {
    id: row.id,
    created_by: row.created_by,
    workspace_id: row.workspace_id,
    name: row.name,
    content: row.content,
    is_default: row.is_default === 1,
    created_at: row.created_at,
  };
}

// ─── Workspace Invitations ────────────────────────────────────────────────────

export async function createInvitation(
  db: D1Database,
  workspaceId: string,
  email: string,
  role: string,
  invitedBy: string,
  token: string,
  ttlSeconds: number
): Promise<WorkspaceInvitationRow> {
  const id = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  await db
    .prepare(
      `INSERT INTO workspace_invitations (id, workspace_id, email, role, invited_by, token, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, workspaceId, email.toLowerCase(), role, invitedBy, token, expiresAt)
    .run();
  return (await findInvitationById(db, id))!;
}

async function findInvitationById(
  db: D1Database,
  id: string
): Promise<WorkspaceInvitationRow | null> {
  const result = await db
    .prepare("SELECT * FROM workspace_invitations WHERE id = ? LIMIT 1")
    .bind(id)
    .first<WorkspaceInvitationRow>();
  return result ?? null;
}

export async function findInvitationByToken(
  db: D1Database,
  token: string
): Promise<WorkspaceInvitationRow | null> {
  const result = await db
    .prepare("SELECT * FROM workspace_invitations WHERE token = ? LIMIT 1")
    .bind(token)
    .first<WorkspaceInvitationRow>();
  return result ?? null;
}

export async function findPendingInvitationsByWorkspace(
  db: D1Database,
  workspaceId: string
): Promise<PublicInvitation[]> {
  const result = await db
    .prepare(
      `SELECT id, workspace_id, email, role, status, expires_at, created_at
       FROM workspace_invitations
       WHERE workspace_id = ? AND status = 'pending'
       ORDER BY created_at DESC`
    )
    .bind(workspaceId)
    .all<PublicInvitation>();
  return result.results ?? [];
}

export async function findPendingInvitationByEmail(
  db: D1Database,
  email: string
): Promise<WorkspaceInvitationRow | null> {
  const result = await db
    .prepare(
      "SELECT * FROM workspace_invitations WHERE email = ? AND status = 'pending' LIMIT 1"
    )
    .bind(email.toLowerCase())
    .first<WorkspaceInvitationRow>();
  return result ?? null;
}

export async function updateInvitationStatus(
  db: D1Database,
  id: string,
  status: string
): Promise<void> {
  await db
    .prepare("UPDATE workspace_invitations SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();
}

export async function findPendingInvitationByWorkspaceAndEmail(
  db: D1Database,
  workspaceId: string,
  email: string
): Promise<WorkspaceInvitationRow | null> {
  const result = await db
    .prepare(
      "SELECT * FROM workspace_invitations WHERE workspace_id = ? AND email = ? AND status = 'pending' LIMIT 1"
    )
    .bind(workspaceId, email.toLowerCase())
    .first<WorkspaceInvitationRow>();
  return result ?? null;
}

// ─── Mailbox Integrations ─────────────────────────────────────────────────────

export async function createMailboxIntegration(
  db: D1Database,
  data: {
    workspace_id: string;
    email: string;
    ms_user_id: string;
    access_token: string;
    refresh_token: string;
    token_expires_at: number;
    client_state_secret: string;
  }
): Promise<MailboxIntegrationRow> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO mailbox_integrations
         (id, workspace_id, email, ms_user_id, access_token, refresh_token, token_expires_at, client_state_secret)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id, data.workspace_id, data.email.toLowerCase(), data.ms_user_id,
      data.access_token, data.refresh_token, data.token_expires_at,
      data.client_state_secret
    )
    .run();
  return (await findMailboxIntegrationById(db, id))!;
}

export async function findMailboxIntegrationById(
  db: D1Database,
  id: string
): Promise<MailboxIntegrationRow | null> {
  const result = await db
    .prepare("SELECT * FROM mailbox_integrations WHERE id = ? LIMIT 1")
    .bind(id)
    .first<MailboxIntegrationRow>();
  return result ?? null;
}

export async function findMailboxIntegrationByEmail(
  db: D1Database,
  workspaceId: string,
  email: string
): Promise<MailboxIntegrationRow | null> {
  const result = await db
    .prepare(
      "SELECT * FROM mailbox_integrations WHERE workspace_id = ? AND email = ? LIMIT 1"
    )
    .bind(workspaceId, email.toLowerCase())
    .first<MailboxIntegrationRow>();
  return result ?? null;
}

export async function findMailboxIntegrationBySubscriptionId(
  db: D1Database,
  subscriptionId: string
): Promise<MailboxIntegrationRow | null> {
  const result = await db
    .prepare(
      "SELECT * FROM mailbox_integrations WHERE subscription_id = ? LIMIT 1"
    )
    .bind(subscriptionId)
    .first<MailboxIntegrationRow>();
  return result ?? null;
}

export async function findMailboxIntegrationsByWorkspace(
  db: D1Database,
  workspaceId: string
): Promise<PublicMailboxIntegration[]> {
  const result = await db
    .prepare(
      `SELECT id, workspace_id, email, ms_user_id, subscription_id, subscription_expires_at, created_at
       FROM mailbox_integrations WHERE workspace_id = ? ORDER BY created_at ASC`
    )
    .bind(workspaceId)
    .all<PublicMailboxIntegration>();
  return result.results ?? [];
}

export async function findFirstMailboxByWorkspace(
  db: D1Database,
  workspaceId: string
): Promise<MailboxIntegrationRow | null> {
  const result = await db
    .prepare(
      "SELECT * FROM mailbox_integrations WHERE workspace_id = ? ORDER BY created_at ASC LIMIT 1"
    )
    .bind(workspaceId)
    .first<MailboxIntegrationRow>();
  return result ?? null;
}

export async function updateMailboxTokens(
  db: D1Database,
  id: string,
  data: { access_token: string; refresh_token: string; token_expires_at: number }
): Promise<void> {
  await db
    .prepare(
      "UPDATE mailbox_integrations SET access_token = ?, refresh_token = ?, token_expires_at = ? WHERE id = ?"
    )
    .bind(data.access_token, data.refresh_token, data.token_expires_at, id)
    .run();
}

export async function updateMailboxSubscription(
  db: D1Database,
  id: string,
  data: { subscription_id: string; subscription_expires_at: number }
): Promise<void> {
  await db
    .prepare(
      "UPDATE mailbox_integrations SET subscription_id = ?, subscription_expires_at = ? WHERE id = ?"
    )
    .bind(data.subscription_id, data.subscription_expires_at, id)
    .run();
}

export async function deleteMailboxIntegration(
  db: D1Database,
  id: string
): Promise<void> {
  await db
    .prepare("DELETE FROM mailbox_integrations WHERE id = ?")
    .bind(id)
    .run();
}

export async function markEmailAsTicket(
  db: D1Database,
  data: {
    mailbox_integration_id: string;
    internet_message_id: string;
    ticket_id: string;
  }
): Promise<void> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT OR IGNORE INTO email_tickets (id, mailbox_integration_id, internet_message_id, ticket_id)
       VALUES (?, ?, ?, ?)`
    )
    .bind(id, data.mailbox_integration_id, data.internet_message_id, data.ticket_id)
    .run();
}

export async function findEmailTicketByMessageId(
  db: D1Database,
  mailboxIntegrationId: string,
  internetMessageId: string
): Promise<{ ticket_id: string } | null> {
  const result = await db
    .prepare(
      "SELECT ticket_id FROM email_tickets WHERE mailbox_integration_id = ? AND internet_message_id = ? LIMIT 1"
    )
    .bind(mailboxIntegrationId, internetMessageId)
    .first<{ ticket_id: string }>();
  return result ?? null;
}

export async function findWorkspaceMemberIds(
  db: D1Database,
  workspaceId: string
): Promise<string[]> {
  const result = await db
    .prepare("SELECT user_id FROM workspace_members WHERE workspace_id = ?")
    .bind(workspaceId)
    .all<{ user_id: string }>();
  return (result.results ?? []).map((r) => r.user_id);
}

// ─── Notifications ────────────────────────────────────────────────────────────

function rowToPublicNotification(row: NotificationRow): PublicNotification {
  return {
    id: row.id,
    user_id: row.user_id,
    workspace_id: row.workspace_id,
    type: row.type,
    title: row.title,
    description: row.description,
    resource_id: row.resource_id,
    actor_id: row.actor_id,
    read: row.read === 1,
    created_at: row.created_at,
  };
}

export async function createNotification(
  db: D1Database,
  data: {
    user_id: string;
    workspace_id: string;
    type: NotificationType;
    title: string;
    description: string;
    resource_id?: string;
    actor_id?: string;
  }
): Promise<PublicNotification> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO notifications (id, user_id, workspace_id, type, title, description, resource_id, actor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      data.user_id,
      data.workspace_id,
      data.type,
      data.title,
      data.description,
      data.resource_id ?? null,
      data.actor_id ?? null
    )
    .run();
  const row = await db
    .prepare("SELECT * FROM notifications WHERE id = ? LIMIT 1")
    .bind(id)
    .first<NotificationRow>();
  return rowToPublicNotification(row!);
}

export async function findNotificationsByUser(
  db: D1Database,
  userId: string,
  workspaceId: string,
  limit = 50
): Promise<PublicNotification[]> {
  const result = await db
    .prepare(
      `SELECT * FROM notifications
       WHERE user_id = ? AND workspace_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(userId, workspaceId, limit)
    .all<NotificationRow>();
  return (result.results ?? []).map(rowToPublicNotification);
}

export async function markNotificationRead(
  db: D1Database,
  id: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .prepare("UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

export async function markAllNotificationsRead(
  db: D1Database,
  userId: string,
  workspaceId: string
): Promise<void> {
  await db
    .prepare(
      "UPDATE notifications SET read = 1 WHERE user_id = ? AND workspace_id = ? AND read = 0"
    )
    .bind(userId, workspaceId)
    .run();
}

export async function deleteNotification(
  db: D1Database,
  id: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}
