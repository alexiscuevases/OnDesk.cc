-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001 — Marketplace connectors
--
-- Rebuilds the marketplace tables so products become full connector
-- definitions (base URL + auth config + per-endpoint actions) and installs
-- store encrypted credentials.
--
-- SAFE TO RUN: the previous schema had no product-creation API, so these
-- tables held no user data. It drops and recreates them from scratch.
--
--   npm run db:migrate:marketplace:local
--   npm run db:migrate:marketplace:remote
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS agent_tools;
DROP TABLE IF EXISTS workspace_products;
DROP TABLE IF EXISTS product_actions;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id              TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id    TEXT    REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT    NOT NULL,
  description     TEXT,
  logo_url        TEXT,
  category        TEXT    NOT NULL DEFAULT 'other',
  docs_url        TEXT,
  base_url        TEXT    NOT NULL DEFAULT '',
  auth_type       TEXT    NOT NULL DEFAULT 'none',
  auth_config     TEXT    NOT NULL DEFAULT '{"type":"none"}',
  config_fields   TEXT    NOT NULL DEFAULT '[]',
  default_headers TEXT    NOT NULL DEFAULT '{}',
  is_public       INTEGER NOT NULL DEFAULT 0,
  created_by      TEXT    REFERENCES users(id) ON DELETE SET NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_products_workspace_id ON products(workspace_id);
CREATE INDEX IF NOT EXISTS idx_products_public       ON products(is_public);

CREATE TABLE product_actions (
  id                    TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id            TEXT    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name                  TEXT    NOT NULL,
  description           TEXT    NOT NULL,
  method                TEXT    NOT NULL DEFAULT 'GET',
  path                  TEXT    NOT NULL DEFAULT '/',
  content_type          TEXT    NOT NULL DEFAULT 'json',
  parameters            TEXT    NOT NULL DEFAULT '[]',
  headers               TEXT    NOT NULL DEFAULT '{}',
  response_path         TEXT,
  requires_confirmation INTEGER NOT NULL DEFAULT 0,
  is_read_only          INTEGER NOT NULL DEFAULT 1,
  enabled               INTEGER NOT NULL DEFAULT 1,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(product_id, name)
);

CREATE INDEX IF NOT EXISTS idx_product_actions_product_id ON product_actions(product_id);

CREATE TABLE workspace_products (
  id              TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id      TEXT    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  credentials     TEXT,
  settings        TEXT    NOT NULL DEFAULT '{}',
  status          TEXT    NOT NULL DEFAULT 'enabled',
  last_test_at    INTEGER,
  last_test_ok    INTEGER,
  last_test_error TEXT,
  installed_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_products_workspace_id ON workspace_products(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_products_product_id   ON workspace_products(product_id);

CREATE TABLE agent_tools (
  id                    TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ai_agent_id           TEXT    NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  workspace_product_id  TEXT    NOT NULL REFERENCES workspace_products(id) ON DELETE CASCADE,
  allowed_actions       TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(ai_agent_id, workspace_product_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_tools_agent_id ON agent_tools(ai_agent_id);

CREATE TABLE IF NOT EXISTS tool_call_logs (
  id                   TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id         TEXT    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workspace_product_id TEXT    REFERENCES workspace_products(id) ON DELETE SET NULL,
  product_action_id    TEXT    REFERENCES product_actions(id) ON DELETE SET NULL,
  ai_agent_id          TEXT    REFERENCES ai_agents(id) ON DELETE SET NULL,
  ticket_id            TEXT    REFERENCES tickets(id) ON DELETE SET NULL,
  triggered_by         TEXT    NOT NULL DEFAULT 'agent',
  user_id              TEXT    REFERENCES users(id) ON DELETE SET NULL,
  action_id            TEXT    NOT NULL,
  method               TEXT,
  url                  TEXT,
  request_params       TEXT,
  status_code          INTEGER,
  ok                   INTEGER NOT NULL DEFAULT 0,
  duration_ms          INTEGER,
  error                TEXT,
  response_preview     TEXT,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tool_call_logs_workspace  ON tool_call_logs(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tool_call_logs_wp         ON tool_call_logs(workspace_product_id);
CREATE INDEX IF NOT EXISTS idx_tool_call_logs_agent      ON tool_call_logs(ai_agent_id);
CREATE INDEX IF NOT EXISTS idx_tool_call_logs_ticket     ON tool_call_logs(ticket_id);
