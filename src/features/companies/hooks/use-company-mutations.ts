import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCreateCompany, apiUpdateCompany, apiDeleteCompany } from "../api/companies-api";
import { companyQueryKeys } from "./use-company-queries";
import type { CreateCompanyInput, UpdateCompanyInput } from "../api/companies-api";

export function useCreateCompanyMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateCompanyInput) => apiCreateCompany(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: companyQueryKeys.all(workspaceId) });
		},
	});
}

export function useUpdateCompanyMutation(companyId: string, workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateCompanyInput) => apiUpdateCompany(companyId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: companyQueryKeys.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: companyQueryKeys.detail(companyId) });
		},
	});
}

export function useDeleteCompanyMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (companyId: string) => apiDeleteCompany(companyId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: companyQueryKeys.all(workspaceId) });
		},
	});
}
