import { jsonOk } from "../../_lib/response";
import { findWorkspaceMembers } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

// GET /api/users?workspace_id= — list workspace members
//
// Read-only. This used to expose PATCH (change role) and DELETE (remove member),
// both of which wrote `workspace_members` directly. That table is a mirror of
// ondesk and only mirror.ts may write it, so those handlers reported success and
// were then silently reverted by the next mirror event or reconcile pass.
// Membership is changed on ondesk: PATCH/DELETE /api/workspaces/:id/members.
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			// No field to strip any more: the mirrored users table holds no secrets.
			const users = await findWorkspaceMembers(env.DB, workspaceId);
			return jsonOk({ users });
		},
	});
});
