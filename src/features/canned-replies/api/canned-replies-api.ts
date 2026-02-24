export interface CannedReply {
	id: string;
	workspace_id: string;
	name: string;
	content: string;
	shortcut: string | null;
	created_by: string;
	created_at: number;
}

export interface CreateCannedReplyInput {
	workspace_id: string;
	name: string;
	content: string;
	shortcut?: string;
}

export interface UpdateCannedReplyInput {
	name?: string;
	content?: string;
	shortcut?: string | null;
}

const API_BASE = "/api/canned-replies";

export async function apiGetCannedReplies(workspaceId: string): Promise<CannedReply[]> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch canned replies");
	}
	const data = (await res.json()) as { canned_replies: CannedReply[] };
	return data.canned_replies;
}

export async function apiGetCannedReply(id: string): Promise<CannedReply> {
	const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Canned reply not found");
	}
	const data = (await res.json()) as { canned_reply: CannedReply };
	return data.canned_reply;
}

export async function apiCreateCannedReply(input: CreateCannedReplyInput): Promise<CannedReply> {
	const { workspace_id, ...body } = input;
	const res = await fetch(`${API_BASE}?workspace_id=${workspace_id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to create canned reply");
	}
	const data = (await res.json()) as { canned_reply: CannedReply };
	return data.canned_reply;
}

export async function apiUpdateCannedReply(
	id: string,
	input: UpdateCannedReplyInput
): Promise<CannedReply> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to update canned reply");
	}
	const data = (await res.json()) as { canned_reply: CannedReply };
	return data.canned_reply;
}

export async function apiDeleteCannedReply(id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to delete canned reply");
	}
}
