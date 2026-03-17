import { jsonOk, jsonError } from "../../../_lib/response";
import { findWorkspaceBySlug, findWorkspaceProducts, getWorkspaceMemberRole, installProduct, updateWorkspaceProductConfig } from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";

// GET    /api/workspaces/:slug/products
// POST   /api/workspaces/:slug/products (install)
// PATCH  /api/workspaces/:slug/products (configure)
export const onRequest = withAuth<"slug">(async ({ request, env, payload, params }): Promise<Response> => {
	const userId = payload.sub;
	const slug = params.slug;

	const workspace = await findWorkspaceBySlug(env.DB, slug);
	if (!workspace) return jsonError("Workspace not found", 404);

	const memberRole = await getWorkspaceMemberRole(env.DB, workspace.id, userId);
	if (!memberRole) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: async () => {
			const products = await findWorkspaceProducts(env.DB, workspace.id);
			return jsonOk({ products });
		},
		POST: async () => {
			if (memberRole !== "owner" && memberRole !== "admin") {
				return jsonError("Only workspace owners and admins can manage products", 403);
			}

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const { productId } = parsed.body;
			if (!productId || typeof productId !== "string") return jsonError("Product ID is required");

			await installProduct(env.DB, workspace.id, productId);
			return jsonOk({ success: true });
		},
		PATCH: async () => {
			if (memberRole !== "owner" && memberRole !== "admin") {
				return jsonError("Only workspace owners and admins can manage products", 403);
			}

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const { workspaceProductId, configuration } = parsed.body;
			if (
				!workspaceProductId ||
				typeof workspaceProductId !== "string" ||
				!configuration ||
				typeof configuration !== "object"
			) {
				return jsonError("Workspace Product ID and configuration are required");
			}

			await updateWorkspaceProductConfig(env.DB, workspaceProductId, configuration as Record<string, any>);
			return jsonOk({ success: true });
		},
	});
});
