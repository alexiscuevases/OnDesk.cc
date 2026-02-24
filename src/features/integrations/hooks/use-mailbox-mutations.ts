import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetOAuthUrl, apiDisconnectMailbox } from "../api/integrations-api";
import { mailboxQueryKeys } from "./use-mailbox-queries";

export function useConnectMailboxMutation(workspaceId: string, slug: string) {
	return useMutation({
		mutationFn: () => apiGetOAuthUrl(workspaceId, slug),
		onSuccess: ({ url }) => {
			window.location.href = url;
		},
	});
}

export function useDisconnectMailboxMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (mailboxId: string) => apiDisconnectMailbox(mailboxId, workspaceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: mailboxQueryKeys.all(workspaceId) });
		},
	});
}
