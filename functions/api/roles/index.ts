import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import {
	findWorkspaceRolesByWorkspace,
	createWorkspaceRole,
	findWorkspaceRoleByKey,
	rowToPublicRole,
	getUserPermissions,
} from "../../_lib/db";
import type { Permission } from "../../_lib/types";
import { ALL_PERMISSIONS } from "../../_lib/types/roles";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

function slugifyKey(input: string): string {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, 40);
}

function validatePermissions(input: unknown): Permission[] {
	if (!Array.isArray(input)) return [];
	return input.filter((p): p is Permission => typeof p === "string" && (ALL_PERMISSIONS as string[]).includes(p));
}

// GET  /api/roles?workspace_id=
// POST /api/roles?workspace_id=
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const [roles, perms] = await Promise.all([
				findWorkspaceRolesByWorkspace(env.DB, workspaceId),
				getUserPermissions(env.DB, workspaceId, payload.sub),
			]);
			return jsonOk({ roles, current_user_permissions: perms, available_permissions: ALL_PERMISSIONS });
		},
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const { name, description, permissions, key } = parsed.body;
			if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");
			const slug = typeof key === "string" && key.trim().length > 0 ? slugifyKey(key) : slugifyKey(name);
			if (!slug) return jsonError("Invalid role key");
			const existing = await findWorkspaceRoleByKey(env.DB, workspaceId, slug);
			if (existing) return jsonError("A role with that key already exists", 409);

			const row = await createWorkspaceRole(env.DB, workspaceId, {
				key: slug,
				name: name.trim(),
				description: typeof description === "string" ? description.trim() : null,
				permissions: validatePermissions(permissions),
			});
			return jsonCreated({ role: rowToPublicRole(row) });
		},
	});
});
