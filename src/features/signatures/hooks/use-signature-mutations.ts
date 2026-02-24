import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCreateSignature, apiUpdateSignature, apiDeleteSignature } from "../api/signatures-api";
import { signatureQueryKeys } from "./use-signature-queries";
import type { CreateSignatureInput, UpdateSignatureInput } from "../api/signatures-api";

export function useCreateSignatureMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateSignatureInput) => apiCreateSignature(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all() });
		},
	});
}

export function useUpdateSignatureMutation(signatureId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateSignatureInput) => apiUpdateSignature(signatureId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all() });
			queryClient.invalidateQueries({ queryKey: signatureQueryKeys.detail(signatureId) });
		},
	});
}

export function useDeleteSignatureMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (signatureId: string) => apiDeleteSignature(signatureId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all() });
		},
	});
}
