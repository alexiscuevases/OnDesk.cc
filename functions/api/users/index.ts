import { jsonOk, jsonError } from "../../_lib/response";
import {
  findWorkspaceMembers,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  getWorkspaceMemberRole,
} from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";

const VALID_ROLES = ["owner", "admin", "agent"];

// GET  /api/users?workspace_id=   — list workspace members
// PATCH /api/users?workspace_id=&user_id=  — update role
// DELETE /api/users?workspace_id=&user_id= — remove member
export const onRequest = withWorkspace(async ({ request, env, payload, workspaceId }) => {
  const url = new URL(request.url);

  if (request.method === "GET") {
    const members = await findWorkspaceMembers(env.DB, workspaceId);
    const users = members.map(({ password_hash: _ph, ...u }) => u);
    return jsonOk({ users });
  }

  if (request.method === "PATCH") {
    const callerRole = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
    if (callerRole !== "owner" && callerRole !== "admin") return jsonError("Forbidden", 403);

    const userId = url.searchParams.get("user_id");
    if (!userId) return jsonError("user_id is required");

    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { role } = body as Record<string, unknown>;
    if (typeof role !== "string" || !VALID_ROLES.includes(role)) {
      return jsonError(`role must be one of: ${VALID_ROLES.join(", ")}`);
    }
    // Prevent non-owners from assigning owner role
    if (role === "owner" && callerRole !== "owner") return jsonError("Only owners can assign the owner role", 403);

    await updateWorkspaceMemberRole(env.DB, workspaceId, userId, role);
    return jsonOk({ success: true });
  }

  if (request.method === "DELETE") {
    const callerRole = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
    if (callerRole !== "owner" && callerRole !== "admin") return jsonError("Forbidden", 403);

    const userId = url.searchParams.get("user_id");
    if (!userId) return jsonError("user_id is required");
    if (userId === payload.sub) return jsonError("Cannot remove yourself from the workspace");

    await removeWorkspaceMember(env.DB, workspaceId, userId);
    return jsonOk({ success: true });
  }

  return jsonError("Method not allowed", 405);
});
