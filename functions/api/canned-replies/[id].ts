import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";
import { findCannedReplyById, updateCannedReply, deleteCannedReply, isWorkspaceMember } from "../../_lib/db";

// GET    /api/canned-replies/:id
// PATCH  /api/canned-replies/:id
// DELETE /api/canned-replies/:id
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  const replyId = params.id as string;
  const reply = await findCannedReplyById(env.DB, replyId);
  if (!reply) return jsonError("Canned reply not found", 404);

  const member = await isWorkspaceMember(env.DB, reply.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  if (request.method === "GET") {
    return jsonOk({ canned_reply: reply });
  }

  if (request.method === "PATCH") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, content } = body as Record<string, unknown>;
    await updateCannedReply(env.DB, replyId, {
      name: typeof name === "string" ? name.trim() : undefined,
      content: typeof content === "string" ? content.trim() : undefined,
    });
    const updated = await findCannedReplyById(env.DB, replyId);
    return jsonOk({ canned_reply: updated });
  }

  if (request.method === "DELETE") {
    await deleteCannedReply(env.DB, replyId);
    return jsonOk({ success: true });
  }

  return jsonError("Method not allowed", 405);
};
