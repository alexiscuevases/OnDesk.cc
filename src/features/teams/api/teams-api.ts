export interface Team {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	created_at: number;
}

export interface TeamMember {
	id: string;
	name: string;
	email: string;
}

export interface CreateTeamInput {
	workspace_id: string;
	name: string;
	description?: string;
}

export interface UpdateTeamInput {
	name?: string;
	description?: string;
}

const API_BASE = "/api/teams";

export async function apiGetTeams(workspaceId: string): Promise<Team[]> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch teams");
	}
	const data = (await res.json()) as { teams: Team[] };
	return data.teams;
}

export async function apiGetTeam(id: string): Promise<Team> {
	const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Team not found");
	}
	const data = (await res.json()) as { team: Team };
	return data.team;
}

export async function apiCreateTeam(input: CreateTeamInput): Promise<Team> {
	const { workspace_id, ...body } = input;
	const res = await fetch(`${API_BASE}?workspace_id=${workspace_id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to create team");
	}
	const data = (await res.json()) as { team: Team };
	return data.team;
}

export async function apiUpdateTeam(id: string, input: UpdateTeamInput): Promise<Team> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to update team");
	}
	const data = (await res.json()) as { team: Team };
	return data.team;
}

export async function apiDeleteTeam(id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to delete team");
	}
}

export async function apiGetTeamMembers(teamId: string): Promise<TeamMember[]> {
	const res = await fetch(`${API_BASE}/${teamId}?members=true`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch team members");
	}
	const data = (await res.json()) as { members: TeamMember[] };
	return data.members;
}

export async function apiAddTeamMember(teamId: string, userId: string): Promise<void> {
	const res = await fetch(`${API_BASE}/${teamId}?action=add_member&user_id=${userId}`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to add team member");
	}
}

export async function apiRemoveTeamMember(teamId: string, userId: string): Promise<void> {
	const res = await fetch(`${API_BASE}/${teamId}?action=remove_member&user_id=${userId}`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to remove team member");
	}
}
