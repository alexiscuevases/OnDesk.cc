import type { Env, NotificationType, NotificationPrefKey, TicketRow, PublicTicket } from "./types";
import {
	createNotifications,
	findRecipientProfiles,
	findTeamAudienceIds,
	findWorkspaceMemberIds,
	findWorkspaceById,
} from "./db";
import type { NotificationRecipientProfile } from "./db/notifications";
import { sendEmail, emailConfigured, notificationEmail, excerpt } from "./email";
import type { NotificationEmailInput } from "./email";

/**
 * Notification dispatch: writes the in-app notification and, when the recipient
 * has email enabled for that event, sends a matching email.
 *
 * Every recipient carries the preference key that justifies the delivery, so a
 * single event can reach the assignee under `reply_on_my_ticket` and their team
 * under `reply_on_team_ticket` in one pass.
 */

export interface NotifyRecipient {
	userId: string;
	pref: NotificationPrefKey;
}

type AnyTicket = TicketRow | PublicTicket;

// ─── Audience resolution ─────────────────────────────────────────────────────

export interface TicketAudienceOptions {
	/** Preference key applied to the ticket assignee. */
	selfPref: NotificationPrefKey;
	/** Preference key applied to members of the ticket's team. */
	teamPref: NotificationPrefKey;
	/** Users to drop (typically the actor who caused the event). */
	exclude?: (string | null | undefined)[];
	/**
	 * When the ticket has no assignee and no team, fall back to every workspace
	 * member under `teamPref` — an unclaimed ticket is the shared inbox's problem.
	 * Defaults to true.
	 */
	workspaceFallback?: boolean;
}

/**
 * Resolves who should hear about a ticket event: the assignee (under `selfPref`)
 * plus the ticket team's members and leader (under `teamPref`). The assignee's
 * entry wins when they are also on the team, so nobody is emailed twice.
 */
export async function buildTicketAudience(
	db: D1Database,
	ticket: AnyTicket,
	opts: TicketAudienceOptions,
): Promise<NotifyRecipient[]> {
	const { selfPref, teamPref, exclude = [], workspaceFallback = true } = opts;
	const excluded = new Set(exclude.filter((id): id is string => Boolean(id)));
	const byUser = new Map<string, NotifyRecipient>();

	if (ticket.assignee_id && !excluded.has(ticket.assignee_id)) {
		byUser.set(ticket.assignee_id, { userId: ticket.assignee_id, pref: selfPref });
	}

	if (ticket.team_id) {
		const teamIds = await findTeamAudienceIds(db, ticket.team_id);
		for (const userId of teamIds) {
			if (excluded.has(userId) || byUser.has(userId)) continue;
			byUser.set(userId, { userId, pref: teamPref });
		}
	}

	if (byUser.size === 0 && !ticket.assignee_id && !ticket.team_id && workspaceFallback) {
		const memberIds = await findWorkspaceMemberIds(db, ticket.workspace_id);
		for (const userId of memberIds) {
			if (excluded.has(userId)) continue;
			byUser.set(userId, { userId, pref: teamPref });
		}
	}

	return [...byUser.values()];
}

/** Every workspace member under a single preference key. */
export async function buildWorkspaceAudience(
	db: D1Database,
	workspaceId: string,
	pref: NotificationPrefKey,
	exclude: (string | null | undefined)[] = [],
): Promise<NotifyRecipient[]> {
	const excluded = new Set(exclude.filter((id): id is string => Boolean(id)));
	const memberIds = await findWorkspaceMemberIds(db, workspaceId);
	return memberIds.filter((id) => !excluded.has(id)).map((userId) => ({ userId, pref }));
}

// ─── Dispatch ────────────────────────────────────────────────────────────────

export interface NotifyEmailOptions {
	subject: string;
	/** Headline inside the email. Falls back to the notification title. */
	heading?: string;
	/** Sentence describing the event. Falls back to the notification description. */
	body?: string;
	details?: { label: string; value: string }[];
	/** Raw message HTML — stripped and clamped into a short preview block. */
	previewHtml?: string;
	warning?: string;
	ctaLabel?: string;
	/** Ticket to deep-link to. Overridden by `path`. */
	ticketId?: string;
	/** Explicit console path, e.g. `/w/acme/notifications`. */
	path?: string;
}

