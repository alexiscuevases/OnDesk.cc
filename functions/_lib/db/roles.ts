import type {
	WorkspaceRoleRow,
	PublicWorkspaceRole,
	Permission,
} from "../types/roles";
import { BUILTIN_ROLE_PERMISSIONS, ALL_PERMISSIONS } from "../types/roles";

function parsePermissions(raw: string): Permission[] {
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return parsed.filter((p): p is Permission => typeof p === "string" && (ALL_PERMISSIONS as string[]).includes(p));
		}
	} catch {
		// ignore
	}
	return [];
}

export function rowToPublicRole(row: WorkspaceRoleRow): PublicWorkspaceRole {
	return {
		id: row.id,
		workspace_id: row.workspace_id,
		key: row.key,
		name: row.name,
		description: row.description,
		permissions: parsePermissions(row.permissions),
		is_system: Boolean(row.is_system),
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

export async function findWorkspaceRolesByWorkspace(db: D1Database, workspaceId: string): Promise<PublicWorkspaceRole[]> {
	const result = await db
		.prepare("SELECT * FROM workspace_roles WHERE workspace_id = ? ORDER BY is_system DESC, name ASC")
		.bind(workspaceId)
		.all<WorkspaceRoleRow>();
	return (result.results ?? []).map(rowToPublicRole);
}

export async function findWorkspaceRoleById(db: D1Database, id: string): Promise<WorkspaceRoleRow | null> {
	const result = await db.prepare("SELECT * FROM workspace_roles WHERE id = ? LIMIT 1").bind(id).first<WorkspaceRoleRow>();
	return result ?? null;
}

export async function findWorkspaceRoleByKey(db: D1Database, workspaceId: string, key: string): Promise<WorkspaceRoleRow | null> {
	const result = await db
		.prepare("SELECT * FROM workspace_roles WHERE workspace_id = ? AND key = ? LIMIT 1")
		.bind(workspaceId, key)
		.first<WorkspaceRoleRow>();
	return result ?? null;
}

export async function createWorkspaceRole(
	db: D1Database,
	workspaceId: string,
	data: { key: string; name: string; description?: string | null; permissions: Permission[]; is_system?: boolean },
): Promise<WorkspaceRoleRow> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			"INSERT INTO workspace_roles (id, workspace_id, key, name, description, permissions, is_system) VALUES (?, ?, ?, ?, ?, ?, ?)",
		)
		.bind(
			id,
			workspaceId,
			data.key,
			data.name,
			data.description ?? null,
			JSON.stringify(data.permissions),
			data.is_system ? 1 : 0,
		)
		.run();
	return (await findWorkspaceRoleById(db, id))!;
}

export async function updateWorkspaceRole(
	db: D1Database,
	id: string,
	data: { name?: string; description?: string | null; permissions?: Permission[] },
): Promise<void> {
	const fields: string[] = [];
	const values: (string | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.permissions !== undefined) {
		fields.push("permissions = ?");
		values.push(JSON.stringify(data.permissions));
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(id);
	await db.prepare(`UPDATE workspace_roles SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
}

export async function deleteWorkspaceRole(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM workspace_roles WHERE id = ? AND is_system = 0").bind(id).run();
}

// ─── Permission checking ──────────────────────────────────────────────────────

/**
 * Resolve a user's permissions in a workspace.
 * Looks at workspace_members.role:
 *  - if it matches a builtin (owner/admin/agent), use BUILTIN_ROLE_PERMISSIONS
 *  - otherwise look it up as a workspace_roles.key
 */
export async function getUserPermissions(db: D1Database, workspaceId: string, userId: string): Promise<Permission[]> {
	const member = await db
		.prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1")
		.bind(workspaceId, userId)
		.first<{ role: string }>();
	if (!member) return [];

	const builtin = BUILTIN_ROLE_PERMISSIONS[member.role];
	if (builtin) return builtin;

	const role = await findWorkspaceRoleByKey(db, workspaceId, member.role);
	if (!role) return [];
	return parsePermissions(role.permissions);
}

export async function hasPermission(db: D1Database, workspaceId: string, userId: string, permission: Permission): Promise<boolean> {
	const perms = await getUserPermissions(db, workspaceId, userId);
	return perms.includes(permission);
}
