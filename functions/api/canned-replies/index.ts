import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { isWorkspaceMember, findCannedRepliesByWorkspace, createCannedReply } from "../../_lib/db";

// GET  /api/canned-replies?workspace_id=
// POST /api/canned-replies
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
    const replies = await findCannedRepliesByWorkspace(env.DB, workspaceId);
    return jsonOk({ canned_replies: replies });
  }

  if (request.method === "POST") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, content, shortcut } = body as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");
    if (typeof content !== "string" || content.trim().length === 0) return jsonError("content is required");

    const reply = await createCannedReply(env.DB, workspaceId, payload.sub, {
      name: name.trim(),
      content: content.trim(),
      shortcut: typeof shortcut === "string" && shortcut.trim().length > 0 ? shortcut.trim() : undefined,
    });

    return jsonCreated({ canned_reply: reply });
  }

  return jsonError("Method not allowed", 405);
};
