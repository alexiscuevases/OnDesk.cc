import { jsonOk, jsonError } from "../../_lib/response";
import {
  findTeamById, updateTeam, deleteTeam,
  findTeamMembers, addTeamMember, removeTeamMember,
  isWorkspaceMember, getWorkspaceMemberRole,
} from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { asTrimmedString, createMethodRouter, parseJsonBody } from "../../_lib/http";

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

  const ensureTeamAdminRole = async (): Promise<Response | null> => {
    const role = await getWorkspaceMemberRole(env.DB, team.workspace_id, payload.sub);
    if (role !== "owner" && role !== "admin") return jsonError("Forbidden", 403);
    return null;
  };

  return createMethodRouter(request.method, {
    GET: async () => {
      if (url.searchParams.get("members") === "true") {
        const members = await findTeamMembers(env.DB, teamId);
        return jsonOk({ members });
      }
      return jsonOk({ team });
    },
    PATCH: async () => {
      const forbidden = await ensureTeamAdminRole();
      if (forbidden) return forbidden;

      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, description, leader_id, logo_url } = parsed.body;
      await updateTeam(env.DB, teamId, {
        name: asTrimmedString(name),
        description: asTrimmedString(description),
        leader_id: typeof leader_id === "string" ? leader_id : undefined,
        logo_url: asTrimmedString(logo_url),
      });
      const updated = await findTeamById(env.DB, teamId);
      return jsonOk({ team: updated });
    },
    DELETE: async () => {
      const forbidden = await ensureTeamAdminRole();
      if (forbidden) return forbidden;

      await deleteTeam(env.DB, teamId);
      return jsonOk({ success: true });
    },
    POST: async () => {
      const forbidden = await ensureTeamAdminRole();
      if (forbidden) return forbidden;

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
    },
  });
});
