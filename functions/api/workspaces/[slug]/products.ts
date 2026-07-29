import { jsonOk, jsonError } from "../../../_lib/response";
import {
	findProductById,
	findWorkspaceBySlug,
	findWorkspaceProductDetail,
	findWorkspaceProductRow,
	findWorkspaceProducts,
	getWorkspaceMemberRole,
	installProduct,
	saveWorkspaceProductConfig,
	setWorkspaceProductStatus,
	uninstallProduct,
} from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import { credentialsSecret } from "../../../_lib/tool-runner";
import { validateConfigFields } from "../../../_lib/marketplace-validation";
import type { WorkspaceProductRow } from "../../../_lib/types";

/** Stored connector JSON is written by validated code paths — never 500 if it isn't. */
function safeParse<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback;
	try {
		return (JSON.parse(raw) ?? fallback) as T;
	} catch {
		return fallback;
	}
}

// GET    /api/workspaces/:slug/products                     → installed connectors
// POST   /api/workspaces/:slug/products                     → install { productId }
// PATCH  /api/workspaces/:slug/products                     → configure / enable / disable
// DELETE /api/workspaces/:slug/products?workspaceProductId=  → uninstall
export const onRequest = withAuth<"slug">(async ({ request, env, payload, params }): Promise<Response> => {
	const userId = payload.sub;
	const slug = params.slug;

	const workspace = await findWorkspaceBySlug(env.DB, slug);
	if (!workspace) return jsonError("Workspace not found", 404);

	const memberRole = await getWorkspaceMemberRole(env.DB, workspace.id, userId);
	if (!memberRole) return jsonError("Forbidden", 403);

	const canManage = memberRole === "owner" || memberRole === "admin";
	const manageError = () => jsonError("Only workspace owners and admins can manage connectors", 403);

	/** Installs are addressed by id, so ownership must be checked every time. */
	const requireInstall = async (
		workspaceProductId: unknown,
	): Promise<{ ok: true; row: WorkspaceProductRow } | { ok: false; response: Response }> => {
		if (!workspaceProductId || typeof workspaceProductId !== "string") {
			return { ok: false, response: jsonError("workspaceProductId is required") };
		}
		const row = await findWorkspaceProductRow(env.DB, workspaceProductId);
		if (!row || row.workspace_id !== workspace.id) {
			return { ok: false, response: jsonError("Installed connector not found", 404) };
		}
		return { ok: true, row };
	};

	return createMethodRouter(request.method, {
		GET: async () => {
			const products = await findWorkspaceProducts(env.DB, workspace.id, credentialsSecret(env));
			return jsonOk({ products });
		},

		POST: async () => {
			if (!canManage) return manageError();

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const { productId } = parsed.body;
			if (!productId || typeof productId !== "string") return jsonError("productId is required");

			const product = await findProductById(env.DB, productId);
			if (!product) return jsonError("Connector not found", 404);

			const installable = product.workspace_id === workspace.id || (product.is_public === 1 && product.workspace_id === null);
			if (!installable) return jsonError("Connector not available for this workspace", 403);

			const workspaceProductId = await installProduct(env.DB, workspace.id, productId);
			const installed = await findWorkspaceProductDetail(env.DB, workspaceProductId, credentialsSecret(env));
			return jsonOk({ product: installed });
		},

		PATCH: async () => {
			if (!canManage) return manageError();

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;

			const found = await requireInstall(body.workspaceProductId);
			if (!found.ok) return found.response;
			const install = found.row;

			if (body.status !== undefined) {
				if (body.status !== "enabled" && body.status !== "disabled") {
					return jsonError('status must be "enabled" or "disabled"');
				}
				await setWorkspaceProductStatus(env.DB, install.id, body.status);
			}

			const rawConfig = body.config;
			if (rawConfig !== undefined) {
				if (!rawConfig || typeof rawConfig !== "object" || Array.isArray(rawConfig)) {
					return jsonError("config must be an object of field key → value");
				}

				const product = await findProductById(env.DB, install.product_id);
				if (!product) return jsonError("Connector not found", 404);

				const fields = validateConfigFields(safeParse(product.config_fields, []));
				const declared = fields.ok ? fields.value : [];
				const allowedKeys = new Set(declared.map((f) => f.key));

				const values: Record<string, string> = {};
				for (const [key, value] of Object.entries(rawConfig as Record<string, unknown>)) {
					if (!allowedKeys.has(key)) return jsonError(`"${key}" is not a configuration field of this connector`);
					if (typeof value !== "string") return jsonError(`"${key}" must be a string`);
					values[key] = value.trim();
				}

				await saveWorkspaceProductConfig(env.DB, credentialsSecret(env), install.id, values, declared);
			}

			const updated = await findWorkspaceProductDetail(env.DB, install.id, credentialsSecret(env));
			return jsonOk({ product: updated });
		},

		DELETE: async () => {
			if (!canManage) return manageError();

			const url = new URL(request.url);
			const found = await requireInstall(url.searchParams.get("workspaceProductId"));
			if (!found.ok) return found.response;

			// Cascades to agent_tools, so agents lose the tool immediately.
			await uninstallProduct(env.DB, found.row.id);
			return jsonOk({ success: true });
		},
	});
});
