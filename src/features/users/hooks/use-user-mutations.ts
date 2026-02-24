import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUpdateMemberRole, apiRemoveWorkspaceMember } from "../api/users-api";
import { userQueryKeys } from "./use-user-queries";

export function useUpdateMemberRoleMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: string }) =>
			apiUpdateMemberRole(workspaceId, userId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.members(workspaceId) });
		},
	});
}

export function useRemoveMemberMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) => apiRemoveWorkspaceMember(workspaceId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.members(workspaceId) });
		},
	});
}
