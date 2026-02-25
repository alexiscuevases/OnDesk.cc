import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	apiMarkNotificationRead,
	apiMarkAllNotificationsRead,
	apiDismissNotification,
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
