import { apiFetch } from "@/lib/crud-api";

export type Permission =
	| "tickets.view"
	| "tickets.create"
	| "tickets.edit"
	| "tickets.delete"
	| "tickets.assign"
	| "tickets.reply"
	| "tickets.note"
	| "contacts.view"
	| "contacts.manage"
	| "companies.view"
	| "companies.manage"
	| "teams.view"
	| "teams.manage"
	| "members.view"
	| "members.manage"
	| "canned_replies.manage"
	| "signatures.manage"
	| "automations.manage"
	| "sla.manage"
	| "kb.view"
	| "kb.manage"
	| "ai_agents.manage"
	| "marketplace.manage"
	| "billing.manage"
	| "security.manage"
	| "workspace.manage";

export interface WorkspaceRole {
	id: string;
	workspace_id: string;
	key: string;
	name: string;
	description: string | null;
	permissions: Permission[];
	is_system: boolean;
	created_at: number;
	updated_at: number;
}

export interface RolesListResponse {
	roles: WorkspaceRole[];
	current_user_permissions: Permission[];
	available_permissions: Permission[];
}

export interface CreateRoleInput {
	workspace_id: string;
	key?: string;
	name: string;
	description?: string | null;
	permissions: Permission[];
}

export interface UpdateRoleInput {
	name?: string;
	description?: string | null;
	permissions?: Permission[];
}

async function handle<T>(res: Response, msg: string): Promise<T> {
	if (!res.ok) {
		const err = (await res.json().catch(() => ({}))) as { error?: string };
		throw new Error(err.error ?? msg);
	}
	return res.json() as Promise<T>;
}

export async function apiGetRoles(workspaceId: string): Promise<RolesListResponse> {
	const res = await apiFetch(`/api/roles?workspace_id=${workspaceId}`);
	return handle<RolesListResponse>(res, "Failed to load roles");
}

export async function apiCreateRole(input: CreateRoleInput): Promise<WorkspaceRole> {
	const { workspace_id, ...body } = input;
	const res = await apiFetch(`/api/roles?workspace_id=${workspace_id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = await handle<{ role: WorkspaceRole }>(res, "Failed to create role");
	return data.role;
}

export async function apiUpdateRole(id: string, input: UpdateRoleInput): Promise<WorkspaceRole> {
	const res = await apiFetch(`/api/roles/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	const data = await handle<{ role: WorkspaceRole }>(res, "Failed to update role");
	return data.role;
}

export async function apiDeleteRole(id: string): Promise<void> {
	const res = await apiFetch(`/api/roles/${id}`, { method: "DELETE" });
	await handle<unknown>(res, "Failed to delete role");
}
