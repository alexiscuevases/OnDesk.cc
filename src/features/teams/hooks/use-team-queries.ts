import { useQuery } from "@tanstack/react-query";
import { apiGetTeams, apiGetTeam, apiGetTeamMembers } from "../api/teams-api";

export const teamQueryKeys = {
	all: (workspaceId: string) => ["teams", workspaceId] as const,
	detail: (id: string) => ["teams", id] as const,
	members: (teamId: string) => ["teams", teamId, "members"] as const,
};

export function useTeams(workspaceId: string) {
	return useQuery({
		queryKey: teamQueryKeys.all(workspaceId),
		queryFn: () => apiGetTeams(workspaceId),
		staleTime: 1000 * 60 * 5,
	});
}

export function useTeam(id: string) {
	return useQuery({
		queryKey: teamQueryKeys.detail(id),
		queryFn: () => apiGetTeam(id),
		staleTime: 1000 * 60 * 5,
	});
}

export function useTeamMembers(teamId: string) {
	return useQuery({
		queryKey: teamQueryKeys.members(teamId),
		queryFn: () => apiGetTeamMembers(teamId),
		staleTime: 1000 * 60 * 5,
	});
}
