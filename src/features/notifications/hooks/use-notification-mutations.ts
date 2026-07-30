import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	apiMarkNotificationRead,
	apiMarkAllNotificationsRead,
	apiDismissNotification,
	apiUpdateNotificationPreferences,
	type NotificationPreferences,
} from "../api/notifications-api";
import { notificationQueryKeys } from "./use-notification-queries";

export function useMarkNotificationRead(workspaceId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiMarkNotificationRead(id, workspaceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all(workspaceId) });
		},
	});
}

export function useMarkAllNotificationsRead(workspaceId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => apiMarkAllNotificationsRead(workspaceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all(workspaceId) });
		},
	});
}

export function useDismissNotification(workspaceId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiDismissNotification(id, workspaceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all(workspaceId) });
		},
	});
}

/**
 * Toggles email preferences with an optimistic update so the switch flips
 * instantly, rolling back if the request fails.
 */
export function useUpdateNotificationPreferences(workspaceId: string) {
	const queryClient = useQueryClient();
	const key = notificationQueryKeys.preferences(workspaceId);

	return useMutation({
		mutationFn: (updates: Partial<NotificationPreferences>) => apiUpdateNotificationPreferences(workspaceId, updates),
		onMutate: async (updates) => {
			await queryClient.cancelQueries({ queryKey: key });
			const previous = queryClient.getQueryData<NotificationPreferences>(key);
			if (previous) queryClient.setQueryData<NotificationPreferences>(key, { ...previous, ...updates });
			return { previous };
		},
		onError: (_err, _updates, context) => {
			if (context?.previous) queryClient.setQueryData(key, context.previous);
		},
		onSuccess: (preferences) => {
			queryClient.setQueryData(key, preferences);
		},
	});
}
