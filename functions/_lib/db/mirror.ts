/**
 * The mirror of OnDesk state.
 *
 * `users`, `workspaces` and `workspace_members` are no longer owned here — they
 * are a local cache of the control plane, kept so the ~35 foreign keys pointing
 * at users(id) and workspaces(id) keep resolving and none of pulse's queries
 * have to change.
 *
 * The only writers are the platform webhook and the reconcile job. Sign-in no
 * longer provisions anything: the session is the shared `.ondesk.cc` cookie,
 * granting a seat is what tells this product about a person (the
 * `member_added` webhook carries the profile), and the hourly reconcile
 * repairs whatever a dropped delivery left stale. Anything else that writes
 * these tables will drift, and the drift is invisible until a JOIN starts
 * returning the wrong rows.
 */

export interface MirroredUser {
	id: string;
	name: string;
	email: string;
	logo_url: string | null;
}

export async function upsertMirroredUser(db: D1Database, user: MirroredUser): Promise<void> {
	await db
		.prepare(
			`INSERT INTO users (id, name, email, logo_url)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name       = excluded.name,
         email      = excluded.email,
         logo_url   = excluded.logo_url,
         updated_at = unixepoch()`,
		)
		.bind(user.id, user.name, user.email.toLowerCase(), user.logo_url)
		.run();
}

export async function upsertMirroredWorkspace(
	db: D1Database,
	workspace: {
		id: string;
		name: string;
		slug: string;
		logo_url: string | null;
		audit_log_enabled?: boolean;
	},
	createdBy: string,
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO workspaces (id, name, slug, logo_url, audit_log_enabled, created_by)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name              = excluded.name,
         slug              = excluded.slug,
         logo_url          = excluded.logo_url,
         audit_log_enabled = excluded.audit_log_enabled,
         updated_at        = unixepoch()`,
		)
		.bind(
			workspace.id,
			workspace.name,
			workspace.slug,
			workspace.logo_url,
			workspace.audit_log_enabled === false ? 0 : 1,
			createdBy,
		)
		.run();
}

/**
 * `permissions` is what ondesk resolved from the role on this member's Pulse
 * seat — the answer, not the role row it came from. Undefined leaves whatever is
 * stored alone: a `member_updated` webhook that only carries a tenancy change
 * must not blank the permissions, and there is no "clear them" case (an empty
 * array is a member with no grants, which is a legitimate thing to store).
 */
export async function upsertMirroredMember(
	db: D1Database,
	workspaceId: string,
	userId: string,
	role: string,
	permissions?: string[],
): Promise<void> {
	const id = crypto.randomUUID();
	if (permissions === undefined) {
		await db
			.prepare(
				`INSERT INTO workspace_members (id, workspace_id, user_id, role)
	     VALUES (?, ?, ?, ?)
	     ON CONFLICT(workspace_id, user_id) DO UPDATE SET role = excluded.role`,
			)
			.bind(id, workspaceId, userId, role)
			.run();
		return;
	}

	await db
		.prepare(
			`INSERT INTO workspace_members (id, workspace_id, user_id, role, permissions)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(workspace_id, user_id) DO UPDATE SET
         role        = excluded.role,
         permissions = excluded.permissions`,
		)
		.bind(id, workspaceId, userId, role, JSON.stringify(permissions))
		.run();
}

/**
 * A role edit at ondesk changes what several people may do at once, so it
 * arrives as one event carrying every seat holder rather than one per member.
 * Anyone absent from the list is not touched: they hold no seat for this product
 * and have nothing to update.
 */
export async function applyMirroredPermissions(
	db: D1Database,
	workspaceId: string,
	members: { user_id: string; permissions: string[] }[],
): Promise<void> {
	for (const member of members) {
		await db
			.prepare("UPDATE workspace_members SET permissions = ? WHERE workspace_id = ? AND user_id = ?")
			.bind(JSON.stringify(member.permissions), workspaceId, member.user_id)
			.run();
	}
}

export async function removeMirroredMember(db: D1Database, workspaceId: string, userId: string): Promise<void> {
	await db
		.prepare("DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
		.bind(workspaceId, userId)
		.run();
}

export async function upsertEntitlement(
	db: D1Database,
	workspaceId: string,
	entitlement: { plan: string; status: string; agent_count: number; current_period_end: number | null },
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO workspace_entitlements (workspace_id, plan, status, agent_count, current_period_end)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(workspace_id) DO UPDATE SET
         plan               = excluded.plan,
         status             = excluded.status,
         agent_count        = excluded.agent_count,
         current_period_end = excluded.current_period_end,
         updated_at         = unixepoch()`,
		)
		.bind(workspaceId, entitlement.plan, entitlement.status, entitlement.agent_count, entitlement.current_period_end)
		.run();
}

export async function clearEntitlement(db: D1Database, workspaceId: string): Promise<void> {
	await db
		.prepare(
			`UPDATE workspace_entitlements SET status = 'canceled', updated_at = unixepoch() WHERE workspace_id = ?`,
		)
		.bind(workspaceId)
		.run();
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

/** Whether this workspace may currently use pulse. */
export async function isEntitled(db: D1Database, workspaceId: string): Promise<boolean> {
	const row = await db
		.prepare("SELECT status FROM workspace_entitlements WHERE workspace_id = ? LIMIT 1")
		.bind(workspaceId)
		.first<{ status: string }>();
	return row !== null && ACTIVE_STATUSES.has(row.status);
}

