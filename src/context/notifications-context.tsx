import { createContext, useContext, useState, type ReactNode } from "react";
import type { Notification } from "@/types";

const initialNotifications: Notification[] = [
	{
		id: "n1",
		title: "SLA Breach Warning",
		description: "Ticket TK-1022 is approaching its SLA deadline in 30 minutes.",
		time: "5 min ago",
		read: false,
		type: "sla",
	},
	{
		id: "n2",
		title: "New Ticket Assigned",
		description: "TK-1024 has been assigned to you by the system auto-router.",
		time: "12 min ago",
		read: false,
		type: "assign",
	},
	{
		id: "n3",
		title: "Ticket Resolved",
		description: "TK-1020 has been marked as resolved by Carlos Mendez.",
		time: "1 hour ago",
		read: false,
		type: "resolved",
	},
	{
		id: "n4",
		title: "Customer Reply",
		description: "john.smith@contoso.com replied to TK-1024.",
		time: "2 hours ago",
		read: true,
		type: "ticket",
	},
	{
		id: "n5",
		title: "New Team Member",
		description: "Sofia Vargas has been added to the Email Support team.",
		time: "3 hours ago",
		read: true,
		type: "assign",
	},
];

interface NotificationsContextValue {
	notifications: Notification[];
	unreadCount: number;
	markAllRead: () => void;
	dismissNotification: (id: string) => void;
	markAsRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

	const unreadCount = notifications.filter((n) => !n.read).length;

	function markAllRead() {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
	}

	function dismissNotification(id: string) {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	}

	function markAsRead(id: string) {
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
	}

	return (
		<NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, dismissNotification, markAsRead }}>
			{children}
		</NotificationsContext.Provider>
	);
}

export function useNotifications(): NotificationsContextValue {
	const ctx = useContext(NotificationsContext);
	if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
	return ctx;
}
