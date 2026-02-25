import { createUserScopedMutationHooks } from "@/lib/crud-hooks";
import { apiCreateSignature, apiUpdateSignature, apiDeleteSignature } from "../api/signatures-api";
import type { CreateSignatureInput, UpdateSignatureInput } from "../api/signatures-api";
import { signatureQueryKeys } from "./use-signature-queries";

const { useCreate, useUpdate, useDelete } = createUserScopedMutationHooks<
	unknown,
	CreateSignatureInput,
	UpdateSignatureInput
>(signatureQueryKeys, {
	create: apiCreateSignature,
	update: apiUpdateSignature,
	delete: apiDeleteSignature,
});

export const useCreateSignatureMutation = useCreate;
export const useUpdateSignatureMutation = useUpdate;
export const useDeleteSignatureMutation = useDelete;
