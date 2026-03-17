import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findTeamsByWorkspace, createTeam } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { asTrimmedString, createMethodRouter, parseJsonBody } from "../../_lib/http";

// GET  /api/teams?workspace_id=
// POST /api/teams
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
  return createMethodRouter(request.method, {
    GET: async () => {
      const teams = await findTeamsByWorkspace(env.DB, workspaceId);
      return jsonOk({ teams });
    },
    POST: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { name, description, leader_id, logo_url } = parsed.body;
      const normalizedName = asTrimmedString(name);
      if (!normalizedName) return jsonError("name is required");

      const team = await createTeam(env.DB, workspaceId, {
        name: normalizedName,
        description: asTrimmedString(description),
        leader_id: typeof leader_id === "string" ? leader_id : undefined,
        logo_url: asTrimmedString(logo_url),
      });

      return jsonCreated({ team });
    },
  });
});
