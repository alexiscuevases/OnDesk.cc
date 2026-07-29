import { jsonOk, jsonError } from "../../../../_lib/response";
import {
	deleteProduct,
	findProductById,
	findProductWithActions,
	getWorkspaceMemberRole,
	updateProduct,
} from "../../../../_lib/db";
import { withWorkspace } from "../../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../../_lib/http";
import {
	validateAuth,
	validateBaseUrl,
	validateCategory,
	validateConfigFields,
	validateHeaderMap,
} from "../../../../_lib/marketplace-validation";
import type { ConfigField } from "../../../../_lib/types";

/** Stored connector JSON is written by validated code paths — never 500 if it isn't. */
function safeParse<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback;
	try {
		return (JSON.parse(raw) ?? fallback) as T;
	} catch {
		return fallback;
	}
}

// GET    /api/marketplace/products/:id?workspace_id=
// PATCH  /api/marketplace/products/:id?workspace_id=  (own connectors only)
// DELETE /api/marketplace/products/:id?workspace_id=  (own connectors only)
export const onRequest = withWorkspace<"id">(async ({ request, env, params, workspaceId, payload }) => {
	const productId = params.id;

	const row = await findProductById(env.DB, productId);
	if (!row) return jsonError("Connector not found", 404);

	const isVisible = row.workspace_id === workspaceId || (row.is_public === 1 && row.workspace_id === null);
	if (!isVisible) return jsonError("Connector not found", 404);

	const isOwn = row.workspace_id === workspaceId;

	const requireEditor = async (): Promise<Response | null> => {
		if (!isOwn) return jsonError("Catalog connectors cannot be modified. Duplicate it to customise it.", 403);
		const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
		if (role !== "owner" && role !== "admin") {
			return jsonError("Only workspace owners and admins can modify connectors", 403);
		}
		return null;
	};

	return createMethodRouter(request.method, {
		GET: async () => {
			const product = await findProductWithActions(env.DB, productId, workspaceId);
			return jsonOk({ product });
		},

		PATCH: async () => {
			const denied = await requireEditor();
			if (denied) return denied;

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;

			const updates: Parameters<typeof updateProduct>[2] = {};

			if (body.name !== undefined) {
				const name = typeof body.name === "string" ? body.name.trim() : "";
				if (name.length < 2) return jsonError("name is required");
				updates.name = name;
			}
			if (body.description !== undefined) {
				updates.description = typeof body.description === "string" && body.description.trim() ? body.description.trim() : null;
			}
			if (body.logo_url !== undefined) {
				updates.logo_url = typeof body.logo_url === "string" && body.logo_url.trim() ? body.logo_url.trim() : null;
			}
			if (body.docs_url !== undefined) {
				updates.docs_url = typeof body.docs_url === "string" && body.docs_url.trim() ? body.docs_url.trim() : null;
			}
			if (body.category !== undefined) {
				const category = validateCategory(body.category);
				if (!category.ok) return jsonError(category.error);
				updates.category = category.value;
			}
			if (body.base_url !== undefined) {
				const baseUrl = validateBaseUrl(body.base_url);
				if (!baseUrl.ok) return jsonError(baseUrl.error);
				updates.base_url = baseUrl.value;
			}
			if (body.default_headers !== undefined) {
				const headers = validateHeaderMap(body.default_headers, "default_headers");
				if (!headers.ok) return jsonError(headers.error);
				updates.default_headers = headers.value;
			}

			// Auth references config field keys, so both are validated together —
			// even when only one of them was sent.
			if (body.config_fields !== undefined || body.auth_type !== undefined || body.auth_config !== undefined) {
				let fields: ConfigField[];
				if (body.config_fields !== undefined) {
					const validated = validateConfigFields(body.config_fields);
					if (!validated.ok) return jsonError(validated.error);
					fields = validated.value;
					updates.config_fields = fields;
				} else {
					const existing = validateConfigFields(safeParse<unknown[]>(row.config_fields, []));
					fields = existing.ok ? existing.value : [];
				}

				const auth = validateAuth(
					body.auth_type ?? row.auth_type,
					body.auth_config ?? safeParse<Record<string, unknown>>(row.auth_config, { type: "none" }),
					fields,
				);
				if (!auth.ok) return jsonError(auth.error);
				updates.auth_type = auth.value.auth_type;
				updates.auth_config = auth.value.auth_config;
			}

			await updateProduct(env.DB, productId, updates);
			const product = await findProductWithActions(env.DB, productId, workspaceId);
			return jsonOk({ product });
		},

		DELETE: async () => {
			const denied = await requireEditor();
			if (denied) return denied;

			// Cascades to product_actions and every workspace install of it.
			await deleteProduct(env.DB, productId);
			return jsonOk({ success: true });
		},
	});
});
