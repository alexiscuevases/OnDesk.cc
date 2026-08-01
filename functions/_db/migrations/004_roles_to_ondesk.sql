-- Roles and permissions move to the control plane.
--
-- Pulse defined roles it could never assign. A role's `key` had to be written
-- into `workspace_members.role`, which is mirrored from ondesk and validated
-- there against ['owner','admin','agent'] — so the definition lived here and the
-- assignment lived there, and the two never met. Nothing enforced them either:
-- `hasPermission()` had no call sites in the repo's history.
--
-- What Pulse keeps is the answer, not the machinery: each mirrored member now
-- carries the permission list ondesk resolved for them, written by mirror.ts and
-- nothing else. Defining a role, ticking its boxes and handing it to somebody all
-- happen at ondesk.cc/workspaces/:slug/roles.

-- Resolved by ondesk from the role attached to this member's Pulse seat. A JSON
-- array of permission keys. Empty means "nobody has said": getUserPermissions
-- falls back to the built-in preset for their tenancy role, so a member whose
-- mirror row predates this column keeps exactly the access they had.
ALTER TABLE workspace_members ADD COLUMN permissions TEXT NOT NULL DEFAULT '[]';

-- Safe to drop: verified empty in production before this was written, and every
-- member held a standard tenancy role, so no assignment pointed at a custom key.
DROP TABLE IF EXISTS workspace_roles;
