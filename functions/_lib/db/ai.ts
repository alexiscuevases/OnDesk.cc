import type {
	AiAgentRow,
	PublicAiAgent,
	AiAgentAction,
	AiAgentMailboxRow,
	PublicAiAgentMailbox,
	AiTicketStateRow,
	PublicAiTicketState,
	AiActionLogRow,
	PublicAiActionLog,
	AiMemoryRow,
	PublicAiMemory,
} from "../types";

// ─── AI Agents ────────────────────────────────────────────────────────────────

function rowToPublicAiAgent(row: AiAgentRow): PublicAiAgent {
	return {
		id: row.id,
		workspace_id: row.workspace_id,
		name: row.name,
		description: row.description,
		status: row.status,
		system_prompt: row.system_prompt,
		confidence_threshold: row.confidence_threshold,
		max_auto_replies: row.max_auto_replies,
		created_by: row.created_by,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

export async function findAiAgentsByWorkspace(db: D1Database, workspaceId: string): Promise<PublicAiAgent[]> {
	const result = await db.prepare("SELECT * FROM ai_agents WHERE workspace_id = ? ORDER BY created_at DESC").bind(workspaceId).all<AiAgentRow>();
	return (result.results ?? []).map(rowToPublicAiAgent);
}

export async function findAiAgentById(db: D1Database, agentId: string): Promise<AiAgentRow | null> {
	const result = await db.prepare("SELECT * FROM ai_agents WHERE id = ? LIMIT 1").bind(agentId).first<AiAgentRow>();
	return result ?? null;
}

export async function findActiveAgentForMailbox(db: D1Database, mailboxIntegrationId: string): Promise<AiAgentRow | null> {
	const result = await db
		.prepare(
			`SELECT a.* FROM ai_agents a
       JOIN ai_agent_mailboxes aam ON aam.ai_agent_id = a.id
       WHERE aam.mailbox_integration_id = ?
         AND aam.enabled = 1
         AND a.status = 'active'
       LIMIT 1`,
		)
		.bind(mailboxIntegrationId)
		.first<AiAgentRow>();
	return result ?? null;
}

export async function createAiAgent(
	db: D1Database,
	workspaceId: string,
	userId: string,
	data: {
		name: string;
		description?: string;
		system_prompt?: string;
		confidence_threshold?: number;
		max_auto_replies?: number;
	},
): Promise<PublicAiAgent> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO ai_agents (id, workspace_id, name, description, system_prompt, confidence_threshold, max_auto_replies, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			workspaceId,
			data.name,
			data.description ?? null,
			data.system_prompt ?? null,
			data.confidence_threshold ?? 0.5,
			data.max_auto_replies ?? 0,
			userId,
		)
		.run();
	const row = await findAiAgentById(db, id);
	return rowToPublicAiAgent(row!);
}

export async function updateAiAgent(
	db: D1Database,
	agentId: string,
	data: Partial<Pick<AiAgentRow, "name" | "description" | "status" | "system_prompt" | "confidence_threshold" | "max_auto_replies">>,
): Promise<void> {
	const fields: string[] = [];
	const values: unknown[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.status !== undefined) {
		fields.push("status = ?");
		values.push(data.status);
	}
	if (data.system_prompt !== undefined) {
		fields.push("system_prompt = ?");
		values.push(data.system_prompt);
	}
	if (data.confidence_threshold !== undefined) {
		fields.push("confidence_threshold = ?");
		values.push(data.confidence_threshold);
	}
	if (data.max_auto_replies !== undefined) {
		fields.push("max_auto_replies = ?");
		values.push(data.max_auto_replies);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(agentId);
	await db
		.prepare(`UPDATE ai_agents SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteAiAgent(db: D1Database, agentId: string): Promise<void> {
	await db.prepare("DELETE FROM ai_agents WHERE id = ?").bind(agentId).run();
}

// ─── AI Agent Mailbox Assignments ─────────────────────────────────────────────

export async function findMailboxesForAgent(db: D1Database, agentId: string): Promise<PublicAiAgentMailbox[]> {
	const result = await db
		.prepare(
			`SELECT aam.*, mi.email AS mailbox_email
       FROM ai_agent_mailboxes aam
       JOIN mailbox_integrations mi ON mi.id = aam.mailbox_integration_id
       WHERE aam.ai_agent_id = ?
       ORDER BY aam.created_at ASC`,
		)
		.bind(agentId)
		.all<AiAgentMailboxRow & { mailbox_email: string }>();
	return (result.results ?? []).map((r) => ({
		id: r.id,
		ai_agent_id: r.ai_agent_id,
		mailbox_integration_id: r.mailbox_integration_id,
		mailbox_email: r.mailbox_email,
		enabled: r.enabled === 1,
		created_at: r.created_at,
	}));
}

export async function assignMailboxToAgent(db: D1Database, agentId: string, mailboxIntegrationId: string): Promise<void> {
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT OR IGNORE INTO ai_agent_mailboxes (id, ai_agent_id, mailbox_integration_id) VALUES (?, ?, ?)")
		.bind(id, agentId, mailboxIntegrationId)
		.run();
}

export async function unassignMailboxFromAgent(db: D1Database, agentId: string, mailboxIntegrationId: string): Promise<void> {
	await db.prepare("DELETE FROM ai_agent_mailboxes WHERE ai_agent_id = ? AND mailbox_integration_id = ?").bind(agentId, mailboxIntegrationId).run();
}

export async function setAgentMailboxEnabled(db: D1Database, agentId: string, mailboxIntegrationId: string, enabled: boolean): Promise<void> {
	await db
		.prepare("UPDATE ai_agent_mailboxes SET enabled = ? WHERE ai_agent_id = ? AND mailbox_integration_id = ?")
		.bind(enabled ? 1 : 0, agentId, mailboxIntegrationId)
		.run();
}

// ─── AI Ticket State ──────────────────────────────────────────────────────────

function rowToPublicAiTicketState(row: AiTicketStateRow): PublicAiTicketState {
	return {
		id: row.id,
		ticket_id: row.ticket_id,
		ai_agent_id: row.ai_agent_id,
		reply_count: row.reply_count,
		escalated: row.escalated === 1,
		escalated_at: row.escalated_at,
		escalation_note: row.escalation_note,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

export async function findAiTicketState(db: D1Database, ticketId: string): Promise<PublicAiTicketState | null> {
	const result = await db.prepare("SELECT * FROM ai_ticket_state WHERE ticket_id = ? LIMIT 1").bind(ticketId).first<AiTicketStateRow>();
	return result ? rowToPublicAiTicketState(result) : null;
}

export async function createAiTicketState(db: D1Database, ticketId: string, agentId: string): Promise<PublicAiTicketState> {
	const id = crypto.randomUUID();
	await db.prepare("INSERT INTO ai_ticket_state (id, ticket_id, ai_agent_id) VALUES (?, ?, ?)").bind(id, ticketId, agentId).run();
	const row = await db.prepare("SELECT * FROM ai_ticket_state WHERE id = ? LIMIT 1").bind(id).first<AiTicketStateRow>();
	return rowToPublicAiTicketState(row!);
}

export async function incrementAiReplyCount(db: D1Database, ticketId: string): Promise<void> {
	await db.prepare("UPDATE ai_ticket_state SET reply_count = reply_count + 1, updated_at = unixepoch() WHERE ticket_id = ?").bind(ticketId).run();
}

export async function escalateAiTicket(db: D1Database, ticketId: string, note: string): Promise<void> {
	await db
		.prepare("UPDATE ai_ticket_state SET escalated = 1, escalated_at = unixepoch(), escalation_note = ?, updated_at = unixepoch() WHERE ticket_id = ?")
		.bind(note, ticketId)
		.run();
}

export async function resumeAiTicket(db: D1Database, ticketId: string): Promise<void> {
	await db
		.prepare("UPDATE ai_ticket_state SET escalated = 0, escalated_at = NULL, escalation_note = NULL, updated_at = unixepoch() WHERE ticket_id = ?")
		.bind(ticketId)
		.run();
}

// ─── AI Action Logs ───────────────────────────────────────────────────────────

export async function createAiActionLog(
	db: D1Database,
	data: {
		ticket_id: string;
		ai_agent_id: string;
		action: AiAgentAction;
		metadata?: Record<string, unknown>;
	},
): Promise<void> {
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO ai_action_logs (id, ticket_id, ai_agent_id, action, metadata) VALUES (?, ?, ?, ?, ?)")
		.bind(id, data.ticket_id, data.ai_agent_id, data.action, data.metadata ? JSON.stringify(data.metadata) : null)
		.run();
}

export async function findAiActionLogsByTicket(db: D1Database, ticketId: string): Promise<PublicAiActionLog[]> {
	const result = await db.prepare("SELECT * FROM ai_action_logs WHERE ticket_id = ? ORDER BY created_at DESC").bind(ticketId).all<AiActionLogRow>();
	return (result.results ?? []).map((r: AiActionLogRow) => ({
		id: r.id,
		ticket_id: r.ticket_id,
		ai_agent_id: r.ai_agent_id,
		action: r.action,
		metadata: r.metadata ? (JSON.parse(r.metadata) as Record<string, unknown>) : null,
		created_at: r.created_at,
	}));
}

// ─── AI Memories ─────────────────────────────────────────────────────────────

export async function createMemory(
	db: D1Database,
	workspaceId: string,
	content: string,
	contactId?: string | null,
	expiresAt?: number | null,
): Promise<PublicAiMemory> {
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO ai_memories (id, workspace_id, contact_id, content, expires_at) VALUES (?, ?, ?, ?, ?)")
		.bind(id, workspaceId, contactId ?? null, content, expiresAt ?? null)
		.run();
	const row = await db.prepare("SELECT * FROM ai_memories WHERE id = ? LIMIT 1").bind(id).first<AiMemoryRow>();
	return row!;
}

export async function deleteMemory(db: D1Database, memoryId: string): Promise<void> {
	await db.prepare("DELETE FROM ai_memories WHERE id = ?").bind(memoryId).run();
}

export async function findMemoryById(db: D1Database, memoryId: string): Promise<AiMemoryRow | null> {
	const row = await db.prepare("SELECT * FROM ai_memories WHERE id = ? LIMIT 1").bind(memoryId).first<AiMemoryRow>();
	return row ?? null;
}

export async function touchMemories(db: D1Database, ids: string[]): Promise<void> {
	if (ids.length === 0) return;
	const placeholders = ids.map(() => "?").join(", ");
	await db
		.prepare(`UPDATE ai_memories SET last_referenced_at = unixepoch() WHERE id IN (${placeholders})`)
		.bind(...ids)
		.run();
}

export async function findMemoriesByWorkspace(db: D1Database, workspaceId: string): Promise<PublicAiMemory[]> {
	const result = await db
		.prepare(
			"SELECT * FROM ai_memories WHERE workspace_id = ? AND contact_id IS NULL AND (expires_at IS NULL OR expires_at > unixepoch()) ORDER BY created_at DESC",
		)
		.bind(workspaceId)
		.all<AiMemoryRow>();
	return result.results ?? [];
}

export async function findMemoriesByContact(db: D1Database, workspaceId: string, contactId: string): Promise<PublicAiMemory[]> {
	const result = await db
		.prepare(
			"SELECT * FROM ai_memories WHERE workspace_id = ? AND contact_id = ? AND (expires_at IS NULL OR expires_at > unixepoch()) ORDER BY created_at DESC",
		)
		.bind(workspaceId, contactId)
		.all<AiMemoryRow>();
	return result.results ?? [];
}

export async function findMemoriesByIds(db: D1Database, ids: string[]): Promise<PublicAiMemory[]> {
	if (ids.length === 0) return [];
	const placeholders = ids.map(() => "?").join(", ");
	const result = await db
		.prepare(`SELECT * FROM ai_memories WHERE id IN (${placeholders}) AND (expires_at IS NULL OR expires_at > unixepoch())`)
		.bind(...ids)
		.all<AiMemoryRow>();
	return result.results ?? [];
}

export async function findAiActionLogsByAgent(db: D1Database, agentId: string, ticketId?: string): Promise<PublicAiActionLog[]> {
	let query = "SELECT * FROM ai_action_logs WHERE ai_agent_id = ?";
	const binds: unknown[] = [agentId];
	if (ticketId) {
		query += " AND ticket_id = ?";
		binds.push(ticketId);
	}
	query += " ORDER BY created_at DESC LIMIT 200";
	const result = await db
		.prepare(query)
		.bind(...binds)
		.all<AiActionLogRow>();
	return (result.results ?? []).map((r: AiActionLogRow) => ({
		id: r.id,
		ticket_id: r.ticket_id,
		ai_agent_id: r.ai_agent_id,
		action: r.action,
		metadata: r.metadata ? (JSON.parse(r.metadata) as Record<string, unknown>) : null,
		created_at: r.created_at,
	}));
}
