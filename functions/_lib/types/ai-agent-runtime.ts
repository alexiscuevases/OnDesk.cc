import type { ParsedAgentOutput } from "./ai-agent-testing";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface AgentLoopTrace {
	type: "execute" | "escalate" | "reply";
	rawText: string;
	parsed: ParsedAgentOutput;
	toolResult: unknown;
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
