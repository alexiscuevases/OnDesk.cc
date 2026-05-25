import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
	apiGetNotifications,
	apiGetRecentNotifications,
	apiGetNotificationCounts,
	type NotificationFilter,
} from "../api/notifications-api";

export const notificationQueryKeys = {
	all: (workspaceId: string) => ["notifications", workspaceId] as const,
	list: (workspaceId: string, filter: NotificationFilter, pagination: { page: number; pageSize: number }) =>
		["notifications", workspaceId, "list", filter, pagination] as const,
	recent: (workspaceId: string, limit: number) =>
		["notifications", workspaceId, "recent", limit] as const,
	counts: (workspaceId: string) => ["notifications", workspaceId, "counts"] as const,
};

export function useNotificationsQuery(
	workspaceId: string,
	filter: NotificationFilter = "all",
	pagination: { page: number; pageSize: number } = { page: 1, pageSize: 25 },
) {
	return useQuery({
		queryKey: notificationQueryKeys.list(workspaceId, filter, pagination),
		queryFn: () => apiGetNotifications(workspaceId, filter, pagination),
		staleTime: 1000 * 30,
		refetchInterval: 1000 * 60,
		placeholderData: keepPreviousData,
	});
}

export function useRecentNotificationsQuery(workspaceId: string, limit = 10) {
	return useQuery({
		queryKey: notificationQueryKeys.recent(workspaceId, limit),
		queryFn: () => apiGetRecentNotifications(workspaceId, limit),
		staleTime: 1000 * 30,
		refetchInterval: 1000 * 60,
	});
}

export function useNotificationCountsQuery(workspaceId: string) {
	return useQuery({
		queryKey: notificationQueryKeys.counts(workspaceId),
		queryFn: () => apiGetNotificationCounts(workspaceId),
		staleTime: 1000 * 30,
		refetchInterval: 1000 * 60,
	});
}
