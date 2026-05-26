import { createWorkspaceScopedMutationHooks } from "@/lib/crud-hooks";
import {
	apiCreateSlaPolicy,
	apiUpdateSlaPolicy,
	apiDeleteSlaPolicy,
	type CreateSlaPolicyInput,
	type UpdateSlaPolicyInput,
} from "../api/sla-api";
import { slaQueryKeys } from "./use-sla-queries";

const { useCreate, useUpdate, useDelete } = createWorkspaceScopedMutationHooks<
	unknown,
	CreateSlaPolicyInput,
	UpdateSlaPolicyInput
>(slaQueryKeys, {
	create: apiCreateSlaPolicy,
	update: apiUpdateSlaPolicy,
	delete: apiDeleteSlaPolicy,
});

export const useCreateSlaPolicyMutation = useCreate;
export const useUpdateSlaPolicyMutation = useUpdate;
export const useDeleteSlaPolicyMutation = useDelete;
