import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCreateContact, apiUpdateContact, apiDeleteContact } from "../api/contacts-api";
import { contactQueryKeys } from "./use-contact-queries";
import type { CreateContactInput, UpdateContactInput } from "../api/contacts-api";

export function useCreateContactMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateContactInput) => apiCreateContact(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: contactQueryKeys.all(workspaceId) });
		},
	});
}

export function useUpdateContactMutation(contactId: string, workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateContactInput) => apiUpdateContact(contactId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: contactQueryKeys.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: contactQueryKeys.detail(contactId) });
		},
	});
}

export function useDeleteContactMutation(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (contactId: string) => apiDeleteContact(contactId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: contactQueryKeys.all(workspaceId) });
		},
	});
}
