import { createWorkspaceScopedMutationHooks } from "@/lib/crud-hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	apiCreateBusinessHours,
	apiUpdateBusinessHours,
	apiDeleteBusinessHours,
	apiCreateHoliday,
	apiDeleteHoliday,
	type CreateBusinessHoursInput,
	type UpdateBusinessHoursInput,
	type CreateHolidayInput,
	type BusinessHoursHoliday,
} from "../api/business-hours-api";
import { businessHoursQueryKeys } from "./use-business-hours-queries";

const { useCreate, useUpdate, useDelete } = createWorkspaceScopedMutationHooks<
	unknown,
	CreateBusinessHoursInput,
	UpdateBusinessHoursInput
>(businessHoursQueryKeys, {
	create: apiCreateBusinessHours,
	update: apiUpdateBusinessHours,
	delete: apiDeleteBusinessHours,
});

export const useCreateBusinessHoursMutation = useCreate;
export const useUpdateBusinessHoursMutation = useUpdate;
export const useDeleteBusinessHoursMutation = useDelete;

export function useCreateHolidayMutation(businessHoursId: string, workspaceId: string) {
	const queryClient = useQueryClient();
	return useMutation<BusinessHoursHoliday, Error, CreateHolidayInput>({
		mutationFn: (input) => apiCreateHoliday(businessHoursId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: businessHoursQueryKeys.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: businessHoursQueryKeys.detail(businessHoursId) });
		},
	});
}

export function useDeleteHolidayMutation(businessHoursId: string, workspaceId: string) {
	const queryClient = useQueryClient();
	return useMutation<void, Error, string>({
		mutationFn: (holidayId) => apiDeleteHoliday(holidayId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: businessHoursQueryKeys.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: businessHoursQueryKeys.detail(businessHoursId) });
		},
	});
}
