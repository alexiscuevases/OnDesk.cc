import { jsonOk } from "../../_lib/response";
import { getUserPermissions } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";

/**
 * GET /api/me/permissions?workspace_id=
 *
 * What the caller may do in this workspace, resolved from the role ondesk
 * attached to their Pulse seat. Read-only and about yourself only: the roles
 * themselves are managed on ondesk, and asking about somebody else's permissions
 * is a question for the members screen there.
 *
 * The UI uses it to stop offering actions the API would refuse — which is what
 * the old client-side permission list was for, except that list was never
 * checked by anything on the way in.
 */
export const onRequestGet = withWorkspace(async ({ env, workspaceId, payload }) => {
	return jsonOk({ permissions: await getUserPermissions(env.DB, workspaceId, payload.sub) });
});
