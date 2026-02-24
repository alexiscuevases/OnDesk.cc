import { useQuery } from "@tanstack/react-query";
import { apiGetTickets, apiGetTicket, apiGetTicketMessages } from "../api/tickets-api";
import type { TicketStatus } from "../api/tickets-api";

export const ticketQueryKeys = {
	all: (workspaceId: string) => ["tickets", workspaceId] as const,
	list: (workspaceId: string, filters: object) => ["tickets", workspaceId, "list", filters] as const,
	detail: (id: string) => ["tickets", id] as const,
	messages: (ticketId: string) => ["tickets", ticketId, "messages"] as const,
};

export function useTickets(
	workspaceId: string,
	filters: { status?: TicketStatus; assignee_id?: string; team_id?: string } = {}
) {
	return useQuery({
		queryKey: ticketQueryKeys.list(workspaceId, filters),
		queryFn: () => apiGetTickets(workspaceId, filters),
		staleTime: 1000 * 60 * 2,
	});
}

export function useTicket(id: string) {
	return useQuery({
		queryKey: ticketQueryKeys.detail(id),
		queryFn: () => apiGetTicket(id),
		staleTime: 1000 * 60 * 2,
	});
}

export function useTicketMessages(ticketId: string) {
	return useQuery({
		queryKey: ticketQueryKeys.messages(ticketId),
		queryFn: () => apiGetTicketMessages(ticketId),
		staleTime: 1000 * 30,
	});
}
