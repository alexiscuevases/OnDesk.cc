import { useQuery } from "@tanstack/react-query";
import { apiGetContacts, apiGetContact } from "../api/contacts-api";

export const contactQueryKeys = {
	all: (workspaceId: string) => ["contacts", workspaceId] as const,
	detail: (id: string) => ["contacts", id] as const,
};

export function useContacts(workspaceId: string) {
	return useQuery({
		queryKey: contactQueryKeys.all(workspaceId),
		queryFn: () => apiGetContacts(workspaceId),
		staleTime: 1000 * 60 * 5,
	});
}

export function useContact(id: string) {
	return useQuery({
		queryKey: contactQueryKeys.detail(id),
		queryFn: () => apiGetContact(id),
		staleTime: 1000 * 60 * 5,
	});
}
