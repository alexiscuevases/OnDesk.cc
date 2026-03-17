import { withWorkspace } from "../../../_lib/middleware";
import { jsonOk, jsonError } from "../../../_lib/response";
import { findAiAgentById, findAgentTools, getWorkspaceMemberRole } from "../../../_lib/db";
import { parseStructuredTokens, executeAction, buildToolsSection, buildSystemPromptRules } from "../../../_lib/ai-agent-testing-utils"; // We'll create this to share logic

// POST /api/ai-agents/:id/test?workspace_id=
export const onRequest = withWorkspace<"id">(async ({ request, env, payload, params, workspaceId }) => {
	const agentId = params.id;
	
	const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
	if (role !== "owner" && role !== "admin") {
		return jsonError("Only workspace owners and admins can test AI agents", 403);
	}

	const agent = await findAiAgentById(env.DB, agentId);
	if (!agent) return jsonError("AI agent not found", 404);
	if (agent.workspace_id !== workspaceId) return jsonError("Forbidden", 403);

	let body: { message: string, history: {role: string, content: string}[] };
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return jsonError("Invalid JSON body");
	}

	const incomingMessage = body.message?.trim();
	const history = body.history || [];

	if (!incomingMessage && history.length === 0) {
		return jsonError("A message is required to test the agent");
	}

	const agentTools = await findAgentTools(env.DB, agent.id);

	const toolsSection = buildToolsSection(agentTools);

	// Build base prompt, similar to how it works in the pipeline but generalized
	const basePrompt = `
		You are ${agent.name}, an automated AI support agent. Your job is to resolve customer support tickets by writing professional, empathetic email replies.

		${toolsSection}

		${buildSystemPromptRules(agent.name)}
	`;

	const systemPrompt = agent.system_prompt ? `${agent.system_prompt}\n\n${basePrompt}` : basePrompt;

	const messages = [
		{ role: "system", content: systemPrompt },
        ...history
	];

    if (incomingMessage) {
        messages.push({ role: "user", content: incomingMessage });
    }

	// 8. Agentic loop — continues only while the model requests tool execution
	const MAX_ACTIONS = 10;
	let actionCount = 0;
	const executedActions = new Set<string>();
	const traces = [];

	try {
		while (true) {
			const aiResponse = (await env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
				messages,
				stream: false,
				max_tokens: 1024,
			})) as { response?: string } | string;

			const rawText: string =
				typeof aiResponse === "string"
					? aiResponse
					: ((aiResponse as { response?: string }).response ?? "");

			const parsed = parseStructuredTokens(rawText);
            
            // Record this step for the frontend visualization
            const stepTrace = {
                type: parsed.action ? "execute" : (parsed.escalate ? "escalate" : "reply") as "execute" | "escalate" | "reply",
                rawText: rawText,
                parsed: parsed,
                toolResult: null as unknown
            };

			if (parsed.action) {
				if (actionCount >= MAX_ACTIONS) {
					stepTrace.type = "escalate";
                    stepTrace.parsed.escalateReason = `Safety cap reached: model requested more than ${MAX_ACTIONS} tool executions.`;
                    traces.push(stepTrace);
					break;
				}

				const fingerprint = `${parsed.action.actionId}:${JSON.stringify(parsed.action.params)}`;
				if (executedActions.has(fingerprint)) {
					stepTrace.type = "escalate";
                    stepTrace.parsed.escalateReason = `Loop detected: action "${parsed.action.actionId}" was requested twice with identical parameters.`;
                    traces.push(stepTrace);
					break;
				}
				
                executedActions.add(fingerprint);
				actionCount++;

				const toolResult = await executeAction(parsed.action, agentTools);
                stepTrace.toolResult = toolResult;
                traces.push(stepTrace);

				messages.push({
					role: "assistant",
					content: JSON.stringify({
						action: "execute",
						actionId: parsed.action.actionId,
						params: parsed.action.params,
					}),
				});
				messages.push({
					role: "user",
					content: `Tool result for "${parsed.action.actionId}": ${JSON.stringify(toolResult)}`,
				});
				continue;
			}

			if (parsed.escalate) {
                traces.push(stepTrace);
				break;
			}

            traces.push(stepTrace);
			break;
		}
	} catch (err: unknown) {
		console.error("AI test pipeline failed", err);
		return jsonError(`AI model call failed: ${(err as Error)?.message || "Unknown error"}`, 500);
	}

	return jsonOk({ 
        traces,
        // Return latest messages so frontend can chain history if desired
        history: messages.slice(1) // exclude system prompt
    });
});
