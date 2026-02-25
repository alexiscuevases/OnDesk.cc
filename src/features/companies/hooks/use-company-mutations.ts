import { createWorkspaceScopedMutationHooks } from "@/lib/crud-hooks";
import { apiCreateCompany, apiUpdateCompany, apiDeleteCompany } from "../api/companies-api";
import type { CreateCompanyInput, UpdateCompanyInput } from "../api/companies-api";
import { companyQueryKeys } from "./use-company-queries";

const { useCreate, useUpdate, useDelete } = createWorkspaceScopedMutationHooks<
	unknown,
	CreateCompanyInput,
	UpdateCompanyInput
>(companyQueryKeys, {
	create: apiCreateCompany,
	update: apiUpdateCompany,
	delete: apiDeleteCompany,
});

export const useCreateCompanyMutation = useCreate;
export const useUpdateCompanyMutation = useUpdate;
export const useDeleteCompanyMutation = useDelete;
