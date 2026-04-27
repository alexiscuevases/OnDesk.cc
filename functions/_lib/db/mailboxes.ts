import type { MailboxIntegrationRow, PublicMailboxIntegration } from "../types";

// ─── Mailbox Integrations ─────────────────────────────────────────────────────

export async function createMailboxIntegration(
	db: D1Database,
	data: {
		workspace_id: string;
		email: string;
		provider: "microsoft" | "google";
		ms_user_id: string;
		access_token: string;
		refresh_token: string;
		token_expires_at: number;
		client_state_secret: string;
	},
): Promise<MailboxIntegrationRow> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO mailbox_integrations
         (id, workspace_id, email, provider, ms_user_id, access_token, refresh_token, token_expires_at, client_state_secret)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			data.workspace_id,
			data.email.toLowerCase(),
			data.provider,
			data.ms_user_id,
			data.access_token,
			data.refresh_token,
			data.token_expires_at,
			data.client_state_secret,
		)
		.run();
	return (await findMailboxIntegrationById(db, id))!;
}

export async function findMailboxIntegrationById(db: D1Database, id: string): Promise<MailboxIntegrationRow | null> {
	const result = await db.prepare("SELECT * FROM mailbox_integrations WHERE id = ? LIMIT 1").bind(id).first<MailboxIntegrationRow>();
	return result ?? null;
}

export async function findMailboxIntegrationByEmail(db: D1Database, workspaceId: string, email: string): Promise<MailboxIntegrationRow | null> {
	const result = await db
		.prepare("SELECT * FROM mailbox_integrations WHERE workspace_id = ? AND email = ? LIMIT 1")
		.bind(workspaceId, email.toLowerCase())
		.first<MailboxIntegrationRow>();
	return result ?? null;
}

export async function findMailboxIntegrationBySubscriptionId(db: D1Database, subscriptionId: string): Promise<MailboxIntegrationRow | null> {
	const result = await db.prepare("SELECT * FROM mailbox_integrations WHERE subscription_id = ? LIMIT 1").bind(subscriptionId).first<MailboxIntegrationRow>();
	return result ?? null;
}

// Used by Gmail webhook: look up all mailboxes matching an email address (any workspace)
export async function findMailboxIntegrationsByEmailOnly(db: D1Database, email: string): Promise<MailboxIntegrationRow[]> {
	const result = await db
		.prepare("SELECT * FROM mailbox_integrations WHERE email = ? AND provider = 'google'")
		.bind(email.toLowerCase())
		.all<MailboxIntegrationRow>();
	return result.results ?? [];
}

export async function findMailboxIntegrationsByWorkspace(db: D1Database, workspaceId: string): Promise<PublicMailboxIntegration[]> {
	const result = await db
		.prepare(
			`SELECT id, workspace_id, email, provider, ms_user_id, subscription_id, subscription_expires_at, last_history_id, created_at
       FROM mailbox_integrations WHERE workspace_id = ? ORDER BY created_at ASC`,
		)
		.bind(workspaceId)
		.all<PublicMailboxIntegration>();
	return result.results ?? [];
}

export async function findFirstMailboxByWorkspace(db: D1Database, workspaceId: string): Promise<MailboxIntegrationRow | null> {
	const result = await db
		.prepare("SELECT * FROM mailbox_integrations WHERE workspace_id = ? ORDER BY created_at ASC LIMIT 1")
		.bind(workspaceId)
		.first<MailboxIntegrationRow>();
	return result ?? null;
}

export async function findMailboxByTicketId(db: D1Database, ticketId: string): Promise<MailboxIntegrationRow | null> {
	const result = await db
		.prepare(
			`SELECT mi.* FROM mailbox_integrations mi
       JOIN email_tickets et ON et.mailbox_integration_id = mi.id
       WHERE et.ticket_id = ?
       LIMIT 1`,
		)
		.bind(ticketId)
		.first<MailboxIntegrationRow>();
	return result ?? null;
}

export async function updateMailboxTokens(
	db: D1Database,
	id: string,
	data: { access_token: string; refresh_token: string; token_expires_at: number },
): Promise<void> {
	await db
		.prepare("UPDATE mailbox_integrations SET access_token = ?, refresh_token = ?, token_expires_at = ? WHERE id = ?")
		.bind(data.access_token, data.refresh_token, data.token_expires_at, id)
		.run();
}

export async function updateMailboxSubscription(db: D1Database, id: string, data: { subscription_id: string; subscription_expires_at: number }): Promise<void> {
	await db
		.prepare("UPDATE mailbox_integrations SET subscription_id = ?, subscription_expires_at = ? WHERE id = ?")
		.bind(data.subscription_id, data.subscription_expires_at, id)
		.run();
}

export async function updateMailboxLastHistoryId(db: D1Database, id: string, historyId: string): Promise<void> {
	await db.prepare("UPDATE mailbox_integrations SET last_history_id = ? WHERE id = ?").bind(String(Math.floor(Number(historyId))), id).run();
}

export async function deleteMailboxIntegration(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM mailbox_integrations WHERE id = ?").bind(id).run();
}

export async function markEmailAsTicket(
	db: D1Database,
	data: {
		mailbox_integration_id: string;
		internet_message_id: string;
		ticket_id: string;
	},
): Promise<void> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT OR IGNORE INTO email_tickets (id, mailbox_integration_id, internet_message_id, ticket_id)
       VALUES (?, ?, ?, ?)`,
		)
		.bind(id, data.mailbox_integration_id, data.internet_message_id, data.ticket_id)
		.run();
}

export async function findEmailTicketByMessageId(
	db: D1Database,
	mailboxIntegrationId: string,
	internetMessageId: string,
): Promise<{ ticket_id: string } | null> {
	const result = await db
		.prepare("SELECT ticket_id FROM email_tickets WHERE mailbox_integration_id = ? AND internet_message_id = ? LIMIT 1")
		.bind(mailboxIntegrationId, internetMessageId)
		.first<{ ticket_id: string }>();
	return result ?? null;
}

export async function findWorkspaceMemberIds(db: D1Database, workspaceId: string): Promise<string[]> {
	const result = await db.prepare("SELECT user_id FROM workspace_members WHERE workspace_id = ?").bind(workspaceId).all<{ user_id: string }>();
	return (result.results ?? []).map((r) => r.user_id);
}
