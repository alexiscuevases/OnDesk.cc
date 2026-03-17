import type { Env, PublicWorkspaceProduct } from "./types";
import type { ParsedAgentOutput } from "./ai-agent-testing-utils";
import { parseStructuredTokens, executeAction } from "./ai-agent-testing-utils";
import { AI_LIMITS, AI_MODELS } from "./config";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface AgentLoopTrace {
  type: "execute" | "escalate" | "reply";
  rawText: string;
  parsed: ParsedAgentOutput;
  toolResult: unknown;
}

interface RunAgenticLoopInput {
  env: Env;
  systemPrompt: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  incomingMessage?: string;
  agentTools: PublicWorkspaceProduct[];
  model?: string;
  maxActions?: number;
  maxTokens?: number;
  collectTraces?: boolean;
}

export interface AgentLoopResult {
  outcome: "reply" | "escalate";
  reason?: string;
  replyText?: string;
  parsed: ParsedAgentOutput;
  traces: AgentLoopTrace[];
  messages: ChatMessage[];
  actionCount: number;
}

export async function runAgenticLoop(input: RunAgenticLoopInput): Promise<AgentLoopResult> {
  const {
    env,
    systemPrompt,
    history = [],
    incomingMessage,
    agentTools,
    model = AI_MODELS.AGENTIC,
    maxActions = AI_LIMITS.AGENTIC_MAX_ACTIONS,
    maxTokens = AI_LIMITS.AGENTIC_MAX_TOKENS,
    collectTraces = false,
  } = input;

  const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }, ...history];
  if (incomingMessage) {
    messages.push({ role: "user", content: incomingMessage });
  }

  const executedActions = new Set<string>();
  const traces: AgentLoopTrace[] = [];
  let actionCount = 0;

  while (true) {
    const aiResponse = (await env.AI.run(model, {
      messages,
      stream: false,
      max_tokens: maxTokens,
    })) as { response?: string } | string;

    const rawText = typeof aiResponse === "string" ? aiResponse : aiResponse.response ?? "";
    const parsed = parseStructuredTokens(rawText);

    const stepTrace: AgentLoopTrace = {
      type: parsed.action ? "execute" : parsed.escalate ? "escalate" : "reply",
      rawText,
      parsed,
      toolResult: null,
    };

    if (parsed.action) {
      if (actionCount >= maxActions) {
        stepTrace.type = "escalate";
        stepTrace.parsed.escalateReason = `Safety cap reached: model requested more than ${maxActions} tool executions.`;
        if (collectTraces) traces.push(stepTrace);
        return {
          outcome: "escalate",
          reason: stepTrace.parsed.escalateReason,
          parsed: stepTrace.parsed,
          traces,
          messages,
          actionCount,
        };
      }

      const fingerprint = `${parsed.action.actionId}:${JSON.stringify(parsed.action.params)}`;
      if (executedActions.has(fingerprint)) {
        stepTrace.type = "escalate";
        stepTrace.parsed.escalateReason = `Loop detected: action "${parsed.action.actionId}" was requested twice with identical parameters.`;
        if (collectTraces) traces.push(stepTrace);
        return {
          outcome: "escalate",
          reason: stepTrace.parsed.escalateReason,
          parsed: stepTrace.parsed,
          traces,
          messages,
          actionCount,
        };
      }

      executedActions.add(fingerprint);
      actionCount++;

      const toolResult = await executeAction(parsed.action, agentTools);
      stepTrace.toolResult = toolResult;
      if (collectTraces) traces.push(stepTrace);

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

    if (collectTraces) traces.push(stepTrace);

    if (parsed.escalate) {
      return {
        outcome: "escalate",
        reason: parsed.escalateReason || "AI agent determined human intervention is required.",
        parsed,
        traces,
        messages,
        actionCount,
      };
    }

    return {
      outcome: "reply",
      replyText: parsed.cleanText,
      parsed,
      traces,
      messages,
      actionCount,
    };
  }
}
