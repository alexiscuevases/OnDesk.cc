export type NotificationType = "ticket" | "assign" | "sla" | "resolved" | "message";

export interface NotificationRow {
	id: string;
	user_id: string;
	workspace_id: string;
	type: NotificationType;
	title: string;
	description: string;
	resource_id: string | null;
	actor_id: string | null;
	read: number;
	created_at: number;
}

export interface PublicNotification {
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
