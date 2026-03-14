import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiCreateAiAgent,
  apiUpdateAiAgent,
  apiDeleteAiAgent,
  apiAssignMailbox,
  apiUnassignMailbox,
  apiToggleMailboxEnabled,
  apiEscalateTicketAi,
  apiResumeTicketAi,
} from "../api/ai-agents-api";
import { aiAgentQueryKeys } from "./use-ai-agent-queries";

export function useCreateAiAgent(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof apiCreateAiAgent>[1]) =>
      apiCreateAiAgent(workspaceId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiAgentQueryKeys.all(workspaceId) }),
  });
}

export function useUpdateAiAgent(workspaceId: string, agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof apiUpdateAiAgent>[2]) =>
      apiUpdateAiAgent(agentId, workspaceId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiAgentQueryKeys.all(workspaceId) });
      qc.invalidateQueries({ queryKey: aiAgentQueryKeys.one(workspaceId, agentId) });
    },
  });
}

export function useDeleteAiAgent(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => apiDeleteAiAgent(agentId, workspaceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiAgentQueryKeys.all(workspaceId) }),
  });
}

export function useAssignMailbox(workspaceId: string, agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mailboxIntegrationId: string) =>
      apiAssignMailbox(agentId, workspaceId, mailboxIntegrationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiAgentQueryKeys.one(workspaceId, agentId) }),
  });
}

export function useUnassignMailbox(workspaceId: string, agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mailboxIntegrationId: string) =>
      apiUnassignMailbox(agentId, workspaceId, mailboxIntegrationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiAgentQueryKeys.one(workspaceId, agentId) }),
  });
}

export function useToggleMailboxEnabled(workspaceId: string, agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mailboxIntegrationId, enabled }: { mailboxIntegrationId: string; enabled: boolean }) =>
      apiToggleMailboxEnabled(agentId, workspaceId, mailboxIntegrationId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiAgentQueryKeys.one(workspaceId, agentId) }),
  });
}

export function useEscalateTicketAi(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => apiEscalateTicketAi(ticketId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiAgentQueryKeys.ticketState(ticketId) }),
  });
}

export function useResumeTicketAi(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiResumeTicketAi(ticketId),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiAgentQueryKeys.ticketState(ticketId) }),
  });
}
