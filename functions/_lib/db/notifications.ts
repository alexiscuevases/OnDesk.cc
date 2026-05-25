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

export type NotificationFilter = "all" | "unread";

export async function findNotificationsByUser(
	db: D1Database,
	userId: string,
	workspaceId: string,
	filter: NotificationFilter = "all",
	pagination: { limit: number; offset: number } = { limit: 25, offset: 0 },
): Promise<{ notifications: PublicNotification[]; total: number }> {
	const conditions = ["user_id = ?", "workspace_id = ?"];
	const values: (string | number)[] = [userId, workspaceId];
	if (filter === "unread") {
		conditions.push("read = 0");
	}
	const whereClause = conditions.join(" AND ");

	const countResult = await db
		.prepare(`SELECT COUNT(*) AS total FROM notifications WHERE ${whereClause}`)
		.bind(...values)
		.first<{ total: number }>();
	const total = countResult?.total ?? 0;

	const result = await db
		.prepare(
			`SELECT * FROM notifications
       WHERE ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
		)
		.bind(...values, pagination.limit, pagination.offset)
		.all<NotificationRow>();
	const notifications = (result.results ?? []).map(rowToPublicNotification);
	return { notifications, total };
}

export async function findRecentNotifications(
	db: D1Database,
	userId: string,
	workspaceId: string,
	limit = 10,
): Promise<PublicNotification[]> {
	const result = await db
		.prepare(
			`SELECT * FROM notifications
       WHERE user_id = ? AND workspace_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
		)
		.bind(userId, workspaceId, limit)
		.all<NotificationRow>();
	return (result.results ?? []).map(rowToPublicNotification);
}

export async function countNotifications(
	db: D1Database,
	userId: string,
	workspaceId: string,
): Promise<{ total: number; unread: number }> {
	const row = await db
		.prepare(
			`SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN read = 0 THEN 1 ELSE 0 END) AS unread
       FROM notifications
       WHERE user_id = ? AND workspace_id = ?`,
		)
		.bind(userId, workspaceId)
		.first<{ total: number; unread: number | null }>();
	return { total: row?.total ?? 0, unread: row?.unread ?? 0 };
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
