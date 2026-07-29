import type { Env, PublicWorkspaceProduct, ToolCallResult } from "./types";
import { executeToolCall, resolveTool } from "./tool-executor";
import { loadInstallCredentials, logToolCall } from "./db/marketplace";

/** The env secret that unlocks stored connector credentials. */
export function credentialsSecret(env: Env): string {
	return env.CREDENTIALS_SECRET || env.JWT_SECRET;
}

export interface RunToolInput {
	env: Env;
	workspaceId: string;
	/** Tools the caller is allowed to use (agent assignment or workspace install). */
	tools: PublicWorkspaceProduct[];
	actionId: string;
	params: Record<string, unknown>;
	triggeredBy: "agent" | "user";
	aiAgentId?: string | null;
	ticketId?: string | null;
	userId?: string | null;
	/**
	 * Actions flagged `requires_confirmation` are write operations (refunds,
	 * cancellations…). Agents must never fire them on their own — only
	 * human-initiated runs from the console pass this flag.
	 */
	allowConfirmationRequired?: boolean;
}

export interface RunToolResult extends ToolCallResult {
	/** Set when the call was blocked because a human must approve it first. */
	requires_confirmation?: boolean;
}

/**
 * Resolves an actionId against the caller's tools, executes the HTTP call with
 * the workspace's decrypted credentials, and writes an audit log entry.
 * Never throws — failures come back as `{ ok: false, error }`.
 */
export async function runTool(input: RunToolInput): Promise<RunToolResult> {
	const { env, workspaceId, tools, actionId, params, triggeredBy } = input;

	const resolved = resolveTool(actionId, tools);

	if (!resolved) {
		const result: RunToolResult = {
			ok: false,
			status: null,
			error: `Tool not found or not available: "${actionId}".`,
			duration_ms: 0,
		};
		await safeLog(env, {
			workspaceId,
			workspaceProductId: null,
			productActionId: null,
			aiAgentId: input.aiAgentId,
			ticketId: input.ticketId,
			triggeredBy,
			userId: input.userId,
			actionId,
			method: null,
			url: null,
			requestParams: params,
			statusCode: null,
			ok: false,
			durationMs: 0,
			error: result.error ?? null,
			responsePreview: null,
		});
		return result;
	}

	const { product, action } = resolved;

	if (action.requires_confirmation && !input.allowConfirmationRequired) {
		const result: RunToolResult = {
			ok: false,
			status: null,
			requires_confirmation: true,
			error: `Action "${action.name}" changes data in ${product.name} and requires human approval. Escalate to a human agent instead of running it.`,
			duration_ms: 0,
		};
		await safeLog(env, {
			workspaceId,
			workspaceProductId: product.workspace_product_id,
			productActionId: action.id,
			aiAgentId: input.aiAgentId,
			ticketId: input.ticketId,
			triggeredBy,
			userId: input.userId,
			actionId,
			method: action.method,
			url: null,
			requestParams: params,
			statusCode: null,
			ok: false,
			durationMs: 0,
			error: "Blocked: requires human confirmation",
			responsePreview: null,
		});
		return result;
	}

	const credentials = await loadInstallCredentials(env.DB, credentialsSecret(env), product.workspace_product_id);
	const result = await executeToolCall({ product, action, params, credentials });

	await safeLog(env, {
		workspaceId,
		workspaceProductId: product.workspace_product_id,
		productActionId: action.id,
		aiAgentId: input.aiAgentId,
		ticketId: input.ticketId,
		triggeredBy,
		userId: input.userId,
		actionId,
		method: result.request?.method ?? action.method,
		url: result.request?.url ?? null,
		requestParams: params,
		statusCode: result.status,
		ok: result.ok,
		durationMs: result.duration_ms,
		error: result.error ?? null,
		responsePreview: result.data === undefined ? null : safeStringify(result.data),
	});

	return result;
}

/** What the agent loop feeds back into the conversation as the tool result. */
export function toModelResult(result: RunToolResult): Record<string, unknown> {
	if (result.ok) {
		return { ok: true, status: result.status, data: result.data ?? null };
	}
	return {
		ok: false,
		status: result.status,
		error: result.error ?? "Tool call failed.",
		...(result.requires_confirmation ? { requires_human_approval: true } : {}),
		...(result.data !== undefined ? { detail: result.data } : {}),
	};
}

function safeStringify(value: unknown): string | null {
	try {
		return typeof value === "string" ? value : JSON.stringify(value);
	} catch {
		return null;
	}
}

/** Audit logging must never break the call it is recording. */
async function safeLog(env: Env, entry: Parameters<typeof logToolCall>[1]): Promise<void> {
	try {
		await logToolCall(env.DB, entry);
	} catch (error) {
		console.error("tool_call_logs insert failed", error);
	}
}
