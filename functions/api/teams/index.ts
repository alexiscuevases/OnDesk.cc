import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findTeamsByWorkspace, createTeam } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";

// GET  /api/teams?workspace_id=
// POST /api/teams
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
  if (request.method === "GET") {
    const teams = await findTeamsByWorkspace(env.DB, workspaceId);
    return jsonOk({ teams });
  }

  if (request.method === "POST") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, description, leader_id, logo_url } = body as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) {
      return jsonError("name is required");
    }

    const team = await createTeam(env.DB, workspaceId, {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() || undefined : undefined,
      leader_id: typeof leader_id === "string" ? leader_id : undefined,
      logo_url: typeof logo_url === "string" ? logo_url.trim() || undefined : undefined,
    });

    return jsonCreated({ team });
  }

  return jsonError("Method not allowed", 405);
});
