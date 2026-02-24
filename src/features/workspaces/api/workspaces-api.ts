export interface Workspace {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	logo_url: string | null;
	role: string;
	created_at: number;
}

export interface CreateWorkspaceInput {
	name: string;
	slug: string;
	description?: string;
	logo_url?: string;
}

const API_BASE = "/api/workspaces";

export async function apiGetWorkspaces(): Promise<Workspace[]> {
	const res = await fetch(API_BASE, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch workspaces");
	}
	const data = (await res.json()) as { workspaces: Workspace[] };
	return data.workspaces;
}

export async function apiGetWorkspace(slug: string): Promise<Workspace> {
	const res = await fetch(`${API_BASE}/${slug}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Workspace not found");
	}
	const data = (await res.json()) as { workspace: Workspace };
	return data.workspace;
}

export async function apiCreateWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
	const res = await fetch(API_BASE, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to create workspace");
	}
	const data = (await res.json()) as { workspace: Workspace };
	return data.workspace;
}

export async function apiUpdateWorkspace(
	slug: string,
	input: { name?: string; description?: string; logo_url?: string }
): Promise<Workspace> {
	const res = await fetch(`${API_BASE}/${slug}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to update workspace");
	}
	const data = (await res.json()) as { workspace: Workspace };
	return data.workspace;
}

export async function apiDeleteWorkspace(slug: string): Promise<void> {
	const res = await fetch(`${API_BASE}/${slug}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to delete workspace");
	}
}
