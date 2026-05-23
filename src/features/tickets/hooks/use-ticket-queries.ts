import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiGetTickets, apiGetTicket, apiGetTicketMessages, apiGetTicketCounts } from "../api/tickets-api";
import type { TicketListFilters } from "../api/tickets-api";

export const ticketQueryKeys = {
	all: (workspaceId: string) => ["tickets", workspaceId] as const,
	list: (workspaceId: string, filters: object, pagination: object) =>
		["tickets", workspaceId, "list", filters, pagination] as const,
	counts: (workspaceId: string) => ["tickets", workspaceId, "counts"] as const,
	detail: (id: string) => ["tickets", id] as const,
	messages: (ticketId: string) => ["tickets", ticketId, "messages"] as const,
};

export function useTickets(
	workspaceId: string,
	filters: TicketListFilters = {},
	pagination: { page: number; pageSize: number } = { page: 1, pageSize: 25 }
) {
	return useQuery({
		queryKey: ticketQueryKeys.list(workspaceId, filters, pagination),
		queryFn: () => apiGetTickets(workspaceId, filters, pagination),
		staleTime: 1000 * 60 * 2,
		placeholderData: keepPreviousData,
	});
}

export function useTicketCounts(workspaceId: string) {
	return useQuery({
		queryKey: ticketQueryKeys.counts(workspaceId),
		queryFn: () => apiGetTicketCounts(workspaceId),
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
