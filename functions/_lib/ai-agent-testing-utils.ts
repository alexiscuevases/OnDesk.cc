export interface ExecuteActionToken {
	actionId: string;
	params: Record<string, unknown>;
}

import type { PublicWorkspaceProduct } from "./types";

export interface ParsedAgentOutput {
	// The action to execute, if the model requested one
	action: ExecuteActionToken | null;
	// Whether the model explicitly requested human escalation
	escalate: boolean;
	// Optional reason provided alongside escalate action
	escalateReason: string;
	// Confidence score for reply (defaults to 0 if not present)
	confidence: number;
	// The reply text formatted for the user
	cleanText: string;
}

/**
 * Parses JSON action payload from the AI response.
 * Expects the AI to return exactly one JSON object describing its action:
 */
export function parseStructuredTokens(raw: string): ParsedAgentOutput {
	const result: ParsedAgentOutput = {
		action: null,
		escalate: false,
		escalateReason: "",
		confidence: 0,
		cleanText: "",
	};

	try {
		// Find all JSON blocks by counting braces to support consecutive blocks
		const jsonBlocks: string[] = [];
		let braceCount = 0;
		let startIndex = -1;

		for (let i = 0; i < raw.length; i++) {
			if (raw[i] === "{") {
				if (braceCount === 0) startIndex = i;
				braceCount++;
			} else if (raw[i] === "}") {
				braceCount--;
				if (braceCount === 0 && startIndex !== -1) {
					jsonBlocks.push(raw.substring(startIndex, i + 1));
					startIndex = -1;
				}
			}
			if (braceCount < 0) braceCount = 0;
		}

		if (jsonBlocks.length === 0) {
			result.escalate = true;
			result.escalateReason = "AI produced invalid format (no JSON block found).";
			return result;
		}

		let payload = null;
		for (let i = jsonBlocks.length - 1; i >= 0; i--) {
			try {
				payload = JSON.parse(jsonBlocks[i]);
				break;
			} catch {
				// Ignore parse errors, try previous block
			}
		}

		if (!payload) {
			result.escalate = true;
			result.escalateReason = "AI produced invalid JSON structure.";
			return result;
		}

		switch (payload.action) {
			case "execute":
				result.action = {
					actionId: payload.actionId || "",
					params: typeof payload.params === "object" && payload.params !== null ? payload.params : {},
				};
				break;
			case "escalate":
				result.escalate = true;
				result.escalateReason = payload.reason || "AI requested escalation.";
				break;
			case "reply":
				result.cleanText = payload.message || "";
				result.confidence = Math.min(1, Math.max(0, parseFloat(payload.confidence) || 0));
				break;
			default:
				result.escalate = true;
				result.escalateReason = `AI produced unknown action type: ${payload.action}`;
				break;
		}

	} catch {
		result.escalate = true;
		result.escalateReason = "AI produced invalid JSON structure.";
	}

	return result;
}

/**
 * Looks up the matching product + action from the agentTools list and performs
 * the HTTP fetch.
 */
export async function executeAction(
	token: ExecuteActionToken,
	agentTools: PublicWorkspaceProduct[], // Type simplified to decouple from db module exactly
): Promise<Record<string, unknown>> {
	for (const product of agentTools) {
		const prefix = `${String(product.name).replace(/\s+/g, "_")}_`;
		if (!token.actionId.startsWith(prefix)) continue;

		const extractedName = token.actionId.substring(prefix.length);
		const action = (product.actions as Record<string, unknown>[]).find((a: Record<string, unknown>) => a.name === extractedName);
		if (!action) continue;

		const config = (product.configuration as Record<string, string>) || {};
		let url = String((action as Record<string, unknown>).endpoint || "");
		const headers: Record<string, string> = { "Content-Type": "application/json" };

		if (product.auth_type === "api_key" && config.apiKey) {
			headers["Authorization"] = `Bearer ${config.apiKey}`;
		}

		const options: RequestInit = { method: action.method as string | undefined, headers };

		if (action.method === "GET") {
			const qs = new URLSearchParams(
				Object.fromEntries(Object.entries(token.params).map(([k, v]) => [k, String(v)])),
			);
			url += `?${qs.toString()}`;
		} else {
			options.body = JSON.stringify(token.params);
		}

		try {
			const response = await fetch(url as string | URL | Request, options);
			const result = await response.json();
			if (!response.ok) {
				return { error: `HTTP ${response.status}`, detail: result };
			}
			return result as Record<string, unknown>;
		} catch (err: unknown) {
			return { error: `Fetch failed: ${(err as Error)?.message ?? String(err)}` };
		}
	}

	return { error: `Tool not found: ${token.actionId}` };
}

