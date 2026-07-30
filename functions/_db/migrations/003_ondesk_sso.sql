-- Pulse becomes a Relying Party of the OnDesk control plane.
--
-- RUN THIS ONLY AFTER the data migration has copied users, workspaces,
-- memberships, invitations, subscriptions and security settings into ondesk-db
-- with their primary keys preserved. Everything dropped here is gone.
--
-- See ondesk/docs/platform-architecture.md and ondesk/scripts/migrate-from-pulse.mjs.

-- ─── Entitlements ─────────────────────────────────────────────────────────────
--
-- What this workspace may do in Pulse, mirrored from ondesk's subscriptions
-- table. Pulse reads it and never writes it outside _lib/db/mirror.ts.
CREATE TABLE IF NOT EXISTS workspace_entitlements (
  workspace_id       TEXT    PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  plan               TEXT    NOT NULL DEFAULT 'core',
  status             TEXT    NOT NULL DEFAULT 'active',
  agent_count        INTEGER NOT NULL DEFAULT 1,
  current_period_end INTEGER,
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Carry the existing subscriptions over before the table is dropped, so nobody
-- loses access in the window between deploy and the first webhook.
-- The `WHERE true` is load-bearing: with INSERT...SELECT, SQLite cannot tell an
-- upsert's ON CONFLICT from a join's ON clause unless the SELECT has a WHERE.
INSERT INTO workspace_entitlements (workspace_id, plan, status, agent_count, current_period_end)
SELECT workspace_id, plan, status, agent_count, current_period_end FROM subscriptions WHERE true
ON CONFLICT(workspace_id) DO NOTHING;

-- ─── Mirrored workspace fields ────────────────────────────────────────────────
--
-- The audit toggle is owned by ondesk now; mirroring it keeps writeAuditLog
-- behaving the way each tenant configured it.
ALTER TABLE workspaces ADD COLUMN audit_log_enabled INTEGER NOT NULL DEFAULT 1;

UPDATE workspaces
SET audit_log_enabled = COALESCE(
  (SELECT s.audit_log_enabled FROM workspace_security_settings s WHERE s.workspace_id = workspaces.id),
  1
);

-- ─── Drop what ondesk now owns ────────────────────────────────────────────────

DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS workspace_security_settings;
DROP TABLE IF EXISTS workspace_ip_allowlist;
DROP TABLE IF EXISTS workspace_invitations;
DROP TABLE IF EXISTS two_factor_codes;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS user_identities;

-- `refresh_tokens` stays: it backs pulse's own session, which the SSO callback
-- still issues. Existing rows are invalidated by the cutover, not by this file —
-- every user signs in once through ondesk afterwards.
DELETE FROM refresh_tokens;

-- ─── Users become a mirror ────────────────────────────────────────────────────
--
-- Credentials must not survive in a database that no longer authenticates
-- anyone. Dropping the columns is the point of this block, not a tidy-up.
ALTER TABLE users DROP COLUMN password_hash;
ALTER TABLE users DROP COLUMN login_attempts;
ALTER TABLE users DROP COLUMN locked_until;
ALTER TABLE users DROP COLUMN two_factor_enabled;

-- `role` stays: it is denormalised into pulse's JWT payload and read by the
-- roles feature. `workspace_members.role` remains the tenancy authority.
