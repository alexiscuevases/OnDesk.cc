import { createUserScopedQueryHooks } from "@/lib/crud-hooks";
import { apiGetSignatures, apiGetSignature } from "../api/signatures-api";

const { queryKeys, useAll, useById } = createUserScopedQueryHooks(
	"signatures",
	{ getAll: apiGetSignatures, getById: apiGetSignature }
);

export const signatureQueryKeys = queryKeys;
export const useSignatures = useAll;
export const useSignature = useById;
