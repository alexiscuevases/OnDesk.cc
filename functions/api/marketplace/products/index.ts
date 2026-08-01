import { jsonOk, jsonCreated, jsonError } from "../../../_lib/response";
import {
	createProduct,
	findVisibleProducts,
	getWorkspaceMemberRole,
	rowToPublicProduct,
} from "../../../_lib/db";
import { withWritePermission } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";
import {
	validateAuth,
	validateBaseUrl,
	validateCategory,
	validateConfigFields,
	validateHeaderMap,
} from "../../../_lib/marketplace-validation";

// GET  /api/marketplace/products?workspace_id=  → catalog templates + own connectors
// POST /api/marketplace/products?workspace_id=  → create a custom connector
export const onRequest = withWritePermission("marketplace.manage", async ({ request, env, workspaceId, payload }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const products = await findVisibleProducts(env.DB, workspaceId);
			return jsonOk({ products });
		},

		POST: async () => {
			const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
			if (role !== "owner" && role !== "admin") {
				return jsonError("Only workspace owners and admins can create connectors", 403);
			}

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;

			const name = typeof body.name === "string" ? body.name.trim() : "";
			if (name.length < 2) return jsonError("name is required");

			const category = validateCategory(body.category);
			if (!category.ok) return jsonError(category.error);

			const baseUrl = validateBaseUrl(body.base_url);
			if (!baseUrl.ok) return jsonError(baseUrl.error);

			const configFields = validateConfigFields(body.config_fields);
			if (!configFields.ok) return jsonError(configFields.error);

			const auth = validateAuth(body.auth_type, body.auth_config, configFields.value);
			if (!auth.ok) return jsonError(auth.error);

			const defaultHeaders = validateHeaderMap(body.default_headers, "default_headers");
			if (!defaultHeaders.ok) return jsonError(defaultHeaders.error);

			const row = await createProduct(env.DB, payload.sub, {
				workspace_id: workspaceId,
				name,
				description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : null,
				logo_url: typeof body.logo_url === "string" && body.logo_url.trim() ? body.logo_url.trim() : null,
				category: category.value,
				docs_url: typeof body.docs_url === "string" && body.docs_url.trim() ? body.docs_url.trim() : null,
				base_url: baseUrl.value,
				auth_type: auth.value.auth_type,
				auth_config: auth.value.auth_config,
				config_fields: configFields.value,
				default_headers: defaultHeaders.value,
				// Publishing to the global catalog is a platform decision, not a
				// workspace one — custom connectors stay private to their workspace.
				is_public: false,
			});

			return jsonCreated({ product: rowToPublicProduct(row, [], workspaceId) });
		},
	});
});
