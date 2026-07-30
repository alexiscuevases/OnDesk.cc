-- Migration 002: per-user email notification preferences
--
-- One row per (user, workspace). A missing row means "all defaults", so email
-- delivery works before a user ever opens the preferences screen.
--
-- Columns map 1:1 to the notify() pref keys in functions/_lib/notify.ts:
--   email_enabled            master switch — off silences every email
--   ticket_assigned_to_me    a ticket was assigned to me
--   ticket_assigned_to_team  a ticket landed on one of my teams (or the shared inbox)
--   reply_on_my_ticket       a reply arrived on a ticket assigned to me
--   reply_on_team_ticket     a reply arrived on a ticket assigned to one of my teams
--   mention                  someone @mentioned me
--   escalation               an AI agent escalated a ticket to a human
--   sla_breach               an SLA target was missed
--   ticket_status            status / priority changes on tickets I follow
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                      TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id                 TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id            TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email_enabled           INTEGER NOT NULL DEFAULT 1,
  ticket_assigned_to_me   INTEGER NOT NULL DEFAULT 1,
  ticket_assigned_to_team INTEGER NOT NULL DEFAULT 1,
  reply_on_my_ticket      INTEGER NOT NULL DEFAULT 1,
  reply_on_team_ticket    INTEGER NOT NULL DEFAULT 1,
  mention                 INTEGER NOT NULL DEFAULT 1,
  escalation              INTEGER NOT NULL DEFAULT 1,
  sla_breach              INTEGER NOT NULL DEFAULT 1,
  ticket_status           INTEGER NOT NULL DEFAULT 0,
  created_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id, workspace_id);
