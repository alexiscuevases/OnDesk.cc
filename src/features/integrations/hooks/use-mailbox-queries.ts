import { useQuery } from "@tanstack/react-query";
import { apiGetMailboxes } from "../api/integrations-api";

export const mailboxQueryKeys = {
	all: (workspaceId: string) => ["mailboxes", workspaceId] as const,
};

export function useMailboxes(workspaceId: string) {
	return useQuery({
		queryKey: mailboxQueryKeys.all(workspaceId),
		queryFn: () => apiGetMailboxes(workspaceId),
		staleTime: 1000 * 60,
	});
}
