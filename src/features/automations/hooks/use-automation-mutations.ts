import { createWorkspaceScopedMutationHooks } from "@/lib/crud-hooks";
import {
	apiCreateAutomation,
	apiUpdateAutomation,
	apiDeleteAutomation,
	type CreateAutomationInput,
	type UpdateAutomationInput,
} from "../api/automations-api";
import { automationQueryKeys } from "./use-automation-queries";

const { useCreate, useUpdate, useDelete } = createWorkspaceScopedMutationHooks<
	unknown,
	CreateAutomationInput,
	UpdateAutomationInput
>(automationQueryKeys, {
	create: apiCreateAutomation,
	update: apiUpdateAutomation,
	delete: apiDeleteAutomation,
});

export const useCreateAutomationMutation = useCreate;
export const useUpdateAutomationMutation = useUpdate;
export const useDeleteAutomationMutation = useDelete;
