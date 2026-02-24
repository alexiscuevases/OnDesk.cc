import { useQuery } from "@tanstack/react-query";
import { apiGetSignatures, apiGetSignature } from "../api/signatures-api";

export const signatureQueryKeys = {
	all: () => ["signatures"] as const,
	detail: (id: string) => ["signatures", id] as const,
};

export function useSignatures() {
	return useQuery({
		queryKey: signatureQueryKeys.all(),
		queryFn: apiGetSignatures,
		staleTime: 1000 * 60 * 5,
	});
}

export function useSignature(id: string) {
	return useQuery({
		queryKey: signatureQueryKeys.detail(id),
		queryFn: () => apiGetSignature(id),
		staleTime: 1000 * 60 * 5,
	});
}
