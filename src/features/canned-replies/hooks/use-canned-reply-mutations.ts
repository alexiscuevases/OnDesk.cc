import { createWorkspaceScopedMutationHooks } from "@/lib/crud-hooks";
import { apiCreateCannedReply, apiUpdateCannedReply, apiDeleteCannedReply } from "../api/canned-replies-api";
import type { CreateCannedReplyInput, UpdateCannedReplyInput } from "../api/canned-replies-api";
import { cannedReplyQueryKeys } from "./use-canned-reply-queries";

const { useCreate, useUpdate, useDelete } = createWorkspaceScopedMutationHooks<
	unknown,
	CreateCannedReplyInput,
	UpdateCannedReplyInput
>(cannedReplyQueryKeys, {
	create: apiCreateCannedReply,
	update: apiUpdateCannedReply,
	delete: apiDeleteCannedReply,
});

export const useCreateCannedReplyMutation = useCreate;
export const useUpdateCannedReplyMutation = useUpdate;
export const useDeleteCannedReplyMutation = useDelete;
