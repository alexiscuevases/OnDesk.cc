import { useQuery } from "@tanstack/react-query";
import { apiGetWorkspaces, apiGetWorkspace } from "../api/workspaces-api";

export const workspaceQueryKeys = {
	all: ["workspaces"] as const,
	detail: (slug: string) => ["workspaces", slug] as const,
};

export function useWorkspaces() {
	return useQuery({
		queryKey: workspaceQueryKeys.all,
		queryFn: apiGetWorkspaces,
		staleTime: 1000 * 60 * 5,
	});
}

export function useWorkspace(slug: string) {
	return useQuery({
		queryKey: workspaceQueryKeys.detail(slug),
		queryFn: () => apiGetWorkspace(slug),
		staleTime: 1000 * 60 * 5,
	});
}
