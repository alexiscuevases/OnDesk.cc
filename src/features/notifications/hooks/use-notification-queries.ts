import { useQuery } from "@tanstack/react-query";
import { apiGetNotifications } from "../api/notifications-api";

export const notificationQueryKeys = {
	all: (workspaceId: string) => ["notifications", workspaceId] as const,
};

export function useNotificationsQuery(workspaceId: string) {
	return useQuery({
		queryKey: notificationQueryKeys.all(workspaceId),
		queryFn: () => apiGetNotifications(workspaceId),
		staleTime: 1000 * 30, // 30 seconds
		refetchInterval: 1000 * 60, // poll every 60 seconds
	});
}
