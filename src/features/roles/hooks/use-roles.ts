import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	apiGetRoles,
	apiCreateRole,
	apiUpdateRole,
	apiDeleteRole,
	type CreateRoleInput,
	type UpdateRoleInput,
} from "../api/roles-api";

export const rolesQueryKeys = {
	all: (workspaceId: string) => ["roles", workspaceId] as const,
};

export function useRoles(workspaceId: string) {
	return useQuery({
		queryKey: rolesQueryKeys.all(workspaceId),
		queryFn: () => apiGetRoles(workspaceId),
		staleTime: 1000 * 60,
	});
}

export function useCreateRoleMutation(workspaceId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateRoleInput) => apiCreateRole(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: rolesQueryKeys.all(workspaceId) }),
	});
}

export function useUpdateRoleMutation(roleId: string, workspaceId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateRoleInput) => apiUpdateRole(roleId, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: rolesQueryKeys.all(workspaceId) }),
	});
}

export function useDeleteRoleMutation(workspaceId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiDeleteRole(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: rolesQueryKeys.all(workspaceId) }),
	});
}
