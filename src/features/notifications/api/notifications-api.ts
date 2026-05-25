export type NotificationType = "ticket" | "assign" | "sla" | "resolved" | "message";

export interface Notification {
	id: string;
	user_id: string;
	workspace_id: string;
	type: NotificationType;
	title: string;
	description: string;
	resource_id: string | null;
	actor_id: string | null;
	read: boolean;
	created_at: number;
}

const BASE = "/api/notifications";

export type NotificationFilter = "all" | "unread";

export interface NotificationListPage {
	notifications: Notification[];
	total: number;
	page: number;
	page_size: number;
}

export interface NotificationCounts {
	total: number;
	unread: number;
}

export async function apiGetNotifications(
	workspaceId: string,
	filter: NotificationFilter = "all",
	pagination: { page: number; pageSize: number } = { page: 1, pageSize: 25 },
): Promise<NotificationListPage> {
	const params = new URLSearchParams({ workspace_id: workspaceId });
	if (filter !== "all") params.set("filter", filter);
	params.set("page", String(pagination.page));
	params.set("page_size", String(pagination.pageSize));

	const res = await fetch(`${BASE}?${params}`, { credentials: "include" });
	if (!res.ok) throw new Error((await res.json() as { error: string }).error);
	return (await res.json()) as NotificationListPage;
}

export async function apiGetRecentNotifications(
	workspaceId: string,
	limit = 10,
): Promise<Notification[]> {
	const params = new URLSearchParams({ workspace_id: workspaceId, recent: "1", limit: String(limit) });
	const res = await fetch(`${BASE}?${params}`, { credentials: "include" });
	if (!res.ok) throw new Error((await res.json() as { error: string }).error);
	const data = (await res.json()) as { notifications: Notification[] };
	return data.notifications;
}

export async function apiGetNotificationCounts(workspaceId: string): Promise<NotificationCounts> {
	const res = await fetch(`${BASE}/counts?workspace_id=${workspaceId}`, { credentials: "include" });
	if (!res.ok) throw new Error((await res.json() as { error: string }).error);
	const data = (await res.json()) as { counts: NotificationCounts };
	return data.counts;
}

export async function apiMarkNotificationRead(id: string, workspaceId: string): Promise<void> {
	const res = await fetch(`${BASE}/${id}?workspace_id=${workspaceId}`, {
		method: "PATCH",
		credentials: "include",
	});
	if (!res.ok) throw new Error((await res.json() as { error: string }).error);
}

export async function apiMarkAllNotificationsRead(workspaceId: string): Promise<void> {
	const res = await fetch(`${BASE}?workspace_id=${workspaceId}&action=read-all`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) throw new Error((await res.json() as { error: string }).error);
}

export async function apiDismissNotification(id: string, workspaceId: string): Promise<void> {
	const res = await fetch(`${BASE}/${id}?workspace_id=${workspaceId}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) throw new Error((await res.json() as { error: string }).error);
}