export interface NotifyOptions {
	workspaceId: string;
	recipients: NotifyRecipient[];
	/** In-app notification category. */
	type: NotificationType;
	title: string;
	description: string;
	resourceId?: string;
	actorId?: string;
	/** Omit to create in-app notifications only. */
	email?: NotifyEmailOptions;
}

/**
 * Creates in-app notifications for every recipient, then emails the subset that
 * has email enabled for their preference key. Never throws — a notification
 * failure must not fail the request that triggered it.
 */
export async function notify(env: Env, opts: NotifyOptions): Promise<void> {
	const { workspaceId, recipients, type, title, description, resourceId, actorId, email } = opts;
	if (recipients.length === 0) return;

	// Resolving profiles first drops ids that aren't workspace members, which
	// both keeps the atomic batch insert below from failing on a bad foreign key
	// and stops a forged mention id from reaching a stranger's inbox.
	const profiles = await findRecipientProfiles(
		env.DB,
		workspaceId,
		recipients.map((r) => r.userId),
	);
	const valid = recipients.filter((r) => profiles.has(r.userId));
	if (valid.length === 0) return;

	try {
		await createNotifications(
			env.DB,
			valid.map((r) => ({
				user_id: r.userId,
				workspace_id: workspaceId,
				type,
				title,
				description,
				resource_id: resourceId,
				actor_id: actorId,
			})),
		);
	} catch (err) {
		// A failed bell notification must not stop the email from going out.
		console.error("notify: in-app notifications failed:", err);
	}

	if (!email) return;
	if (!emailConfigured(env)) {
		console.warn("notify: email not configured, skipping notification emails");
		return;
	}

	try {
		await sendNotificationEmails(env, { workspaceId, recipients: valid, profiles, title, description, email });
	} catch (err) {
		console.error("notify: email dispatch failed:", err);
	}
}

async function sendNotificationEmails(
	env: Env,
	args: {
		workspaceId: string;
		recipients: NotifyRecipient[];
		profiles: Map<string, NotificationRecipientProfile>;
		title: string;
		description: string;
		email: NotifyEmailOptions;
	},
): Promise<void> {
	const { workspaceId, recipients, profiles, title, description, email } = args;

	const deliverable = recipients.filter((r) => {
		const profile = profiles.get(r.userId);
		if (!profile?.email) return false;
		return profile.preferences.email_enabled && profile.preferences[r.pref];
	});
	if (deliverable.length === 0) return;

	const workspace = await findWorkspaceById(env.DB, workspaceId);
	const appUrl = (env.APP_URL ?? "").replace(/\/$/, "");
	const slug = workspace?.slug;
	const path = email.path ?? (slug ? (email.ticketId ? `/w/${slug}/tickets/${email.ticketId}` : `/w/${slug}/notifications`) : "");
	const url = `${appUrl}${path}`;
	const preferencesUrl = slug ? `${appUrl}/w/${slug}/profile` : undefined;
	const preview = email.previewHtml ? excerpt(email.previewHtml) : undefined;

	const sends = await Promise.allSettled(
		deliverable.map((r) => {
			const profile = profiles.get(r.userId)!;
			const payload: NotificationEmailInput = {
				recipientName: profile.name || profile.email,
				heading: email.heading ?? title,
				body: email.body ?? description,
				url,
				ctaLabel: email.ctaLabel,
				details: email.details,
				preview,
				warning: email.warning,
				preferencesUrl,
			};
			return sendEmail(env, {
				to: profile.email,
				subject: email.subject,
				html: notificationEmail(payload),
			});
		}),
	);

	sends.forEach((result, i) => {
		if (result.status === "rejected") {
			console.error(`notify: email to ${profiles.get(deliverable[i].userId)?.email} failed:`, result.reason);
		}
	});
}

// ─── Event helpers ───────────────────────────────────────────────────────────

/** Shared detail rows so every ticket email looks the same. */
export function ticketDetails(ticket: AnyTicket, extra: { label: string; value: string }[] = []) {
	return [
		{ label: "Ticket", value: `#${ticket.number} · ${ticket.subject}` },
		{ label: "Status", value: ticket.status },
		{ label: "Priority", value: ticket.priority },
		...extra,
	];
}
