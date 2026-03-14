import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/crud-api";
import type { PublicProduct } from "../../../../functions/_lib/types";

export const useMarketplaceProducts = (slug: string) => {
	return useQuery({
		queryKey: ["marketplace", "products", slug],
		queryFn: async () => {
			const res = await apiFetch(`/api/marketplace/products?workspace_slug=${slug}`);
			if (!res.ok) throw new Error("Failed to fetch marketplace products");
			const data = await res.json();
			return data.products as PublicProduct[];
		},
		enabled: !!slug,
	});
};
