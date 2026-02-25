import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import {
  findWorkspacesByUserId,
  createWorkspace,
  slugExists,
} from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";

const SLUG_RE = /^[a-z0-9-]{3,50}$/;

// GET /api/workspaces — list workspaces for the authenticated user
// POST /api/workspaces — create a new workspace
export const onRequest = withAuth(async ({ request, env, payload }) => {
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
});

function toPublic(
  w: { id: string; name: string; slug: string; description: string | null; logo_url: string | null; created_at: number },
  role: string
) {
  return { id: w.id, name: w.name, slug: w.slug, description: w.description, logo_url: w.logo_url, role, created_at: w.created_at };
}
