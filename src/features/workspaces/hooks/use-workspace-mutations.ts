import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUpdateWorkspace } from "../api/workspaces-api";
import { workspaceQueryKeys } from "./use-workspace-queries";

/**
 * The only workspace mutation Pulse has.
 *
 * Creating and deleting a workspace are control-plane actions — they span four
 * products and move money — so they happen on ondesk and arrive here by mirror.
 * The hooks for both lived in this file and called endpoints that answered 405.
 */
export function useUpdateWorkspaceMutation(slug: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { workspace_prompt?: string }) => apiUpdateWorkspace(slug, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(slug) });
		},
	});
}
