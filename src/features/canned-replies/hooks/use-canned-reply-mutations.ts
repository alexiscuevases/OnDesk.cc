import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCreateCannedReply, apiUpdateCannedReply, apiDeleteCannedReply } from "../api/canned-replies-api";
import { cannedReplyQueryKeys } from "./use-canned-reply-queries";
import type { CreateCannedReplyInput, UpdateCannedReplyInput } from "../api/canned-replies-api";

export function useCreateCannedReplyMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateCannedReplyInput) => apiCreateCannedReply(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cannedReplyQueryKeys.all(workspaceId) });
		},
	});
}

export function useUpdateCannedReplyMutation(replyId: string, workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateCannedReplyInput) => apiUpdateCannedReply(replyId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cannedReplyQueryKeys.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: cannedReplyQueryKeys.detail(replyId) });
		},
	});
}

export function useDeleteCannedReplyMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (replyId: string) => apiDeleteCannedReply(replyId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cannedReplyQueryKeys.all(workspaceId) });
		},
	});
}
