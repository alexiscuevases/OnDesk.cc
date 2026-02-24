import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUpdateMemberRole, apiRemoveWorkspaceMember, apiInviteAgent, apiCancelInvitation } from "../api/users-api";
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

export function useInviteAgentMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ email, role }: { email: string; role: string }) =>
			apiInviteAgent(workspaceId, email, role),
		onSuccess: (data) => {
			if (data.added) {
				queryClient.invalidateQueries({ queryKey: userQueryKeys.members(workspaceId) });
			} else {
				queryClient.invalidateQueries({ queryKey: userQueryKeys.invitations(workspaceId) });
			}
		},
	});
}

export function useCancelInvitationMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (invitationId: string) => apiCancelInvitation(invitationId, workspaceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.invitations(workspaceId) });
		},
	});
}
