import { createWorkspaceScopedQueryHooks } from "@/lib/crud-hooks";
import { useQuery } from "@tanstack/react-query";
import { apiGetSlaPolicies, apiGetSlaPolicy, apiGetTicketSla } from "../api/sla-api";

const { queryKeys, useAll, useById } = createWorkspaceScopedQueryHooks(
	"sla-policies",
	{ getAll: apiGetSlaPolicies, getById: apiGetSlaPolicy },
);

export const slaQueryKeys = queryKeys;
export const useSlaPolicies = useAll;
export const useSlaPolicy = useById;

export function useTicketSla(ticketId: string) {
	return useQuery({
		queryKey: ["sla", "ticket", ticketId] as const,
		queryFn: () => apiGetTicketSla(ticketId),
		staleTime: 1000 * 30,
	});
}
