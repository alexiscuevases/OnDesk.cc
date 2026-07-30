import { jsonOk, jsonError } from "../../../_lib/response";
import { findWorkspaceBySlug, getWorkspaceMemberRole, updateWorkspace } from "../../../_lib/db";
import { isEntitled } from "../../../_lib/db/mirror";
import { withAuth } from "../../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";

/**
 * GET   /api/workspaces/:slug — details for a member
 * PATCH /api/workspaces/:slug — Pulse-owned settings only (owner or admin)
 *
 * Name, description, logo and membership are OnDesk's; editing them here would
 * be overwritten by the next mirror sync. The only field this endpoint writes is
 * `workspace_prompt`, which is Pulse's AI configuration and lives nowhere else.
 *
 * There is no DELETE: deleting a workspace is a control-plane action, and doing
 * it here would leave a Stripe subscription billing against nothing.
 */
export const onRequest = withAuth<"slug">(async ({ request, env, payload, params }) => {
	const userId = payload.sub;
	const slug = params.slug;

	const workspace = await findWorkspaceBySlug(env.DB, slug);
	if (!workspace) return jsonError("Workspace not found", 404);

	const memberRole = await getWorkspaceMemberRole(env.DB, workspace.id, userId);
	if (!memberRole) return jsonError("Forbidden", 403);

	if (!(await isEntitled(env.DB, workspace.id))) {
		return jsonError("This workspace does not have an active Pulse subscription", 402);
	}

	const toPublic = (w: NonNullable<typeof workspace>) => ({
		id: w.id,
		name: w.name,
		slug: w.slug,
		description: w.description,
		logo_url: w.logo_url,
		workspace_prompt: w.workspace_prompt,
		role: memberRole,
		created_at: w.created_at,
	});

	return createMethodRouter(request.method, {
		GET: () => jsonOk({ workspace: toPublic(workspace) }),

		PATCH: async () => {
			if (memberRole !== "owner" && memberRole !== "admin") {
				return jsonError("Forbidden", 403);
			}

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const { workspace_prompt: workspacePrompt } = parsed.body;
			if (workspacePrompt !== undefined && typeof workspacePrompt !== "string") {
				return jsonError("workspace_prompt must be a string");
			}
			if (workspacePrompt === undefined) {
				return jsonError(
					"Only workspace_prompt can be changed here. Rename the workspace or change its logo on OnDesk.",
				);
			}

			const trimmed = workspacePrompt.trim();
			await updateWorkspace(env.DB, workspace.id, { workspace_prompt: trimmed.length > 0 ? trimmed : null });

			const updated = await findWorkspaceBySlug(env.DB, slug);
			return jsonOk({ workspace: toPublic(updated!) });
		},
	});
});
