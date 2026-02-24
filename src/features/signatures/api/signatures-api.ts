export interface Signature {
	id: string;
	user_id: string;
	name: string;
	content: string;
	is_default: boolean;
	created_at: number;
}

export interface CreateSignatureInput {
	name: string;
	content: string;
	is_default?: boolean;
}

export interface UpdateSignatureInput {
	name?: string;
	content?: string;
	is_default?: boolean;
}

const API_BASE = "/api/signatures";

export async function apiGetSignatures(): Promise<Signature[]> {
	const res = await fetch(API_BASE, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch signatures");
	}
	const data = (await res.json()) as { signatures: Signature[] };
	return data.signatures;
}

export async function apiGetSignature(id: string): Promise<Signature> {
	const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Signature not found");
	}
	const data = (await res.json()) as { signature: Signature };
	return data.signature;
}

export async function apiCreateSignature(input: CreateSignatureInput): Promise<Signature> {
	const res = await fetch(API_BASE, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to create signature");
	}
	const data = (await res.json()) as { signature: Signature };
	return data.signature;
}

export async function apiUpdateSignature(
	id: string,
	input: UpdateSignatureInput
): Promise<Signature> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to update signature");
	}
	const data = (await res.json()) as { signature: Signature };
	return data.signature;
}

export async function apiDeleteSignature(id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to delete signature");
	}
}
