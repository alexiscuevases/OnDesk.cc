import { jsonOk, jsonError } from "../../../../_lib/response";
import {
	createProductActions,
	findProductActions,
	findProductById,
	getWorkspaceMemberRole,
} from "../../../../_lib/db";
import { withWorkspace } from "../../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../../_lib/http";
import { importFromCurl, importFromOpenApi, type ActionDraft } from "../../../../_lib/marketplace-import";
import { validateActionPayload, type ActionPayload } from "../../../../_lib/marketplace-validation";

const MAX_ACTIONS_PER_PRODUCT = 100;

// POST /api/marketplace/products/:id/import?workspace_id=
// body: { source: "curl" | "openapi", curl?, spec?, include?: string[], preview?: boolean }
//
// Registering dozens of endpoints by hand is the slow part of building a
// connector — this reads them off a cURL command or an OpenAPI document.
// `preview: true` returns the drafts without saving so the UI can show a picker.
export const onRequest = withWorkspace<"id">(async ({ request, env, params, workspaceId, payload }) => {
	const product = await findProductById(env.DB, params.id);
	if (!product) return jsonError("Connector not found", 404);
	if (product.workspace_id !== workspaceId) {
		return jsonError("Catalog connectors cannot be modified. Duplicate it to customise it.", 403);
	}

	const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
	if (role !== "owner" && role !== "admin") {
		return jsonError("Only workspace owners and admins can import endpoints", 403);
	}

	return createMethodRouter(request.method, {
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body;

			const source = body.source === "openapi" ? "openapi" : body.source === "curl" ? "curl" : null;
			if (!source) return jsonError('source must be "curl" or "openapi"');

			const include = Array.isArray(body.include) ? body.include.filter((v): v is string => typeof v === "string") : undefined;

			const imported =
				source === "curl"
					? importFromCurl(typeof body.curl === "string" ? body.curl : "", product.base_url)
					: importFromOpenApi(body.spec, { include });

			if (imported.actions.length === 0) {
				return jsonError(imported.warnings[0] ?? "Nothing could be imported", 422);
			}

			if (body.preview === true) {
				return jsonOk({
					preview: true,
					base_url: imported.base_url,
					warnings: imported.warnings,
					actions: imported.actions,
				});
			}

			// Everything goes through the same validation as hand-written actions.
			const existing = await findProductActions(env.DB, product.id);
			const existingNames = new Set(existing.map((action) => action.name));
			const warnings = [...imported.warnings];
			const accepted: ActionPayload[] = [];
			let order = existing.length;

			for (const draft of imported.actions) {
				const unique = uniqueName(draft, existingNames);
				const validated = validateActionPayload({ ...draft, name: unique, sort_order: order });
				if (!validated.ok) {
					warnings.push(`Skipped "${draft.name}": ${validated.error}`);
					continue;
				}
				if (existing.length + accepted.length >= MAX_ACTIONS_PER_PRODUCT) {
					warnings.push(`Stopped at ${MAX_ACTIONS_PER_PRODUCT} actions — the rest were skipped.`);
					break;
				}
				existingNames.add(unique);
				accepted.push(validated.value as ActionPayload);
				order++;
			}

			if (accepted.length === 0) {
				return jsonError(warnings[0] ?? "No valid endpoints could be imported", 422);
			}

			await createProductActions(env.DB, product.id, accepted);
			const actions = await findProductActions(env.DB, product.id);

			return jsonOk({ imported: accepted.length, warnings, actions });
		},
	});
});

/** Imported names collide with hand-written ones surprisingly often. */
function uniqueName(draft: ActionDraft, taken: Set<string>): string {
	if (!taken.has(draft.name)) return draft.name;
	let suffix = 2;
	let candidate = `${draft.name.slice(0, 58)}_${suffix}`;
	while (taken.has(candidate)) {
		suffix++;
		candidate = `${draft.name.slice(0, 58)}_${suffix}`;
	}
	return candidate;
}
