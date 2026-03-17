import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export interface TestAiAgentPayload {
  message: string;
  history: { role: string; content: string }[];
}

export interface TestAiAgentResponse {
  traces: {
    type: "execute" | "reply" | "escalate";
    rawText: string;
    parsed: any;
    toolResult: any;
  }[];
  history: { role: string; content: string }[];
}

export async function apiTestAiAgent(
  agentId: string,
  workspaceId: string,
  payload: TestAiAgentPayload
): Promise<TestAiAgentResponse> {
  const res = await fetch(`/api/ai-agents/${agentId}/test?workspace_id=${workspaceId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Test request failed");
  }

  return res.json() as Promise<TestAiAgentResponse>;
}

export function useTestAiAgent(workspaceId: string, agentId: string) {
  return useMutation({
    mutationFn: (payload: TestAiAgentPayload) => apiTestAiAgent(agentId, workspaceId, payload),
    onError: (err) => {
      toast.error(`Test failed: ${err.message}`);
    },
  });
}
