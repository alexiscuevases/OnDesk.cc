import { jsonOk, jsonError } from "../../_lib/response";
import {
  findTeamById, updateTeam, deleteTeam,
  findTeamMembers, addTeamMember, removeTeamMember,
  isWorkspaceMember, getWorkspaceMemberRole,
} from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";

// GET    /api/teams/:id
// PATCH  /api/teams/:id
// DELETE /api/teams/:id
// GET    /api/teams/:id?members=true  — list team members
// POST   /api/teams/:id?action=add_member&user_id=
// POST   /api/teams/:id?action=remove_member&user_id=
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
  const teamId = params.id;
  const team = await findTeamById(env.DB, teamId);
  if (!team) return jsonError("Team not found", 404);

  const member = await isWorkspaceMember(env.DB, team.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  const url = new URL(request.url);

  if (request.method === "GET") {
    if (url.searchParams.get("members") === "true") {
      const members = await findTeamMembers(env.DB, teamId);
      return jsonOk({ members });
    }
    return jsonOk({ team });
  }

  if (request.method === "PATCH") {
    const role = await getWorkspaceMemberRole(env.DB, team.workspace_id, payload.sub);
    if (role !== "owner" && role !== "admin") return jsonError("Forbidden", 403);

    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, description, leader_id, logo_url } = body as Record<string, unknown>;
    await updateTeam(env.DB, teamId, {
      name: typeof name === "string" ? name.trim() : undefined,
      description: typeof description === "string" ? description.trim() : undefined,
      leader_id: typeof leader_id === "string" ? leader_id : undefined,
      logo_url: typeof logo_url === "string" ? logo_url.trim() || undefined : undefined,
    });
    const updated = await findTeamById(env.DB, teamId);
    return jsonOk({ team: updated });
  }

  if (request.method === "DELETE") {
    const role = await getWorkspaceMemberRole(env.DB, team.workspace_id, payload.sub);
    if (role !== "owner" && role !== "admin") return jsonError("Forbidden", 403);
    await deleteTeam(env.DB, teamId);
    return jsonOk({ success: true });
  }

  if (request.method === "POST") {
    const role = await getWorkspaceMemberRole(env.DB, team.workspace_id, payload.sub);
    if (role !== "owner" && role !== "admin") return jsonError("Forbidden", 403);

    const action = url.searchParams.get("action");
    const userId = url.searchParams.get("user_id");
    if (!userId) return jsonError("user_id is required");

    if (action === "add_member") {
      await addTeamMember(env.DB, teamId, userId);
      return jsonOk({ success: true });
    }
    if (action === "remove_member") {
      await removeTeamMember(env.DB, teamId, userId);
      return jsonOk({ success: true });
    }
    return jsonError("Unknown action");
  }

  return jsonError("Method not allowed", 405);
});
