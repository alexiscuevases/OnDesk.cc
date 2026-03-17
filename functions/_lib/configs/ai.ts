export const AI_MODELS = {
	AGENTIC: "@cf/meta/llama-3.1-70b-instruct",
	TICKET_ASSISTANT: "@cf/meta/llama-3.1-8b-instruct-fast",
} as const;

export const AI_LIMITS = {
	AGENTIC_MAX_ACTIONS: 10,
	AGENTIC_MAX_TOKENS: 1024,
	TICKET_ASSISTANT_MAX_TOKENS: 1536,
} as const;
