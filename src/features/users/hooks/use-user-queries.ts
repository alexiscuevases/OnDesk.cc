import { useQuery } from "@tanstack/react-query";
import { apiGetWorkspaceMembers, apiGetInvitations } from "../api/users-api";

export const userQueryKeys = {
	members: (workspaceId: string) => ["users", workspaceId, "members"] as const,
	invitations: (workspaceId: string) => ["users", workspaceId, "invitations"] as const,
};

export function useWorkspaceMembers(workspaceId: string) {
	return useQuery({
		queryKey: userQueryKeys.members(workspaceId),
		queryFn: () => apiGetWorkspaceMembers(workspaceId),
		staleTime: 1000 * 60 * 5,
	});
}

export function useWorkspaceInvitations(workspaceId: string) {
	return useQuery({
		queryKey: userQueryKeys.invitations(workspaceId),
		queryFn: () => apiGetInvitations(workspaceId),
		staleTime: 1000 * 60 * 5,
	});
}
