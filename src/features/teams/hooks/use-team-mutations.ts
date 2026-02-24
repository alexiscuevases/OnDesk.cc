import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	apiCreateTeam, apiUpdateTeam, apiDeleteTeam,
	apiAddTeamMember, apiRemoveTeamMember,
} from "../api/teams-api";
import { teamQueryKeys } from "./use-team-queries";
import type { CreateTeamInput, UpdateTeamInput } from "../api/teams-api";

export function useCreateTeamMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateTeamInput) => apiCreateTeam(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamQueryKeys.all(workspaceId) });
		},
	});
}

export function useUpdateTeamMutation(teamId: string, workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateTeamInput) => apiUpdateTeam(teamId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamQueryKeys.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(teamId) });
		},
	});
}

export function useDeleteTeamMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (teamId: string) => apiDeleteTeam(teamId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamQueryKeys.all(workspaceId) });
		},
	});
}

export function useAddTeamMemberMutation(teamId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) => apiAddTeamMember(teamId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamQueryKeys.members(teamId) });
		},
	});
}

export function useRemoveTeamMemberMutation(teamId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) => apiRemoveTeamMember(teamId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamQueryKeys.members(teamId) });
		},
	});
}
