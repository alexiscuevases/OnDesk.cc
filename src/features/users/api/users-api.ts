export interface WorkspaceMember {
	id: string;
	name: string;
	email: string;
	role: string; // global role
	workspace_role: string;
	logo_url: string | null;
	created_at: number;
}

export interface WorkspaceInvitation {
	id: string;
	workspace_id: string;
	email: string;
	role: string;
	status: string;
	expires_at: number;
	created_at: number;
}

const API_BASE = "/api/users";
const INVITATIONS_BASE = "/api/invitations";

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

export async function apiInviteAgent(
	workspaceId: string,
	email: string,
	role: string
): Promise<{ added?: boolean; invited?: boolean; email?: string }> {
	const res = await fetch(INVITATIONS_BASE, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ workspace_id: workspaceId, email, role }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to send invitation");
	}
	return res.json() as Promise<{ added?: boolean; invited?: boolean; email?: string }>;
}

export async function apiGetInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
	const res = await fetch(`${INVITATIONS_BASE}?workspace_id=${workspaceId}`, {
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch invitations");
	}
	const data = (await res.json()) as { invitations: WorkspaceInvitation[] };
	return data.invitations;
}

export async function apiCancelInvitation(invitationId: string, workspaceId: string): Promise<void> {
	const res = await fetch(`${INVITATIONS_BASE}?id=${invitationId}&workspace_id=${workspaceId}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to cancel invitation");
	}
}
