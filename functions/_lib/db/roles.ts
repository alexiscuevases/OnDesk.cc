import type { Permission } from "../types/roles";
import { BUILTIN_ROLE_PERMISSIONS, ALL_PERMISSIONS } from "../types/roles";

/**
 * What a member may do inside Pulse.
 *
 * Roles themselves are ondesk's. Defining one, choosing its permissions and
 * handing it to somebody all happen at ondesk.cc/workspaces/:slug/roles, because
 * the assignment hangs off the Pulse *seat* and seats are the control plane's.
 * Pulse used to own the definitions and could never assign them: the key had to
 * go into `workspace_members.role`, which is mirrored and validated upstream
 * against owner/admin/agent.
 *
 * What arrives here is the resolved answer, written into the mirrored
 * `workspace_members.permissions` column by mirror.ts — on sign-in from the ID
 * token, on a role edit by webhook, and on reconcile. Nothing else writes it.
 */

function parsePermissions(raw: string | null): Permission[] {
	if (!raw) return [];
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		// Filtered against our own catalogue: ondesk stores permission keys as
		// opaque strings, so a key Pulse has never heard of can reach us after a
		// deploy that removed it.
		return parsed.filter((p): p is Permission => typeof p === "string" && (ALL_PERMISSIONS as string[]).includes(p));
	} catch {
		return [];
	}
}

/**
 * Resolution order:
 *   1. the permissions ondesk resolved for this member's seat
 *   2. the built-in preset for their tenancy role, when the column is empty
 *
 * The fallback is what makes this safe to deploy before the first sync: a mirror
 * row written before the column existed carries `[]`, and treating that as "no
 * access at all" would lock out a whole workspace until its next sign-in.
 */
export async function getUserPermissions(db: D1Database, workspaceId: string, userId: string): Promise<Permission[]> {
	const member = await db
		.prepare("SELECT role, permissions FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1")
		.bind(workspaceId, userId)
		.first<{ role: string; permissions: string | null }>();
	if (!member) return [];

	const resolved = parsePermissions(member.permissions);
	if (resolved.length > 0) return resolved;

	return BUILTIN_ROLE_PERMISSIONS[member.role] ?? [];
}

export async function hasPermission(
	db: D1Database,
	workspaceId: string,
	userId: string,
	permission: Permission,
): Promise<boolean> {
	return (await getUserPermissions(db, workspaceId, userId)).includes(permission);
}
