import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import {
  findWorkspacesByUserId,
  createWorkspace,
  slugExists,
} from "../../_lib/db";

const SLUG_RE = /^[a-z0-9-]{3,50}$/;

// GET /api/workspaces — list workspaces for the authenticated user
// POST /api/workspaces — create a new workspace
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];

  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const userId = payload.sub;

  if (request.method === "GET") {
    const workspaces = await findWorkspacesByUserId(env.DB, userId);
    return jsonOk({ workspaces });
  }

  if (request.method === "POST") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body");
    }

    const { name, slug, description, logo_url } = body as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length < 2) {
      return jsonError("Name must be at least 2 characters");
    }
    if (typeof slug !== "string" || !SLUG_RE.test(slug)) {
      return jsonError(
        "Slug must be 3-50 characters and contain only lowercase letters, numbers, and hyphens"
      );
    }

    const taken = await slugExists(env.DB, slug);
    if (taken) return jsonError("Slug is already taken", 409);

    const workspace = await createWorkspace(
      env.DB,
      {
        name: name.trim(),
        slug,
        description: typeof description === "string" ? description.trim() || undefined : undefined,
        logo_url: typeof logo_url === "string" ? logo_url.trim() || undefined : undefined,
      },
      userId
    );

    return jsonCreated({ workspace: toPublic(workspace, "owner") });
  }

  return jsonError("Method not allowed", 405);
};

function toPublic(
  w: { id: string; name: string; slug: string; description: string | null; logo_url: string | null; created_at: number },
  role: string
) {
  return { id: w.id, name: w.name, slug: w.slug, description: w.description, logo_url: w.logo_url, role, created_at: w.created_at };
}
