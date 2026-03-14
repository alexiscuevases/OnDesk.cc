import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/crud-api";
import type { PublicWorkspaceProduct } from "../../../../functions/_lib/types";

export const useWorkspaceProducts = (slug: string) => {
	return useQuery({
		queryKey: ["workspaces", slug, "products"],
		queryFn: async () => {
			const res = await apiFetch(`/api/workspaces/${slug}/products`);
			if (!res.ok) throw new Error("Failed to fetch workspace products");
			const data = await res.json();
			return data.products as PublicWorkspaceProduct[];
		},
		enabled: !!slug,
	});
};

export const useInstallProduct = (slug: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (productId: string) => {
			const res = await apiFetch(`/api/workspaces/${slug}/products`, {
				method: "POST",
				body: JSON.stringify({ productId }),
			});
			if (!res.ok) throw new Error("Failed to install product");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workspaces", slug, "products"] });
		},
	});
};

export const useUpdateProductConfig = (slug: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ workspaceProductId, configuration }: { workspaceProductId: string; configuration: Record<string, any> }) => {
			const res = await apiFetch(`/api/workspaces/${slug}/products`, {
				method: "PATCH",
				body: JSON.stringify({ workspaceProductId, configuration }),
			});
			if (!res.ok) throw new Error("Failed to update product configuration");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workspaces", slug, "products"] });
		},
	});
};
