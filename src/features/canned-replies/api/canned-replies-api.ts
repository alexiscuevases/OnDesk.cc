import { createWorkspaceScopedApi } from "@/lib/crud-api";

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

const _api = createWorkspaceScopedApi<CannedReply, CreateCannedReplyInput, UpdateCannedReplyInput>({
	basePath: "/api/canned-replies",
	listKey: "canned_replies",
	itemKey: "canned_reply",
});

export const apiGetCannedReplies = _api.getAll;
export const apiGetCannedReply = _api.getById;
export const apiCreateCannedReply = _api.create;
export const apiUpdateCannedReply = (id: string, input: UpdateCannedReplyInput) => _api.update(id, input);
export const apiDeleteCannedReply = _api.delete;
