import { createWorkspaceScopedQueryHooks } from "@/lib/crud-hooks";
import { useQuery } from "@tanstack/react-query";
import {
	apiGetBusinessHours,
	apiGetBusinessHoursById,
	apiGetBusinessHoursStatus,
} from "../api/business-hours-api";

const { queryKeys, useAll, useById } = createWorkspaceScopedQueryHooks(
	"business-hours",
	{ getAll: apiGetBusinessHours, getById: apiGetBusinessHoursById },
);

export const businessHoursQueryKeys = queryKeys;
export const useBusinessHours = useAll;
export const useBusinessHoursById = useById;

export function useBusinessHoursStatus(businessHoursId: string | null) {
	return useQuery({
		queryKey: ["business-hours", "status", businessHoursId] as const,
		queryFn: () => (businessHoursId ? apiGetBusinessHoursStatus(businessHoursId) : Promise.resolve(null)),
		enabled: !!businessHoursId,
		refetchInterval: 60_000,
		staleTime: 30_000,
	});
}
