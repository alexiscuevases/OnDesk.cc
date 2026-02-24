export interface Contact {
	id: string;
	workspace_id: string;
	company_id: string | null;
	name: string;
	email: string;
	phone: string | null;
	created_at: number;
}

export interface CreateContactInput {
	workspace_id: string;
	name: string;
	email: string;
	phone?: string;
	company_id?: string;
}

export interface UpdateContactInput {
	name?: string;
	phone?: string;
	company_id?: string | null;
}

const API_BASE = "/api/contacts";

export async function apiGetContacts(workspaceId: string): Promise<Contact[]> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch contacts");
	}
	const data = (await res.json()) as { contacts: Contact[] };
	return data.contacts;
}

export async function apiGetContact(id: string): Promise<Contact> {
	const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Contact not found");
	}
	const data = (await res.json()) as { contact: Contact };
	return data.contact;
}

export async function apiCreateContact(input: CreateContactInput): Promise<Contact> {
	const { workspace_id, ...body } = input;
	const res = await fetch(`${API_BASE}?workspace_id=${workspace_id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to create contact");
	}
	const data = (await res.json()) as { contact: Contact };
	return data.contact;
}

export async function apiUpdateContact(id: string, input: UpdateContactInput): Promise<Contact> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to update contact");
	}
	const data = (await res.json()) as { contact: Contact };
	return data.contact;
}

export async function apiDeleteContact(id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to delete contact");
	}
}
