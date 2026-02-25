import { createUserScopedApi } from "@/lib/crud-api";

export interface Signature {
	id: string;
	created_by: string;
	workspace_id: string;
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

const _api = createUserScopedApi<Signature, CreateSignatureInput, UpdateSignatureInput>({
	basePath: "/api/signatures",
	listKey: "signatures",
	itemKey: "signature",
});

export const apiGetSignatures = _api.getAll;
export const apiGetSignature = _api.getById;
export const apiCreateSignature = _api.create;
export const apiUpdateSignature = (id: string, input: UpdateSignatureInput) => _api.update(id, input);
export const apiDeleteSignature = _api.delete;
