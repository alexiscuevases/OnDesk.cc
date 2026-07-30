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

// ─── Email notification preferences ──────────────────────────────────────────

/** Per-event email toggles. Keys match `notification_preferences` columns. */
export type NotificationPrefKey =
	| "ticket_assigned_to_me"
	| "ticket_assigned_to_team"
	| "reply_on_my_ticket"
	| "reply_on_team_ticket"
	| "mention"
	| "escalation"
	| "sla_breach"
	| "ticket_status";

export const NOTIFICATION_PREF_KEYS: NotificationPrefKey[] = [
	"ticket_assigned_to_me",
	"ticket_assigned_to_team",
	"reply_on_my_ticket",
	"reply_on_team_ticket",
	"mention",
	"escalation",
	"sla_breach",
	"ticket_status",
];

export interface NotificationPreferencesRow {
	id: string;
	user_id: string;
	workspace_id: string;
	email_enabled: number;
	ticket_assigned_to_me: number;
	ticket_assigned_to_team: number;
	reply_on_my_ticket: number;
	reply_on_team_ticket: number;
	mention: number;
	escalation: number;
	sla_breach: number;
	ticket_status: number;
	created_at: number;
	updated_at: number;
}

export type NotificationPreferences = { email_enabled: boolean } & Record<NotificationPrefKey, boolean>;

/** Applied when a user has no `notification_preferences` row yet. */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
	email_enabled: true,
	ticket_assigned_to_me: true,
	ticket_assigned_to_team: true,
	reply_on_my_ticket: true,
	reply_on_team_ticket: true,
	mention: true,
	escalation: true,
	sla_breach: true,
	ticket_status: false,
};
