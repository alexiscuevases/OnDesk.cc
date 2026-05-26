import { createWorkspaceScopedMutationHooks } from "@/lib/crud-hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	apiCreateKbCategory,
	apiUpdateKbCategory,
	apiDeleteKbCategory,
	apiCreateKbArticle,
	apiUpdateKbArticle,
	apiDeleteKbArticle,
	type CreateKbCategoryInput,
	type UpdateKbCategoryInput,
	type CreateKbArticleInput,
	type UpdateKbArticleInput,
} from "../api/kb-api";
import { kbArticleQueryKeys, kbCategoryQueryKeys } from "./use-kb-queries";

// ── Categories ───────────────────────────────────────────────────────────────

export function useCreateKbCategoryMutation(workspaceId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateKbCategoryInput) => apiCreateKbCategory(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: kbCategoryQueryKeys.all(workspaceId) }),
	});
}

export function useUpdateKbCategoryMutation(categoryId: string, workspaceId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateKbCategoryInput) => apiUpdateKbCategory(categoryId, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: kbCategoryQueryKeys.all(workspaceId) }),
	});
}

export function useDeleteKbCategoryMutation(workspaceId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiDeleteKbCategory(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: kbCategoryQueryKeys.all(workspaceId) }),
	});
}

// ── Articles ─────────────────────────────────────────────────────────────────

const { useCreate, useUpdate, useDelete } = createWorkspaceScopedMutationHooks<
	unknown,
	CreateKbArticleInput,
	UpdateKbArticleInput
>(kbArticleQueryKeys, {
	create: apiCreateKbArticle,
	update: apiUpdateKbArticle,
	delete: apiDeleteKbArticle,
});

export const useCreateKbArticleMutation = useCreate;
export const useUpdateKbArticleMutation = useUpdate;
export const useDeleteKbArticleMutation = useDelete;
