import { apiFetch } from "@/lib/crud-api";
import type {
	ActionParameter,
	AuthConfig,
	AuthType,
	ConfigField,
	ProductCategory,
	PublicProduct,
	PublicProductAction,
	PublicWorkspaceProduct,
	ToolCallLogRow,
	ToolCallResult,
} from "../../../../functions/_lib/types";

export type {
	ActionParameter,
	AuthConfig,
	AuthType,
	ConfigField,
	ProductCategory,
	PublicProduct,
	PublicProductAction,
	PublicWorkspaceProduct,
	ToolCallLogRow,
	ToolCallResult,
};

async function request<T>(url: string, options: RequestInit = {}, errorMessage = "Request failed"): Promise<T> {
	const res = await apiFetch(url, {
		...options,
		headers: options.body ? { "Content-Type": "application/json", ...options.headers } : options.headers,
	});
	const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
	if (!res.ok) throw new Error(data?.error ?? errorMessage);
	return data as T;
}

// ─── Catalog + custom connectors ──────────────────────────────────────────────

export async function apiGetProducts(workspaceId: string): Promise<PublicProduct[]> {
	const data = await request<{ products: PublicProduct[] }>(
		`/api/marketplace/products?workspace_id=${workspaceId}`,
		{},
		"Failed to load connectors",
	);
	return data.products;
}

export async function apiGetProduct(workspaceId: string, productId: string): Promise<PublicProduct> {
	const data = await request<{ product: PublicProduct }>(
		`/api/marketplace/products/${productId}?workspace_id=${workspaceId}`,
		{},
		"Connector not found",
	);
	return data.product;
}

export interface ConnectorInput {
	name: string;
	description: string | null;
	logo_url?: string | null;
	category: ProductCategory;
	docs_url: string | null;
	base_url: string;
	auth_type: AuthType;
	auth_config: AuthConfig;
	config_fields: ConfigField[];
	default_headers: Record<string, string>;
}

export async function apiCreateProduct(workspaceId: string, input: ConnectorInput): Promise<PublicProduct> {
	const data = await request<{ product: PublicProduct }>(
		`/api/marketplace/products?workspace_id=${workspaceId}`,
		{ method: "POST", body: JSON.stringify(input) },
		"Failed to create connector",
	);
	return data.product;
}

export async function apiUpdateProduct(
	workspaceId: string,
	productId: string,
	input: Partial<ConnectorInput>,
): Promise<PublicProduct> {
	const data = await request<{ product: PublicProduct }>(
		`/api/marketplace/products/${productId}?workspace_id=${workspaceId}`,
		{ method: "PATCH", body: JSON.stringify(input) },
		"Failed to update connector",
	);
	return data.product;
}

export async function apiDeleteProduct(workspaceId: string, productId: string): Promise<void> {
	await request(
		`/api/marketplace/products/${productId}?workspace_id=${workspaceId}`,
		{ method: "DELETE" },
		"Failed to delete connector",
	);
}

// ─── Registered endpoints (actions) ───────────────────────────────────────────

export interface ActionInput {
	name: string;
	description: string;
	method: PublicProductAction["method"];
	path: string;
	content_type: PublicProductAction["content_type"];
	parameters: ActionParameter[];
	headers: Record<string, string>;
	response_path: string | null;
	requires_confirmation: boolean;
	is_read_only: boolean;
	enabled: boolean;
}

export async function apiCreateAction(
	workspaceId: string,
	productId: string,
	input: ActionInput,
): Promise<PublicProductAction> {
	const data = await request<{ action: PublicProductAction }>(
		`/api/marketplace/products/${productId}/actions?workspace_id=${workspaceId}`,
		{ method: "POST", body: JSON.stringify(input) },
		"Failed to register endpoint",
	);
	return data.action;
}

