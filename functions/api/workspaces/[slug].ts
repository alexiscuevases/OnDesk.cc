import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";
import {
  findWorkspaceBySlug,
  getWorkspaceMemberRole,
  updateWorkspace,
  deleteWorkspace,
} from "../../_lib/db";

// GET    /api/workspaces/:slug — get workspace details (must be a member)
// PATCH  /api/workspaces/:slug — update workspace (must be owner or admin)
// DELETE /api/workspaces/:slug — delete workspace (must be owner)
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];

  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const userId = payload.sub;
  const slug = params.slug as string;

  const workspace = await findWorkspaceBySlug(env.DB, slug);
  if (!workspace) return jsonError("Workspace not found", 404);

  const memberRole = await getWorkspaceMemberRole(env.DB, workspace.id, userId);
  if (!memberRole) return jsonError("Forbidden", 403);

  if (request.method === "GET") {
    return jsonOk({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        logo_url: workspace.logo_url,
        role: memberRole,
        created_at: workspace.created_at,
      },
    });
  }

  if (request.method === "PATCH") {
    if (memberRole !== "owner" && memberRole !== "admin") {
      return jsonError("Forbidden", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body");
    }

    const { name, description, logo_url } = body as Record<string, unknown>;
    const updates: { name?: string; description?: string; logo_url?: string } = {};

    if (typeof name === "string" && name.trim().length >= 2) {
      updates.name = name.trim();
    }
    if (typeof description === "string") {
      updates.description = description.trim();
    }
    if (typeof logo_url === "string") {
      updates.logo_url = logo_url.trim();
    }

    await updateWorkspace(env.DB, workspace.id, updates);
    const updated = await findWorkspaceBySlug(env.DB, slug);
    return jsonOk({
      workspace: {
        id: updated!.id,
        name: updated!.name,
        slug: updated!.slug,
        description: updated!.description,
        logo_url: updated!.logo_url,
        role: memberRole,
        created_at: updated!.created_at,
      },
    });
  }

  if (request.method === "DELETE") {
    if (memberRole !== "owner") {
      return jsonError("Only the workspace owner can delete it", 403);
    }
    await deleteWorkspace(env.DB, workspace.id);
    return jsonOk({ success: true });
  }

  return jsonError("Method not allowed", 405);
};
