import { useQuery } from "@tanstack/react-query";
import { apiGetCannedReplies, apiGetCannedReply } from "../api/canned-replies-api";

export const cannedReplyQueryKeys = {
	all: (workspaceId: string) => ["canned-replies", workspaceId] as const,
	detail: (id: string) => ["canned-replies", id] as const,
};

export function useCannedReplies(workspaceId: string) {
	return useQuery({
		queryKey: cannedReplyQueryKeys.all(workspaceId),
		queryFn: () => apiGetCannedReplies(workspaceId),
		staleTime: 1000 * 60 * 5,
	});
}

export function useCannedReply(id: string) {
	return useQuery({
		queryKey: cannedReplyQueryKeys.detail(id),
		queryFn: () => apiGetCannedReply(id),
		staleTime: 1000 * 60 * 5,
	});
}
