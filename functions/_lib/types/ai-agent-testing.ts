export interface ExecuteActionToken {
	actionId: string;
	params: Record<string, unknown>;
}

export interface ParsedAgentOutput {
	action: ExecuteActionToken | null;
	escalate: boolean;
	escalateReason: string;
	confidence: number;
	cleanText: string;
	thought: string;
}
