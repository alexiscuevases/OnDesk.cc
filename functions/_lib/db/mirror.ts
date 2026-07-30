import type { IdTokenClaims, IdTokenWorkspace } from "../sso";

/**
 * The mirror of OnDesk state.
 *
 * `users`, `workspaces` and `workspace_members` are no longer owned here — they
 * are a local cache of the control plane, kept so the ~35 foreign keys pointing
 * at users(id) and workspaces(id) keep resolving and none of pulse's queries
 * have to change.
 *
 * The only writers are this module and the platform webhook. Anything else that
 * writes these tables will drift, and the drift is invisible until a JOIN starts
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

export async function upsertMirroredMember(
	db: D1Database,
	workspaceId: string,
	userId: string,
	role: string,
): Promise<void> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO workspace_members (id, workspace_id, user_id, role)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(workspace_id, user_id) DO UPDATE SET role = excluded.role`,
		)
		.bind(id, workspaceId, userId, role)
		.run();
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

/**
 * Just-in-time provisioning, run on every sign-in.
 *
 * Workspaces the token doesn't mention are NOT deleted: the ID token only
 * carries what this client is entitled to see, and treating its absence as a
 * deletion would wipe local data the moment a subscription lapsed. Removals
 * arrive as explicit webhook events instead.
 */
export async function provisionFromIdToken(db: D1Database, claims: IdTokenClaims): Promise<void> {
	await upsertMirroredUser(db, {
		id: claims.sub,
		name: claims.name,
		email: claims.email,
		logo_url: claims.picture,
	});

	for (const workspace of claims.workspaces) {
		if (!workspace.entitlement) continue; // not a pulse customer — nothing to mirror

		await upsertMirroredWorkspace(
			db,
			{
				id: workspace.id,
				name: workspace.name,
				slug: workspace.slug,
				logo_url: workspace.logo_url,
				audit_log_enabled: workspace.audit_log_enabled,
			},
			claims.sub,
		);
		await upsertMirroredMember(db, workspace.id, claims.sub, workspace.role);
		await upsertEntitlement(db, workspace.id, workspace.entitlement);
	}
}

/** The workspaces from a token that pulse should actually surface. */
export function entitledWorkspaces(claims: IdTokenClaims): IdTokenWorkspace[] {
	return claims.workspaces.filter(
		(w) => w.entitlement !== null && ACTIVE_STATUSES.has(w.entitlement.status),
	);
}
