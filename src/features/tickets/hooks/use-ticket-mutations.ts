import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	apiCreateTicket, apiUpdateTicket, apiDeleteTicket, apiCreateTicketMessage,
} from "../api/tickets-api";
import { ticketQueryKeys } from "./use-ticket-queries";
import type { CreateTicketInput, UpdateTicketInput, CreateMessageInput } from "../api/tickets-api";

export function useCreateTicketMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateTicketInput) => apiCreateTicket(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all(workspaceId) });
		},
	});
}

export function useUpdateTicketMutation(ticketId: string, workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateTicketInput) => apiUpdateTicket(ticketId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: ticketQueryKeys.detail(ticketId) });
		},
	});
}

export function useDeleteTicketMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (ticketId: string) => apiDeleteTicket(ticketId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all(workspaceId) });
		},
	});
}

export function useSendMessageMutation(ticketId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateMessageInput) => apiCreateTicketMessage(ticketId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ticketQueryKeys.messages(ticketId) });
			queryClient.invalidateQueries({ queryKey: ticketQueryKeys.detail(ticketId) });
		},
	});
}
