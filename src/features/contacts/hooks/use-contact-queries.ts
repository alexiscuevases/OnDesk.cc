import { createWorkspaceScopedQueryHooks } from "@/lib/crud-hooks";
import { apiGetContacts, apiGetContact } from "../api/contacts-api";

const { queryKeys, useAll, useById } = createWorkspaceScopedQueryHooks(
	"contacts",
	{ getAll: apiGetContacts, getById: apiGetContact }
);

export const contactQueryKeys = queryKeys;
export const useContacts = useAll;
export const useContact = useById;
