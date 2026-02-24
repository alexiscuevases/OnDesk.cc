export interface WorkspaceMember {
	id: string;
	name: string;
	email: string;
	role: string; // global role
	workspace_role: string;
	created_at: number;
}

const API_BASE = "/api/users";

export async function apiGetWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch workspace members");
	}
	const data = (await res.json()) as { users: WorkspaceMember[] };
	return data.users;
}

export async function apiUpdateMemberRole(
	workspaceId: string,
	userId: string,
	role: string
): Promise<void> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}&user_id=${userId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ role }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to update member role");
	}
}

export async function apiRemoveWorkspaceMember(
	workspaceId: string,
	userId: string
): Promise<void> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}&user_id=${userId}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to remove member");
	}
}
