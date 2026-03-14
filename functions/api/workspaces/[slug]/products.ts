import { jsonOk, jsonError } from "../../../_lib/response";
import { findWorkspaceBySlug, findWorkspaceProducts, getWorkspaceMemberRole, installProduct, updateWorkspaceProductConfig } from "../../../_lib/db";
import { withAuth } from "../../../_lib/middleware";

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

	if (request.method === "GET") {
		const products = await findWorkspaceProducts(env.DB, workspace.id);
		return jsonOk({ products });
	}

	if (memberRole !== "owner" && memberRole !== "admin") {
		return jsonError("Only workspace owners and admins can manage products", 403);
	}

	if (request.method === "POST") {
		const { productId } = await request.json() as { productId: string };
		if (!productId) return jsonError("Product ID is required");
		
		await installProduct(env.DB, workspace.id, productId);
		return jsonOk({ success: true });
	}

	if (request.method === "PATCH") {
		const { workspaceProductId, configuration } = await request.json() as { workspaceProductId: string; configuration: Record<string, any> };
		if (!workspaceProductId || !configuration) return jsonError("Workspace Product ID and configuration are required");

		await updateWorkspaceProductConfig(env.DB, workspaceProductId, configuration);
		return jsonOk({ success: true });
	}

	return jsonError("Method not allowed", 405);
});
