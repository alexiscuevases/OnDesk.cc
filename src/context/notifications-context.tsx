import { createContext, useContext, type ReactNode } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { useNotificationsQuery } from "@/features/notifications/hooks/use-notification-queries";
import {
	useMarkNotificationRead,
	useMarkAllNotificationsRead,
	useDismissNotification,
} from "@/features/notifications/hooks/use-notification-mutations";
import type { Notification } from "@/features/notifications/api/notifications-api";

interface NotificationsContextValue {
	notifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
	markAllRead: () => void;
	dismissNotification: (id: string) => void;
	markAsRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
	const { workspace } = useWorkspace();
	const workspaceId = workspace.id;

	const { data: notifications = [], isLoading } = useNotificationsQuery(workspaceId);
	const markReadMutation = useMarkNotificationRead(workspaceId);
	const markAllReadMutation = useMarkAllNotificationsRead(workspaceId);
	const dismissMutation = useDismissNotification(workspaceId);

	const unreadCount = notifications.filter((n) => !n.read).length;

	function markAsRead(id: string) {
		markReadMutation.mutate(id);
	}

	function markAllRead() {
		markAllReadMutation.mutate();
	}

	function dismissNotification(id: string) {
		dismissMutation.mutate(id);
	}

	return (
		<NotificationsContext.Provider
			value={{ notifications, unreadCount, isLoading, markAllRead, dismissNotification, markAsRead }}>
			{children}
		</NotificationsContext.Provider>
	);
}

export function useNotifications(): NotificationsContextValue {
	const ctx = useContext(NotificationsContext);
	if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
	return ctx;
}
