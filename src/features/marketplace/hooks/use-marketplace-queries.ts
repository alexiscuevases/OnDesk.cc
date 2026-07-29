import { useQuery } from "@tanstack/react-query";
import { apiGetInstalls, apiGetProducts, apiGetToolLogs } from "../api/marketplace-api";

const STALE_TIME = 1000 * 60 * 5;

export const marketplaceKeys = {
	products: (workspaceId: string) => ["marketplace", "products", workspaceId] as const,
	installs: (slug: string) => ["marketplace", "installs", slug] as const,
	logs: (workspaceId: string, workspaceProductId?: string) =>
		["marketplace", "logs", workspaceId, workspaceProductId ?? "all"] as const,
};

/** The catalog plus this workspace's own connectors. */
export function useMarketplaceProducts(workspaceId: string) {
	return useQuery({
		queryKey: marketplaceKeys.products(workspaceId),
		queryFn: () => apiGetProducts(workspaceId),
		staleTime: STALE_TIME,
		enabled: !!workspaceId,
	});
}

/** Connectors installed in this workspace, with credential status. */
export function useWorkspaceProducts(slug: string) {
	return useQuery({
		queryKey: marketplaceKeys.installs(slug),
		queryFn: () => apiGetInstalls(slug),
		staleTime: STALE_TIME,
		enabled: !!slug,
	});
}

/** Audit trail of outbound connector calls. */
export function useToolCallLogs(workspaceId: string, options: { workspaceProductId?: string; limit?: number } = {}) {
	return useQuery({
		queryKey: marketplaceKeys.logs(workspaceId, options.workspaceProductId),
		queryFn: () => apiGetToolLogs(workspaceId, options),
		staleTime: 1000 * 30,
		enabled: !!workspaceId,
	});
}
