import { useQuery } from "@tanstack/react-query";
import { apiGetCompanies, apiGetCompany } from "../api/companies-api";

export const companyQueryKeys = {
	all: (workspaceId: string) => ["companies", workspaceId] as const,
	detail: (id: string) => ["companies", id] as const,
};

export function useCompanies(workspaceId: string) {
	return useQuery({
		queryKey: companyQueryKeys.all(workspaceId),
		queryFn: () => apiGetCompanies(workspaceId),
		staleTime: 1000 * 60 * 5,
	});
}

export function useCompany(id: string) {
	return useQuery({
		queryKey: companyQueryKeys.detail(id),
		queryFn: () => apiGetCompany(id),
		staleTime: 1000 * 60 * 5,
	});
}
