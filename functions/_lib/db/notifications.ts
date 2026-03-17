import type { NotificationRow, PublicNotification, NotificationType } from "../types";

// ─── Notifications ────────────────────────────────────────────────────────────

function rowToPublicNotification(row: NotificationRow): PublicNotification {
	return {
		id: row.id,
		user_id: row.user_id,
		workspace_id: row.workspace_id,
		type: row.type,
		title: row.title,
		description: row.description,
		resource_id: row.resource_id,
		actor_id: row.actor_id,
		read: row.read === 1,
		created_at: row.created_at,
	};
}

export async function createNotification(
	db: D1Database,
	data: {
		user_id: string;
		workspace_id: string;
		type: NotificationType;
		title: string;
		description: string;
		resource_id?: string;
		actor_id?: string;
	},
): Promise<PublicNotification> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO notifications (id, user_id, workspace_id, type, title, description, resource_id, actor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(id, data.user_id, data.workspace_id, data.type, data.title, data.description, data.resource_id ?? null, data.actor_id ?? null)
		.run();
	const row = await db.prepare("SELECT * FROM notifications WHERE id = ? LIMIT 1").bind(id).first<NotificationRow>();
	return rowToPublicNotification(row!);
}

export async function findNotificationsByUser(db: D1Database, userId: string, workspaceId: string, limit = 50): Promise<PublicNotification[]> {
	const result = await db
		.prepare(
			`SELECT * FROM notifications
       WHERE user_id = ? AND workspace_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
		)
		.bind(userId, workspaceId, limit)
		.all<NotificationRow>();
	return (result.results ?? []).map(rowToPublicNotification);
}

export async function markNotificationRead(db: D1Database, id: string, userId: string): Promise<boolean> {
	const result = await db.prepare("UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?").bind(id, userId).run();
	return (result.meta?.changes ?? 0) > 0;
}

export async function markAllNotificationsRead(db: D1Database, userId: string, workspaceId: string): Promise<void> {
	await db.prepare("UPDATE notifications SET read = 1 WHERE user_id = ? AND workspace_id = ? AND read = 0").bind(userId, workspaceId).run();
}

export async function deleteNotification(db: D1Database, id: string, userId: string): Promise<boolean> {
	const result = await db.prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?").bind(id, userId).run();
	return (result.meta?.changes ?? 0) > 0;
}