/**
 * Builds the AVAILABLE TOOLS section from the agent's assigned tools.
 */
export function buildToolsSection(agentTools: PublicWorkspaceProduct[]): string {
	if (!agentTools || agentTools.length === 0) return "No tools available.";

	return (
		"AVAILABLE TOOLS:\n" +
		agentTools
			.flatMap((product: PublicWorkspaceProduct) =>
				(product.actions as Record<string, unknown>[]).map((action: Record<string, unknown>) => {
					const actionId = `${String(product.name).replace(/\s+/g, "_")}_${String(action.name)}`;
					const actionParams = Array.isArray(action.parameters)
						? (action.parameters as Record<string, unknown>[])
						: [];
					const paramsText =
						actionParams.length > 0
							? actionParams
									.map(
										(p) =>
											`${String(p.name)} (${String(p.type ?? "string")}${
												p.required ? ", required" : ""
											}): ${String(p.description ?? "")}`
									)
									.join(", ")
							: "none";
					return `- actionId: "${actionId}"\n  Description: ${String(action.description ?? "")}\n  Parameters: ${paramsText}`;
				})
			)
			.join("\n")
	);
}

/**
 * Returns the universal rule block definitions and strict JSON schema
 * needed for prompting the LLM accurately.
 */
export function buildSystemPromptRules(agentName: string): string {
	return `
		════════════════════════════════════════
		RESPONSE FORMAT — STRICT JSON ONLY
		════════════════════════════════════════

		You MUST output exactly ONE valid JSON object per turn. Do not add conversational text outside the JSON.
		You have three possible actions. Choose the appropriate JSON schema:

		──────────────────────────────────────
		TYPE 1 — EXECUTE A TOOL
		──────────────────────────────────────
		Use this when you need data from an external system before you can answer.

		{
		"_thought": "1. What is my goal? 2. What tool do I need? 3. What parameters does the tool require? 4. Do I have the exact values for ALL required parameters, or do I need to call another tool first to get them?",
		"action": "execute",
		"actionId": "<actionId>",
		"params": { "<key>": "<value>" }
		}

		Rules:
		• You MUST provide a detailed explanation of your thought process in the "_thought" field evaluating the required parameters for the tool you want to call.
		• ONLY use actionIds from the AVAILABLE TOOLS list above.
		• ONLY call a tool if you have ALL required parameter values. Wait for previous tool results if needed.
		• IF a parameter requires an ID/URI from another tool (e.g., event_type URI, user URI), YOU MUST CALL THE TOOL THAT PROVIDES THAT ID FIRST.
		• Do NOT invent or guess any parameter value. Do NOT use templates or placeholders (like {user_id}). 
		• When you have all the data you need, output a "reply" action.

		──────────────────────────────────────
		TYPE 2 — FINAL REPLY TO CUSTOMER
		──────────────────────────────────────
		Use this when you have all the information and are ready to respond. Write a professional, empathetic response. Do NOT mention tools, APIs, or internal systems.

		{
		"_thought": "<optional: your internal reasoning>",
		"action": "reply",
		"message": "<your response here>",
		"confidence": 0.85
		}

		Rules:
		• Always sign replies as "${agentName}".
		• "confidence" should be between 0.0 and 1.0 indicating how confident you are that this reply fully resolves the user's issue.

		──────────────────────────────────────
		TYPE 3 — ESCALATE TO HUMAN
		──────────────────────────────────────
		Use this when you cannot resolve the request (error, missing permissions, out-of-scope request, repeated tool failure, etc.).

		{
		"_thought": "<optional: why you are escalating>",
		"action": "escalate",
		"reason": "<brief explanation of why human intervention is needed>"
		}
	`;
}
