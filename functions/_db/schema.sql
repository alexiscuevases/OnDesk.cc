-- Users table
-- password_hash is nullable to support OAuth-only accounts (Google / Microsoft)
CREATE TABLE IF NOT EXISTS users (
  id                  TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name                TEXT    NOT NULL,
  email               TEXT    NOT NULL UNIQUE,
  password_hash       TEXT,
  role                TEXT    NOT NULL DEFAULT 'agent',
  logo_url            TEXT,
  login_attempts      INTEGER NOT NULL DEFAULT 0,
  locked_until        INTEGER,
  two_factor_enabled  INTEGER NOT NULL DEFAULT 0,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

-- OAuth identities linked to a user (a user can have multiple providers)
-- provider: 'google' | 'microsoft'
CREATE TABLE IF NOT EXISTS user_identities (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL,
  provider_user_id  TEXT NOT NULL,
  email             TEXT NOT NULL,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_identities_user_id ON user_identities(user_id);

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

-- Password reset tokens (1-hour TTL, single-use)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT    NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id    ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);

-- 2FA email codes (10-minute TTL, single-use)
CREATE TABLE IF NOT EXISTS two_factor_codes (
  id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash  TEXT    NOT NULL,
  expires_at INTEGER NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user_id ON two_factor_codes(user_id);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url    TEXT,
  workspace_prompt TEXT,
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
-- thread_id: provider-side conversation/thread id (Graph conversationId or Gmail threadId)
--            used to thread replies into the same ticket
CREATE TABLE IF NOT EXISTS tickets (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id     TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id       TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  assignee_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
  team_id          TEXT REFERENCES teams(id) ON DELETE SET NULL,
  number           INTEGER NOT NULL DEFAULT 0,
  subject          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'open',
  priority         TEXT NOT NULL DEFAULT 'medium',
  channel          TEXT,
  thread_id        TEXT,
  cc_addresses     TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tickets_workspace_id ON tickets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tickets_contact_id   ON tickets(contact_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee_id  ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_team_id      ON tickets(team_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status       ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_thread_id    ON tickets(thread_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_workspace_number ON tickets(workspace_id, number);

-- Ticket messages
-- type: 'message' | 'note' (internal note)
-- author_type: 'agent' | 'contact'
-- provider_message_id: provider-side message id used for reply threading
--                      (Graph internetMessageId or Gmail message id)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ticket_id           TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id           TEXT NOT NULL,
  author_type         TEXT NOT NULL DEFAULT 'agent',
  type                TEXT NOT NULL DEFAULT 'message',
  content             TEXT NOT NULL,
  provider_message_id TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch())
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

-- Mailbox integrations (Microsoft Outlook via Graph API + Gmail via Google API)
-- Stores OAuth tokens per connected email account per workspace
-- provider:           'microsoft' | 'google'
-- provider_user_id:   provider-side user id (Microsoft user id or Google user id)
-- webhook_secret:     per-mailbox secret used to validate inbound webhook notifications
--                     (Graph clientState; Gmail keeps a UUID for parity but doesn't verify it)
-- watch_id:           provider-side push-subscription id (Graph subscription id or Gmail historyId from watch())
-- watch_expires_at:   expiry of the push subscription / watch — renewed before it lapses
-- last_history_id:    Gmail only — last processed historyId for incremental sync
CREATE TABLE IF NOT EXISTS mailbox_integrations (
  id                  TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id        TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email               TEXT    NOT NULL,
  provider            TEXT    NOT NULL DEFAULT 'microsoft',
  provider_user_id    TEXT    NOT NULL DEFAULT '',
  access_token        TEXT    NOT NULL,
  refresh_token       TEXT    NOT NULL,
  token_expires_at    INTEGER NOT NULL,
  webhook_secret      TEXT    NOT NULL DEFAULT '',
  watch_id            TEXT,
  watch_expires_at    INTEGER,
  last_history_id     TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, email)
);

CREATE INDEX IF NOT EXISTS idx_mailbox_integrations_workspace_id ON mailbox_integrations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mailbox_integrations_watch_id     ON mailbox_integrations(watch_id);

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

-- Notifications
-- type: 'ticket' | 'assign' | 'sla' | 'resolved' | 'message'
-- actor_id: user who triggered the notification (null for system events)
-- resource_id: e.g. ticket id the notification relates to
CREATE TABLE IF NOT EXISTS notifications (
  id           TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id      TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type         TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  description  TEXT    NOT NULL,
  resource_id  TEXT,
  actor_id     TEXT    REFERENCES users(id) ON DELETE SET NULL,
  read         INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id      ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_workspace_id ON notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read         ON notifications(user_id, read);

-- ─── AI Agents ────────────────────────────────────────────────────────────────

-- AI Agents: workspace-owned bot entities that handle tickets automatically
-- status: 'active' | 'inactive'
CREATE TABLE IF NOT EXISTS ai_agents (
  id                   TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id         TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name                 TEXT    NOT NULL,
  description          TEXT,
  status               TEXT    NOT NULL DEFAULT 'active',
  system_prompt        TEXT,
  confidence_threshold REAL    NOT NULL DEFAULT 0.5,
  max_auto_replies     INTEGER NOT NULL DEFAULT 0,
  created_by           TEXT    NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_agents_workspace_id ON ai_agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status       ON ai_agents(workspace_id, status);

-- Assigns an AI agent to one or more mailboxes (many-to-many)
CREATE TABLE IF NOT EXISTS ai_agent_mailboxes (
  id                     TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ai_agent_id            TEXT    NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  mailbox_integration_id TEXT    NOT NULL REFERENCES mailbox_integrations(id) ON DELETE CASCADE,
  enabled                INTEGER NOT NULL DEFAULT 1,
  created_at             INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(ai_agent_id, mailbox_integration_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_mailboxes_agent_id   ON ai_agent_mailboxes(ai_agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_mailboxes_mailbox_id ON ai_agent_mailboxes(mailbox_integration_id);

-- Tracks AI handling state per ticket
-- escalated: 1 = human intervention required; AI stops responding
CREATE TABLE IF NOT EXISTS ai_ticket_state (
  id              TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ticket_id       TEXT    NOT NULL REFERENCES tickets(id) ON DELETE CASCADE UNIQUE,
  ai_agent_id     TEXT    NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  reply_count     INTEGER NOT NULL DEFAULT 0,
  escalated       INTEGER NOT NULL DEFAULT 0,
  escalated_at    INTEGER,
  escalation_note TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_ticket_state_ticket_id   ON ai_ticket_state(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ai_ticket_state_agent_id    ON ai_ticket_state(ai_agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_ticket_state_escalated   ON ai_ticket_state(escalated);

-- Audit log for all AI agent actions on tickets
-- action: 'auto_reply' | 'escalate' | 'status_change' | 'note_added' | 'routed'
CREATE TABLE IF NOT EXISTS ai_action_logs (
  id          TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ticket_id   TEXT    NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  ai_agent_id TEXT    NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  action      TEXT    NOT NULL,
  metadata    TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_action_logs_ticket_id   ON ai_action_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ai_action_logs_agent_id    ON ai_action_logs(ai_agent_id);
-- ─── Marketplace & Tools ──────────────────────────────────────────────────

-- Products: available integrations/tools in the marketplace
CREATE TABLE IF NOT EXISTS products (
  id              TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT    NOT NULL,
  description     TEXT,
  logo_url        TEXT,
  auth_type       TEXT    NOT NULL, -- 'none' | 'api_key'
  actions         TEXT    NOT NULL, -- JSON array of actions: [{ name, description, endpoint, method, parameters }]
  is_public       INTEGER NOT NULL DEFAULT 1,
  created_by      TEXT    NOT NULL REFERENCES users(id),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Workspace Products: installed products per workspace
CREATE TABLE IF NOT EXISTS workspace_products (
  id              TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id      TEXT    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  configuration   TEXT,    -- JSON object with API keys, tokens, etc.
  status          TEXT    NOT NULL DEFAULT 'enabled', -- 'enabled' | 'disabled'
  installed_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_products_workspace_id ON workspace_products(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_products_product_id   ON workspace_products(product_id);

-- Agent Tools: assigned tools (from workspace products) to specific agents
CREATE TABLE IF NOT EXISTS agent_tools (
  id                    TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ai_agent_id           TEXT    NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  workspace_product_id  TEXT    NOT NULL REFERENCES workspace_products(id) ON DELETE CASCADE,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(ai_agent_id, workspace_product_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_tools_agent_id ON agent_tools(ai_agent_id);

-- ─── Billing & Subscriptions ───────────────────────────────────────────────────

-- Subscriptions: one per workspace, synced from Stripe via webhooks
-- plan: 'starter' | 'core' | 'enterprise'
-- cycle: 'monthly' | 'annual'
-- status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
CREATE TABLE IF NOT EXISTS subscriptions (
  id                       TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id             TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id       TEXT    NOT NULL UNIQUE,
  stripe_subscription_id   TEXT    UNIQUE,
  plan                     TEXT    NOT NULL DEFAULT 'core',
  cycle                    TEXT    NOT NULL DEFAULT 'monthly',
  status                   TEXT    NOT NULL DEFAULT 'incomplete',
  agent_count              INTEGER NOT NULL DEFAULT 1,
  trial_ends_at            INTEGER,
  current_period_start     INTEGER,
  current_period_end       INTEGER,
  created_at               INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at               INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace_id           ON subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id     ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- ─── Workspace Security ───────────────────────────────────────────────────────

-- One row per workspace with security toggles
-- require_2fa:           enforce 2FA for every member on next login
-- strong_password:       enforce strong-password policy on registration/reset
-- ip_allowlist_enabled:  if 1, reject sign-ins from IPs not present in workspace_ip_allowlist
-- audit_log_enabled:     record sensitive actions into audit_logs
CREATE TABLE IF NOT EXISTS workspace_security_settings (
  workspace_id         TEXT    PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  require_2fa          INTEGER NOT NULL DEFAULT 0,
  strong_password      INTEGER NOT NULL DEFAULT 0,
  ip_allowlist_enabled INTEGER NOT NULL DEFAULT 0,
  audit_log_enabled    INTEGER NOT NULL DEFAULT 1,
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Allowed CIDR ranges (or single IPs as /32) for a workspace
CREATE TABLE IF NOT EXISTS workspace_ip_allowlist (
  id           TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  cidr         TEXT    NOT NULL,
  label        TEXT,
  created_by   TEXT    NOT NULL REFERENCES users(id),
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, cidr)
);

CREATE INDEX IF NOT EXISTS idx_workspace_ip_allowlist_workspace_id ON workspace_ip_allowlist(workspace_id);

-- Audit log of sensitive actions
-- action examples: 'security.settings_updated' | 'security.ip_added' | 'security.ip_removed'
--                  'auth.login' | 'auth.login_blocked_ip' | 'auth.2fa_enabled'
--                  'workspace.member_role_changed' | 'workspace.member_removed'
CREATE TABLE IF NOT EXISTS audit_logs (
  id           TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  actor_id     TEXT    REFERENCES users(id) ON DELETE SET NULL,
  actor_email  TEXT,
  action       TEXT    NOT NULL,
  target       TEXT,
  ip           TEXT,
  metadata     TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_id ON audit_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id     ON audit_logs(actor_id);

-- ── AI Memories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_memories (
  id                 TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id       TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id         TEXT    REFERENCES contacts(id) ON DELETE CASCADE,
  content            TEXT    NOT NULL,
  last_referenced_at INTEGER,
  expires_at         INTEGER,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_memories_workspace_id ON ai_memories(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_memories_contact_id   ON ai_memories(workspace_id, contact_id);

-- ─── Automations ──────────────────────────────────────────────────────────────
-- Event-driven and time-based rules that run actions on tickets.
-- trigger_type:
--   'ticket.created' | 'ticket.updated' | 'ticket.status_changed'
--   'ticket.priority_changed' | 'ticket.assigned'
--   'message.received' | 'message.sent'
--   'scheduled.time_since_created' | 'scheduled.time_since_updated' (cron-evaluated)
-- conditions: JSON {match:'all'|'any', rules:[{field,op,value}]}
--   ops: 'eq','neq','contains','not_contains','gt','lt','in','is_empty','is_not_empty'
-- actions: JSON [{type, params}]
--   types: 'set_status','set_priority','assign_user','assign_team',
--          'send_canned_reply','add_internal_note','escalate_to_human','stop_processing'
-- schedule_minutes: for time-based triggers, evaluated by cron every N minutes
CREATE TABLE IF NOT EXISTS automations (
  id               TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id     TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name             TEXT    NOT NULL,
  description      TEXT,
  trigger_type     TEXT    NOT NULL,
  conditions       TEXT    NOT NULL DEFAULT '{"match":"all","rules":[]}',
  actions          TEXT    NOT NULL DEFAULT '[]',
  enabled          INTEGER NOT NULL DEFAULT 1,
  schedule_minutes INTEGER,
  run_order        INTEGER NOT NULL DEFAULT 0,
  run_count        INTEGER NOT NULL DEFAULT 0,
  last_run_at      INTEGER,
  created_by       TEXT    NOT NULL REFERENCES users(id),
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_automations_workspace_id ON automations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_automations_trigger      ON automations(workspace_id, trigger_type, enabled);

-- Per-ticket execution log so scheduled rules don't double-fire and for audit
CREATE TABLE IF NOT EXISTS automation_runs (
  id            TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  automation_id TEXT    NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  ticket_id     TEXT    NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  status        TEXT    NOT NULL DEFAULT 'success', -- 'success' | 'error' | 'skipped'
  error         TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_automation_runs_automation_id ON automation_runs(automation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_runs_ticket_id     ON automation_runs(ticket_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_automation_runs_unique_scheduled
  ON automation_runs(automation_id, ticket_id)
  WHERE status = 'success';

-- ─── SLA Policies ─────────────────────────────────────────────────────────────
-- Workspace-level SLA policies. Each policy defines response and resolution
-- targets (in minutes) per priority. Optional team/contact-company scoping.
-- business_hours_only: if 1, the clock only ticks during business hours (future)
CREATE TABLE IF NOT EXISTS sla_policies (
  id                  TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id        TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name                TEXT    NOT NULL,
  description         TEXT,
  enabled             INTEGER NOT NULL DEFAULT 1,
  -- Scoping (all nullable = applies to everything)
  applies_to_team_id     TEXT REFERENCES teams(id) ON DELETE SET NULL,
  applies_to_company_id  TEXT REFERENCES companies(id) ON DELETE SET NULL,
  applies_to_priority    TEXT, -- 'low'|'medium'|'high'|'urgent'|NULL=all
  -- Targets in minutes, per priority
  response_low        INTEGER,
  response_medium     INTEGER,
  response_high       INTEGER,
  response_urgent     INTEGER,
  resolution_low      INTEGER,
  resolution_medium   INTEGER,
  resolution_high     INTEGER,
  resolution_urgent   INTEGER,
  business_hours_only INTEGER NOT NULL DEFAULT 0,
  priority            INTEGER NOT NULL DEFAULT 0, -- higher = wins when multiple match
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_sla_policies_workspace_id ON sla_policies(workspace_id, enabled);

-- Per-ticket SLA tracking. One row per ticket once a policy is applied.
-- status:
--   'on_track' | 'response_breached' | 'resolution_breached' | 'met' | 'paused'
CREATE TABLE IF NOT EXISTS sla_ticket_tracking (
  id                    TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id          TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  ticket_id             TEXT    NOT NULL REFERENCES tickets(id) ON DELETE CASCADE UNIQUE,
  sla_policy_id         TEXT    NOT NULL REFERENCES sla_policies(id) ON DELETE CASCADE,
  response_due_at       INTEGER,
  resolution_due_at     INTEGER,
  first_response_at     INTEGER,
  resolved_at           INTEGER,
  response_breached_at  INTEGER,
  resolution_breached_at INTEGER,
  status                TEXT    NOT NULL DEFAULT 'on_track',
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_sla_ticket_tracking_workspace_id ON sla_ticket_tracking(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sla_ticket_tracking_ticket_id    ON sla_ticket_tracking(ticket_id);
CREATE INDEX IF NOT EXISTS idx_sla_ticket_tracking_due
  ON sla_ticket_tracking(workspace_id, response_due_at, resolution_due_at)
  WHERE status = 'on_track';

-- ─── Knowledge Base ───────────────────────────────────────────────────────────
-- Categories group articles. Articles are vector-indexed for AI agent retrieval.
CREATE TABLE IF NOT EXISTS kb_categories (
  id           TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  description  TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_kb_categories_workspace_id ON kb_categories(workspace_id);

-- visibility: 'internal' = AI/agents only | 'public' = exposable in help center later
-- status: 'draft' | 'published'
-- vector_id: id used in Vectorize index (kept in sync on publish/delete)
CREATE TABLE IF NOT EXISTS kb_articles (
  id            TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id  TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id   TEXT    REFERENCES kb_categories(id) ON DELETE SET NULL,
  title         TEXT    NOT NULL,
  slug          TEXT    NOT NULL,
  content       TEXT    NOT NULL,
  excerpt       TEXT,
  tags          TEXT    NOT NULL DEFAULT '[]', -- JSON array of strings
  visibility    TEXT    NOT NULL DEFAULT 'internal',
  status        TEXT    NOT NULL DEFAULT 'draft',
  vector_id     TEXT,
  view_count    INTEGER NOT NULL DEFAULT 0,
  created_by    TEXT    NOT NULL REFERENCES users(id),
  published_at  INTEGER,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_kb_articles_workspace_id ON kb_articles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_category_id  ON kb_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status       ON kb_articles(workspace_id, status);

-- Bind articles to specific AI agents (so different agents can have different KBs)
CREATE TABLE IF NOT EXISTS ai_agent_kb_categories (
  id           TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ai_agent_id  TEXT    NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  category_id  TEXT    NOT NULL REFERENCES kb_categories(id) ON DELETE CASCADE,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(ai_agent_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_kb_categories_agent_id ON ai_agent_kb_categories(ai_agent_id);

-- ─── Roles & Permissions ──────────────────────────────────────────────────────
-- Custom workspace roles. Built-in 'owner'|'admin'|'agent' remain valid in
-- workspace_members.role; this table layers optional custom roles on top.
-- permissions: JSON array of permission keys (see Permission catalog in code)
-- is_system: 1 = the built-in row that mirrors owner/admin/agent — read-only
CREATE TABLE IF NOT EXISTS workspace_roles (
  id           TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key          TEXT    NOT NULL, -- unique slug used in workspace_members.role
  name         TEXT    NOT NULL,
  description  TEXT,
  permissions  TEXT    NOT NULL DEFAULT '[]',
  is_system    INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, key)
);

CREATE INDEX IF NOT EXISTS idx_workspace_roles_workspace_id ON workspace_roles(workspace_id);