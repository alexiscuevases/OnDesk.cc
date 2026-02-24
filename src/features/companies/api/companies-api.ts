export interface Company {
	id: string;
	workspace_id: string;
	name: string;
	domain: string | null;
	description: string | null;
	created_at: number;
}

export interface CreateCompanyInput {
	workspace_id: string;
	name: string;
	domain?: string;
	description?: string;
}

export interface UpdateCompanyInput {
	name?: string;
	domain?: string;
	description?: string;
}

const API_BASE = "/api/companies";

export async function apiGetCompanies(workspaceId: string): Promise<Company[]> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch companies");
	}
	const data = (await res.json()) as { companies: Company[] };
	return data.companies;
}

export async function apiGetCompany(id: string): Promise<Company> {
	const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Company not found");
	}
	const data = (await res.json()) as { company: Company };
	return data.company;
}

export async function apiCreateCompany(input: CreateCompanyInput): Promise<Company> {
	const { workspace_id, ...body } = input;
	const res = await fetch(`${API_BASE}?workspace_id=${workspace_id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to create company");
	}
	const data = (await res.json()) as { company: Company };
	return data.company;
}

export async function apiUpdateCompany(id: string, input: UpdateCompanyInput): Promise<Company> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to update company");
	}
	const data = (await res.json()) as { company: Company };
	return data.company;
}

export async function apiDeleteCompany(id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to delete company");
	}
}
