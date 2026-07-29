import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	apiCreateAction,
	apiCreateProduct,
	apiDeleteAction,
	apiDeleteProduct,
	apiImportActions,
	apiInstallProduct,
	apiRunAction,
	apiUninstallProduct,
	apiUpdateAction,
	apiUpdateInstall,
	apiUpdateProduct,
	type ActionInput,
	type ConnectorInput,
	type ImportPayload,
} from "../api/marketplace-api";
import { marketplaceKeys } from "./use-marketplace-queries";

/** Connector definitions and installs are shown side by side — refresh both. */
function useInvalidateMarketplace(workspaceId: string, slug: string) {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: marketplaceKeys.products(workspaceId) });
		queryClient.invalidateQueries({ queryKey: marketplaceKeys.installs(slug) });
	};
}

// ─── Connectors ───────────────────────────────────────────────────────────────

export function useCreateConnector(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: (input: ConnectorInput) => apiCreateProduct(workspaceId, input),
		onSuccess: invalidate,
	});
}

export function useUpdateConnector(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: ({ productId, input }: { productId: string; input: Partial<ConnectorInput> }) =>
			apiUpdateProduct(workspaceId, productId, input),
		onSuccess: invalidate,
	});
}

export function useDeleteConnector(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: (productId: string) => apiDeleteProduct(workspaceId, productId),
		onSuccess: invalidate,
	});
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export function useCreateAction(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: ({ productId, input }: { productId: string; input: ActionInput }) =>
			apiCreateAction(workspaceId, productId, input),
		onSuccess: invalidate,
	});
}

export function useUpdateAction(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: ({ productId, actionId, input }: { productId: string; actionId: string; input: Partial<ActionInput> }) =>
			apiUpdateAction(workspaceId, productId, actionId, input),
		onSuccess: invalidate,
	});
}

export function useDeleteAction(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: ({ productId, actionId }: { productId: string; actionId: string }) =>
			apiDeleteAction(workspaceId, productId, actionId),
		onSuccess: invalidate,
	});
}

export function useImportActions(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: ({ productId, payload }: { productId: string; payload: ImportPayload }) =>
			apiImportActions(workspaceId, productId, payload),
		onSuccess: (_data, variables) => {
			// Previews change nothing server-side.
			if (!variables.payload.preview) invalidate();
		},
	});
}

// ─── Installs ─────────────────────────────────────────────────────────────────

export function useInstallProduct(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: (productId: string) => apiInstallProduct(slug, productId),
		onSuccess: invalidate,
	});
}

export function useUpdateInstall(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: (input: {
			workspaceProductId: string;
			config?: Record<string, string>;
			status?: "enabled" | "disabled";
		}) => apiUpdateInstall(slug, input),
		onSuccess: invalidate,
	});
}

export function useUninstallProduct(workspaceId: string, slug: string) {
	const invalidate = useInvalidateMarketplace(workspaceId, slug);
	return useMutation({
		mutationFn: (workspaceProductId: string) => apiUninstallProduct(slug, workspaceProductId),
		onSuccess: invalidate,
	});
}

// ─── Manual runs ──────────────────────────────────────────────────────────────

export function useRunAction(workspaceId: string, slug: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: {
			workspaceProductId: string;
			actionName: string;
			params?: Record<string, unknown>;
			confirm?: boolean;
		}) => apiRunAction(workspaceId, input),
		onSuccess: () => {
			// A run updates the connector's last-test status and the audit log.
			queryClient.invalidateQueries({ queryKey: marketplaceKeys.installs(slug) });
			queryClient.invalidateQueries({ queryKey: ["marketplace", "logs", workspaceId] });
		},
	});
}
