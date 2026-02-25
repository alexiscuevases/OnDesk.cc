import { createWorkspaceScopedApi } from "@/lib/crud-api";

export interface Company {
	id: string;
	workspace_id: string;
	name: string;
	domain: string | null;
	description: string | null;
	logo_url: string | null;
	created_at: number;
}

export interface CreateCompanyInput {
	workspace_id: string;
	name: string;
	domain?: string;
	description?: string;
	logo_url?: string;
}

export interface UpdateCompanyInput {
	name?: string;
	domain?: string;
	description?: string;
	logo_url?: string | null;
}

const _api = createWorkspaceScopedApi<Company, CreateCompanyInput, UpdateCompanyInput>({
	basePath: "/api/companies",
	listKey: "companies",
	itemKey: "company",
});

export const apiGetCompanies = _api.getAll;
export const apiGetCompany = _api.getById;
export const apiCreateCompany = _api.create;
export const apiUpdateCompany = (id: string, input: UpdateCompanyInput) => _api.update(id, input);
export const apiDeleteCompany = _api.delete;
