import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";
import {
  findWorkspaceMembers,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  isWorkspaceMember,
  getWorkspaceMemberRole,
} from "../../_lib/db";

const VALID_ROLES = ["owner", "admin", "agent"];

// GET  /api/users?workspace_id=   — list workspace members
// PATCH /api/users?workspace_id=&user_id=  — update role
// DELETE /api/users?workspace_id=&user_id= — remove member
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspace_id");
  if (!workspaceId) return jsonError("workspace_id is required");

  const member = await isWorkspaceMember(env.DB, workspaceId, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

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
};
