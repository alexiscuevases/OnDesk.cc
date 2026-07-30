import type {
	NotificationRow,
	PublicNotification,
	NotificationType,
	NotificationPreferences,
	NotificationPreferencesRow,
} from "../types";
import { DEFAULT_NOTIFICATION_PREFERENCES, NOTIFICATION_PREF_KEYS } from "../types";

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

/**
 * Bulk insert for fan-out. Unlike {@link createNotification} this skips reading
 * the rows back, so a workspace-wide notification costs one batch instead of two
 * queries per recipient.
 */
export async function createNotifications(
	db: D1Database,
	rows: {
		user_id: string;
		workspace_id: string;
		type: NotificationType;
		title: string;
		description: string;
		resource_id?: string;
		actor_id?: string;
	}[],
): Promise<void> {
	if (rows.length === 0) return;
	const stmt = db.prepare(
		`INSERT INTO notifications (id, user_id, workspace_id, type, title, description, resource_id, actor_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
	);
	await db.batch(
		rows.map((r) =>
			stmt.bind(
				crypto.randomUUID(),
				r.user_id,
				r.workspace_id,
				r.type,
				r.title,
				r.description,
				r.resource_id ?? null,
				r.actor_id ?? null,
			),
		),
	);
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

// ─── Email notification preferences ──────────────────────────────────────────

const PREF_COLUMNS = ["email_enabled", ...NOTIFICATION_PREF_KEYS] as const;

/** Nullable columns from a LEFT JOIN — null means "no row, use defaults". */
type PrefFlags = Partial<Record<(typeof PREF_COLUMNS)[number], number | null>>;

function rowToPreferences(row: PrefFlags | null): NotificationPreferences {
	if (!row) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
	const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES };
	for (const key of PREF_COLUMNS) {
		const value = row[key];
		if (value !== null && value !== undefined) prefs[key] = value === 1;
	}
	return prefs;
}

export async function findNotificationPreferences(
	db: D1Database,
	userId: string,
	workspaceId: string,
): Promise<NotificationPreferences> {
	const row = await db
		.prepare("SELECT * FROM notification_preferences WHERE user_id = ? AND workspace_id = ? LIMIT 1")
		.bind(userId, workspaceId)
		.first<NotificationPreferencesRow>();
	return rowToPreferences(row);
}

export async function upsertNotificationPreferences(
	db: D1Database,
	userId: string,
	workspaceId: string,
	updates: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
	const current = await findNotificationPreferences(db, userId, workspaceId);
	const merged: NotificationPreferences = { ...current, ...updates };
	const values = PREF_COLUMNS.map((key) => (merged[key] ? 1 : 0));

	await db
		.prepare(
			`INSERT INTO notification_preferences (id, user_id, workspace_id, ${PREF_COLUMNS.join(", ")})
       VALUES (?, ?, ?, ${PREF_COLUMNS.map(() => "?").join(", ")})
       ON CONFLICT(user_id, workspace_id) DO UPDATE SET
         ${PREF_COLUMNS.map((key) => `${key} = excluded.${key}`).join(", ")},
         updated_at = unixepoch()`,
		)
		.bind(crypto.randomUUID(), userId, workspaceId, ...values)
		.run();

	return merged;
}

export interface NotificationRecipientProfile {
	id: string;
	name: string;
	email: string;
	preferences: NotificationPreferences;
}

/**
 * Loads name/email plus effective preferences for a batch of users in one query.
 * Users without a preferences row fall back to {@link DEFAULT_NOTIFICATION_PREFERENCES}.
 *
 * Only workspace members are returned. Callers use the returned keys to filter
 * their recipient list, so an id that isn't a member of the workspace — a forged
 * `data-mention-id`, a user removed since the ticket was created — is dropped
 * rather than notified or emailed.
 */
export async function findRecipientProfiles(
	db: D1Database,
	workspaceId: string,
	userIds: string[],
): Promise<Map<string, NotificationRecipientProfile>> {
	const profiles = new Map<string, NotificationRecipientProfile>();
	if (userIds.length === 0) return profiles;

	const placeholders = userIds.map(() => "?").join(", ");
	const prefSelect = PREF_COLUMNS.map((key) => `p.${key}`).join(", ");
	const result = await db
		.prepare(
			`SELECT u.id, u.name, u.email, ${prefSelect}
       FROM users u
       JOIN workspace_members wm ON wm.user_id = u.id AND wm.workspace_id = ?
       LEFT JOIN notification_preferences p ON p.user_id = u.id AND p.workspace_id = ?
       WHERE u.id IN (${placeholders})`,
		)
		.bind(workspaceId, workspaceId, ...userIds)
		.all<{ id: string; name: string; email: string } & PrefFlags>();

	for (const row of result.results ?? []) {
		profiles.set(row.id, {
			id: row.id,
			name: row.name,
			email: row.email,
			preferences: rowToPreferences(row),
		});
	}
	return profiles;
}

/** Team members of every team the ticket's team belongs to, plus the team leader. */
export async function findTeamAudienceIds(db: D1Database, teamId: string): Promise<string[]> {
	const result = await db
		.prepare(
			`SELECT user_id FROM team_members WHERE team_id = ?
       UNION
       SELECT leader_id AS user_id FROM teams WHERE id = ? AND leader_id IS NOT NULL`,
		)
		.bind(teamId, teamId)
		.all<{ user_id: string }>();
	return (result.results ?? []).map((r) => r.user_id);
}
