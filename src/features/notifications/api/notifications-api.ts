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

export async function apiGetNotifications(workspaceId: string): Promise<Notification[]> {
	const res = await fetch(`${BASE}?workspace_id=${workspaceId}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error((await res.json() as { error: string }).error);
	const data = (await res.json()) as { notifications: Notification[] };
	return data.notifications;
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
