import { createWorkspaceScopedApi } from "@/lib/crud-api";

export interface Contact {
	id: string;
	workspace_id: string;
	company_id: string | null;
	name: string;
	email: string;
	phone: string | null;
	logo_url: string | null;
	created_at: number;
}

export interface CreateContactInput {
	workspace_id: string;
	name: string;
	email: string;
	phone?: string;
	company_id?: string;
	logo_url?: string;
}

export interface UpdateContactInput {
	name?: string;
	phone?: string;
	company_id?: string | null;
	logo_url?: string | null;
}

const _api = createWorkspaceScopedApi<Contact, CreateContactInput, UpdateContactInput>({
	basePath: "/api/contacts",
	listKey: "contacts",
	itemKey: "contact",
});

export const apiGetContacts = _api.getAll;
export const apiGetContact = _api.getById;
export const apiCreateContact = _api.create;
export const apiUpdateContact = (id: string, input: UpdateContactInput) => _api.update(id, input);
export const apiDeleteContact = _api.delete;
