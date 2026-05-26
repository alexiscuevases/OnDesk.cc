import { createWorkspaceScopedQueryHooks } from "@/lib/crud-hooks";
import { apiGetKbCategories, apiGetKbArticles, apiGetKbArticle } from "../api/kb-api";
import type { KbCategory } from "../api/kb-api";
import { useQuery } from "@tanstack/react-query";

const STALE = 1000 * 60 * 2;

export const kbCategoryQueryKeys = {
	all: (workspaceId: string) => ["kb-categories", workspaceId] as const,
};

export function useKbCategories(workspaceId: string) {
	return useQuery<KbCategory[]>({
		queryKey: kbCategoryQueryKeys.all(workspaceId),
		queryFn: () => apiGetKbCategories(workspaceId),
		staleTime: STALE,
	});
}

const { queryKeys, useAll, useById } = createWorkspaceScopedQueryHooks(
	"kb-articles",
	{ getAll: apiGetKbArticles, getById: apiGetKbArticle },
);

export const kbArticleQueryKeys = queryKeys;
export const useKbArticles = useAll;
export const useKbArticle = useById;
