import { createWorkspaceScopedQueryHooks } from "@/lib/crud-hooks";
import { useQuery } from "@tanstack/react-query";
import { apiGetAutomations, apiGetAutomation, apiGetAutomationRuns } from "../api/automations-api";

const { queryKeys, useAll, useById } = createWorkspaceScopedQueryHooks(
	"automations",
	{ getAll: apiGetAutomations, getById: apiGetAutomation },
);

export const automationQueryKeys = queryKeys;
export const useAutomations = useAll;
export const useAutomation = useById;

export function useAutomationRuns(id: string) {
	return useQuery({
		queryKey: ["automations", id, "runs"] as const,
		queryFn: () => apiGetAutomationRuns(id),
		staleTime: 1000 * 30,
	});
}
