import { jsonOk, jsonError } from "../../_lib/response";
import { findAllPublicProducts, findProductById } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

// GET /api/marketplace/products
export const onRequest = withAuth(async ({ request, env }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const url = new URL(request.url);
			const productId = url.searchParams.get("id");

			if (productId) {
				const product = await findProductById(env.DB, productId);
				if (!product) return jsonError("Product not found", 404);
				return jsonOk({
					...product,
					actions: JSON.parse(product.actions)
				});
			}

			const products = await findAllPublicProducts(env.DB);
			return jsonOk({ products });
		},
	});
});
