export interface Workspace {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	logo_url: string | null;
	workspace_prompt: string | null;
	role: string;
	created_at: number;
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

// apiCreateWorkspace lived here, POSTing to an endpoint that is GET-only.
// Workspaces are created on ondesk — they span four products and carry the
// billing account — and arrive here by mirror.

/**
 * `workspace_prompt` and nothing else.
 *
 * Name, description and logo are OnDesk's — the endpoint rejects them, and a
 * wider type here is what let a settings form send them for months and report
 * success. See functions/api/workspaces/[slug]/index.ts.
 */
export async function apiUpdateWorkspace(
	slug: string,
	input: { workspace_prompt?: string }
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

// apiDeleteWorkspace lived here, calling a DELETE the API never implemented —
// it answered 405. Deleting a tenant is ondesk's, for the same reason creating
// one is.