export async function apiUpdateAction(
	workspaceId: string,
	productId: string,
	actionId: string,
	input: Partial<ActionInput>,
): Promise<PublicProductAction> {
	const data = await request<{ action: PublicProductAction }>(
		`/api/marketplace/products/${productId}/actions/${actionId}?workspace_id=${workspaceId}`,
		{ method: "PATCH", body: JSON.stringify(input) },
		"Failed to update endpoint",
	);
	return data.action;
}

export async function apiDeleteAction(workspaceId: string, productId: string, actionId: string): Promise<void> {
	await request(
		`/api/marketplace/products/${productId}/actions/${actionId}?workspace_id=${workspaceId}`,
		{ method: "DELETE" },
		"Failed to delete endpoint",
	);
}

export interface ImportPayload {
	source: "curl" | "openapi";
	curl?: string;
	spec?: unknown;
	include?: string[];
	preview?: boolean;
}

/** Previewed endpoints are drafts — they have no id until they are saved. */
export type ImportedAction = Omit<PublicProductAction, "id"> & { id?: string };

export interface ImportResponse {
	preview?: boolean;
	base_url?: string | null;
	imported?: number;
	warnings: string[];
	actions: ImportedAction[];
}

export async function apiImportActions(
	workspaceId: string,
	productId: string,
	payload: ImportPayload,
): Promise<ImportResponse> {
	return request<ImportResponse>(
		`/api/marketplace/products/${productId}/import?workspace_id=${workspaceId}`,
		{ method: "POST", body: JSON.stringify(payload) },
		"Import failed",
	);
}

// ─── Installs ─────────────────────────────────────────────────────────────────

export async function apiGetInstalls(slug: string): Promise<PublicWorkspaceProduct[]> {
	const data = await request<{ products: PublicWorkspaceProduct[] }>(
		`/api/workspaces/${slug}/products`,
		{},
		"Failed to load installed connectors",
	);
	return data.products;
}

export async function apiInstallProduct(slug: string, productId: string): Promise<PublicWorkspaceProduct> {
	const data = await request<{ product: PublicWorkspaceProduct }>(
		`/api/workspaces/${slug}/products`,
		{ method: "POST", body: JSON.stringify({ productId }) },
		"Failed to install connector",
	);
	return data.product;
}

export async function apiUpdateInstall(
	slug: string,
	input: { workspaceProductId: string; config?: Record<string, string>; status?: "enabled" | "disabled" },
): Promise<PublicWorkspaceProduct> {
	const data = await request<{ product: PublicWorkspaceProduct }>(
		`/api/workspaces/${slug}/products`,
		{ method: "PATCH", body: JSON.stringify(input) },
		"Failed to update connector",
	);
	return data.product;
}

export async function apiUninstallProduct(slug: string, workspaceProductId: string): Promise<void> {
	await request(
		`/api/workspaces/${slug}/products?workspaceProductId=${workspaceProductId}`,
		{ method: "DELETE" },
		"Failed to uninstall connector",
	);
}

// ─── Run / audit ──────────────────────────────────────────────────────────────

export async function apiRunAction(
	workspaceId: string,
	input: { workspaceProductId: string; actionName: string; params?: Record<string, unknown>; confirm?: boolean },
): Promise<ToolCallResult> {
	const data = await request<{ result: ToolCallResult }>(
		`/api/marketplace/run?workspace_id=${workspaceId}`,
		{ method: "POST", body: JSON.stringify(input) },
		"Failed to run action",
	);
	return data.result;
}

export async function apiGetToolLogs(
	workspaceId: string,
	options: { workspaceProductId?: string; limit?: number } = {},
): Promise<ToolCallLogRow[]> {
	const params = new URLSearchParams({ workspace_id: workspaceId });
	if (options.workspaceProductId) params.set("workspace_product_id", options.workspaceProductId);
	if (options.limit) params.set("limit", String(options.limit));

	const data = await request<{ logs: ToolCallLogRow[] }>(
		`/api/marketplace/logs?${params.toString()}`,
		{},
		"Failed to load activity",
	);
	return data.logs;
}
