import { jsonOk, jsonError } from "../../_lib/response";
import {
	findWorkspaceRoleById,
	updateWorkspaceRole,
	deleteWorkspaceRole,
	rowToPublicRole,
	isWorkspaceMember,
} from "../../_lib/db";
import { ALL_PERMISSIONS } from "../../_lib/types/roles";
import type { Permission } from "../../_lib/types";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

function validatePermissions(input: unknown): Permission[] {
	if (!Array.isArray(input)) return [];
	return input.filter((p): p is Permission => typeof p === "string" && (ALL_PERMISSIONS as string[]).includes(p));
}

export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
	const id = params.id;
	const row = await findWorkspaceRoleById(env.DB, id);
	if (!row) return jsonError("Role not found", 404);
	const member = await isWorkspaceMember(env.DB, row.workspace_id, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	return createMethodRouter(request.method, {
		GET: () => jsonOk({ role: rowToPublicRole(row) }),
		PATCH: async () => {
			if (row.is_system) return jsonError("System roles cannot be edited", 400);
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const { name, description, permissions } = parsed.body;
			await updateWorkspaceRole(env.DB, id, {
				name: typeof name === "string" ? name.trim() : undefined,
				description: typeof description === "string" ? description.trim() : description === null ? null : undefined,
				permissions: permissions !== undefined ? validatePermissions(permissions) : undefined,
			});
			const updated = await findWorkspaceRoleById(env.DB, id);
			return jsonOk({ role: updated ? rowToPublicRole(updated) : null });
		},
		DELETE: async () => {
			if (row.is_system) return jsonError("System roles cannot be deleted", 400);
			await deleteWorkspaceRole(env.DB, id);
			return jsonOk({ success: true });
		},
	});
});
