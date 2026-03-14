import { useQuery } from "@tanstack/react-query";
import {
  apiGetAiAgents,
  apiGetAiAgent,
  apiGetAiAgentLogs,
  apiGetTicketAiState,
} from "../api/ai-agents-api";

export const aiAgentQueryKeys = {
  all: (workspaceId: string) => ["ai-agents", workspaceId] as const,
  one: (workspaceId: string, agentId: string) => ["ai-agents", workspaceId, agentId] as const,
  logs: (workspaceId: string, agentId: string) => ["ai-agents", workspaceId, agentId, "logs"] as const,
  ticketState: (ticketId: string) => ["tickets", ticketId, "ai-state"] as const,
};

export function useAiAgents(workspaceId: string) {
  return useQuery({
    queryKey: aiAgentQueryKeys.all(workspaceId),
    queryFn: () => apiGetAiAgents(workspaceId),
    staleTime: 1000 * 60,
  });
}

export function useAiAgent(workspaceId: string, agentId: string) {
  return useQuery({
    queryKey: aiAgentQueryKeys.one(workspaceId, agentId),
    queryFn: () => apiGetAiAgent(agentId, workspaceId),
    enabled: !!agentId,
    staleTime: 1000 * 60,
  });
}

export function useAiAgentLogs(workspaceId: string, agentId: string, ticketId?: string) {
  return useQuery({
    queryKey: [...aiAgentQueryKeys.logs(workspaceId, agentId), ticketId],
    queryFn: () => apiGetAiAgentLogs(agentId, workspaceId, ticketId),
    enabled: !!agentId,
    staleTime: 1000 * 30,
  });
}

export function useTicketAiState(ticketId: string) {
  return useQuery({
    queryKey: aiAgentQueryKeys.ticketState(ticketId),
    queryFn: () => apiGetTicketAiState(ticketId),
    staleTime: 1000 * 30,
  });
}
