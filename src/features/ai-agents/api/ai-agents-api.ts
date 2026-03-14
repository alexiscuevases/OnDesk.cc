const BASE = "/api/ai-agents";

export type AiAgentStatus = "active" | "inactive";
export type AiAgentAction = "auto_reply" | "escalate" | "status_change" | "note_added" | "routed";

export interface AiAgent {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  status: AiAgentStatus;
  system_prompt: string | null;
  confidence_threshold: number;
  max_auto_replies: number;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface AiAgentMailbox {
  id: string;
  ai_agent_id: string;
  mailbox_integration_id: string;
  mailbox_email: string;
  enabled: boolean;
  created_at: number;
}

export interface AiActionLog {
  id: string;
  ticket_id: string;
  ai_agent_id: string;
  action: AiAgentAction;
  metadata: Record<string, unknown> | null;
  created_at: number;
}

export interface AiTicketState {
  id: string;
  ticket_id: string;
  ai_agent_id: string;
  reply_count: number;
  escalated: boolean;
  escalated_at: number | null;
  escalation_note: string | null;
  created_at: number;
  updated_at: number;
}

async function throwOnError(res: Response): Promise<void> {
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Request failed");
  }
}

export async function apiGetAiAgents(workspaceId: string): Promise<AiAgent[]> {
  const res = await fetch(`${BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
  await throwOnError(res);
  const data = (await res.json()) as { agents: AiAgent[] };
  return data.agents;
}

export async function apiGetAiAgent(
  agentId: string,
  workspaceId: string
): Promise<{ agent: AiAgent; mailboxes: AiAgentMailbox[] }> {
  const res = await fetch(`${BASE}/${agentId}?workspace_id=${workspaceId}`, { credentials: "include" });
  await throwOnError(res);
  return res.json() as Promise<{ agent: AiAgent; mailboxes: AiAgentMailbox[] }>;
}

export async function apiCreateAiAgent(
  workspaceId: string,
  data: {
    name: string;
    description?: string;
    system_prompt?: string;
    confidence_threshold?: number;
    max_auto_replies?: number;
  }
): Promise<AiAgent> {
  const res = await fetch(`${BASE}?workspace_id=${workspaceId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  await throwOnError(res);
  const result = (await res.json()) as { agent: AiAgent };
  return result.agent;
}

export async function apiUpdateAiAgent(
  agentId: string,
  workspaceId: string,
  data: Partial<Pick<AiAgent, "name" | "description" | "status" | "system_prompt" | "confidence_threshold" | "max_auto_replies">>
): Promise<AiAgent> {
  const res = await fetch(`${BASE}/${agentId}?workspace_id=${workspaceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  await throwOnError(res);
  const result = (await res.json()) as { agent: AiAgent };
  return result.agent;
}

export async function apiDeleteAiAgent(agentId: string, workspaceId: string): Promise<void> {
  const res = await fetch(`${BASE}/${agentId}?workspace_id=${workspaceId}`, {
    method: "DELETE",
    credentials: "include",
  });
  await throwOnError(res);
}

export async function apiAssignMailbox(
  agentId: string,
  workspaceId: string,
  mailboxIntegrationId: string
): Promise<AiAgentMailbox[]> {
  const res = await fetch(`${BASE}/${agentId}/mailboxes?workspace_id=${workspaceId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mailbox_integration_id: mailboxIntegrationId }),
  });
  await throwOnError(res);
  const data = (await res.json()) as { mailboxes: AiAgentMailbox[] };
  return data.mailboxes;
}

export async function apiUnassignMailbox(
  agentId: string,
  workspaceId: string,
  mailboxIntegrationId: string
): Promise<AiAgentMailbox[]> {
  const res = await fetch(`${BASE}/${agentId}/mailboxes?workspace_id=${workspaceId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mailbox_integration_id: mailboxIntegrationId }),
  });
  await throwOnError(res);
  const data = (await res.json()) as { mailboxes: AiAgentMailbox[] };
  return data.mailboxes;
}

export async function apiToggleMailboxEnabled(
  agentId: string,
  workspaceId: string,
  mailboxIntegrationId: string,
  enabled: boolean
): Promise<AiAgentMailbox[]> {
  const res = await fetch(`${BASE}/${agentId}/mailboxes?workspace_id=${workspaceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mailbox_integration_id: mailboxIntegrationId, enabled }),
  });
  await throwOnError(res);
  const data = (await res.json()) as { mailboxes: AiAgentMailbox[] };
  return data.mailboxes;
}

export async function apiGetAiAgentLogs(
  agentId: string,
  workspaceId: string,
  ticketId?: string
): Promise<AiActionLog[]> {
  const params = new URLSearchParams({ workspace_id: workspaceId });
  if (ticketId) params.set("ticket_id", ticketId);
  const res = await fetch(`${BASE}/${agentId}/logs?${params}`, { credentials: "include" });
  await throwOnError(res);
  const data = (await res.json()) as { logs: AiActionLog[] };
  return data.logs;
}

export async function apiGetTicketAiState(
  ticketId: string
): Promise<{ state: AiTicketState | null; agent_name: string | null; logs: AiActionLog[] }> {
  const res = await fetch(`/api/tickets/${ticketId}/ai-state`, { credentials: "include" });
  await throwOnError(res);
  return res.json() as Promise<{ state: AiTicketState | null; agent_name: string | null; logs: AiActionLog[] }>;
}

export async function apiEscalateTicketAi(ticketId: string, reason?: string): Promise<void> {
  const res = await fetch(`/api/tickets/${ticketId}/ai-state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "escalate", reason }),
  });
  await throwOnError(res);
}

export async function apiResumeTicketAi(ticketId: string): Promise<void> {
  const res = await fetch(`/api/tickets/${ticketId}/ai-state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "resume" }),
  });
  await throwOnError(res);
}
