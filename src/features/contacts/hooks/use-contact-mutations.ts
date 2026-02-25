import { createWorkspaceScopedMutationHooks } from "@/lib/crud-hooks";
import { apiCreateContact, apiUpdateContact, apiDeleteContact } from "../api/contacts-api";
import type { CreateContactInput, UpdateContactInput } from "../api/contacts-api";
import { contactQueryKeys } from "./use-contact-queries";

const { useCreate, useUpdate, useDelete } = createWorkspaceScopedMutationHooks<
	unknown,
	CreateContactInput,
	UpdateContactInput
>(contactQueryKeys, {
	create: apiCreateContact,
	update: apiUpdateContact,
	delete: apiDeleteContact,
});

export const useCreateContactMutation = useCreate;
export const useUpdateContactMutation = useUpdate;
export const useDeleteContactMutation = useDelete;
