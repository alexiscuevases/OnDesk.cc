-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'agent',
  logo_url      TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Refresh tokens table
-- token_hash stores SHA-256 of the raw token (never stored in plain text)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  INTEGER NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  revoked     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens(user_id);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url    TEXT,
  created_by  TEXT NOT NULL REFERENCES users(id),
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Workspace members (user <-> workspace relationship)
-- role: 'owner' | 'admin' | 'agent'
CREATE TABLE IF NOT EXISTS workspace_members (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'agent',
  joined_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id      ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  leader_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  logo_url     TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_teams_workspace_id ON teams(workspace_id);

-- Team members (agent <-> team relationship)
CREATE TABLE IF NOT EXISTS team_members (
  id      TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  domain       TEXT,
  description  TEXT,
  logo_url     TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_companies_workspace_id ON companies(workspace_id);

-- Contacts (customers who submit tickets)
-- A contact belongs to a workspace and optionally to a company
CREATE TABLE IF NOT EXISTS contacts (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id   TEXT REFERENCES companies(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  logo_url     TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, email)
);

CREATE INDEX IF NOT EXISTS idx_contacts_workspace_id ON contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id   ON contacts(company_id);

-- Tickets table
-- status: 'open' | 'pending' | 'resolved' | 'closed'
-- priority: 'low' | 'medium' | 'high' | 'urgent'
-- channel: 'email' | null
-- email_message_id: RFC 2822 Message-ID of the originating email (for In-Reply-To threading)
CREATE TABLE IF NOT EXISTS tickets (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id     TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id       TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  assignee_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
  team_id          TEXT REFERENCES teams(id) ON DELETE SET NULL,
  subject          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'open',
  priority         TEXT NOT NULL DEFAULT 'medium',
  channel          TEXT,
  email_message_id TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tickets_workspace_id ON tickets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tickets_contact_id   ON tickets(contact_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee_id  ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_team_id      ON tickets(team_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status       ON tickets(status);

-- Ticket messages
-- type: 'message' | 'note' (internal note)
-- author_type: 'agent' | 'contact'
CREATE TABLE IF NOT EXISTS ticket_messages (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ticket_id   TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id   TEXT NOT NULL,
  author_type TEXT NOT NULL DEFAULT 'agent',
  type        TEXT NOT NULL DEFAULT 'message',
  content     TEXT NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- Canned replies
CREATE TABLE IF NOT EXISTS canned_replies (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  content      TEXT NOT NULL,
  shortcut     TEXT,
  created_by   TEXT NOT NULL REFERENCES users(id),
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_canned_replies_workspace_id ON canned_replies(workspace_id);

-- Agent signatures
CREATE TABLE IF NOT EXISTS signatures (
  id           TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_by   TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  content      TEXT    NOT NULL,
  is_default   INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_signatures_created_by   ON signatures(created_by);
CREATE INDEX IF NOT EXISTS idx_signatures_workspace_id ON signatures(workspace_id);

-- Workspace invitations
-- status: 'pending' | 'accepted' | 'cancelled'
-- token: secure random value sent in the invitation email link
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'agent',
  invited_by   TEXT NOT NULL REFERENCES users(id),
  token        TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'pending',
  expires_at   INTEGER NOT NULL,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, email)
);

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email        ON workspace_invitations(email);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token        ON workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace_id ON workspace_invitations(workspace_id);

-- Mailbox integrations (Microsoft Outlook via Graph API)
-- Stores OAuth tokens per connected email account per workspace
CREATE TABLE IF NOT EXISTS mailbox_integrations (
  id                      TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id            TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email                   TEXT    NOT NULL,
  ms_user_id              TEXT    NOT NULL,
  access_token            TEXT    NOT NULL,
  refresh_token           TEXT    NOT NULL,
  token_expires_at        INTEGER NOT NULL,
  subscription_id         TEXT,
  subscription_expires_at INTEGER,
  client_state_secret     TEXT    NOT NULL,
  created_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, email)
);

CREATE INDEX IF NOT EXISTS idx_mailbox_integrations_workspace_id   ON mailbox_integrations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mailbox_integrations_subscription_id ON mailbox_integrations(subscription_id);

-- Email deduplication: prevents creating duplicate tickets from the same email
CREATE TABLE IF NOT EXISTS email_tickets (
  id                      TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  mailbox_integration_id  TEXT    NOT NULL REFERENCES mailbox_integrations(id) ON DELETE CASCADE,
  internet_message_id     TEXT    NOT NULL,
  ticket_id               TEXT    NOT NULL REFERENCES tickets(id),
  created_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(mailbox_integration_id, internet_message_id)
);

CREATE INDEX IF NOT EXISTS idx_email_tickets_mailbox_integration_id ON email_tickets(mailbox_integration_id);
