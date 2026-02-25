import { createWorkspaceScopedQueryHooks } from "@/lib/crud-hooks";
import { apiGetCompanies, apiGetCompany } from "../api/companies-api";

const { queryKeys, useAll, useById } = createWorkspaceScopedQueryHooks(
	"companies",
	{ getAll: apiGetCompanies, getById: apiGetCompany }
);

export const companyQueryKeys = queryKeys;
export const useCompanies = useAll;
export const useCompany = useById;
