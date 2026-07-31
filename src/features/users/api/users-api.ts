export interface WorkspaceMember {
	id: string;
	name: string;
	email: string;
	role: string; // global role
	workspace_role: string;
	logo_url: string | null;
	created_at: number;
}

const API_BASE = "/api/users";

// Read-only by design. `workspace_members` in pulse-db is a mirror of ondesk,
// written only by mirror.ts — inviting someone, changing a role or removing a
// member all happen on ondesk, and a local write here would be reverted by the
// next sync without anyone noticing.

export async function apiGetWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch workspace members");
	}
	const data = (await res.json()) as { users: WorkspaceMember[] };
	return data.users;
}
