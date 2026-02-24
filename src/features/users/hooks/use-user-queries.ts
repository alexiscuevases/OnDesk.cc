import { useQuery } from "@tanstack/react-query";
import { apiGetWorkspaceMembers } from "../api/users-api";

export const userQueryKeys = {
	members: (workspaceId: string) => ["users", workspaceId, "members"] as const,
};

export function useWorkspaceMembers(workspaceId: string) {
	return useQuery({
		queryKey: userQueryKeys.members(workspaceId),
		queryFn: () => apiGetWorkspaceMembers(workspaceId),
		staleTime: 1000 * 60 * 5,
	});
}
