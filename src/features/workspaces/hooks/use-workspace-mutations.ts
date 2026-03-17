import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { apiCreateWorkspace, apiUpdateWorkspace, apiDeleteWorkspace } from "../api/workspaces-api";
import { workspaceQueryKeys } from "./use-workspace-queries";
import type { CreateWorkspaceInput } from "../api/workspaces-api";

export function useCreateWorkspaceMutation() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (input: CreateWorkspaceInput) => apiCreateWorkspace(input),
		onSuccess: (workspace) => {
			queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all });
			navigate({ to: "/w/$slug/overview", params: { slug: workspace.slug } });
		},
	});
}

export function useUpdateWorkspaceMutation(slug: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { name?: string; description?: string; logo_url?: string; workspace_prompt?: string }) =>
			apiUpdateWorkspace(slug, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(slug) });
		},
	});
}

export function useDeleteWorkspaceMutation() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (slug: string) => apiDeleteWorkspace(slug),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all });
			navigate({ to: "/workspaces" });
		},
	});
}
