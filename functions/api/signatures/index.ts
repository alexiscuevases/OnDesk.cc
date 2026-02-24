import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { findSignaturesByUser, createSignature } from "../../_lib/db";

// GET  /api/signatures  — list caller's signatures
// POST /api/signatures
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) return jsonError("Not authenticated", 401);

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) return jsonError("Invalid or expired token", 401);

  if (request.method === "GET") {
    const signatures = await findSignaturesByUser(env.DB, payload.sub);
    return jsonOk({ signatures });
  }

  if (request.method === "POST") {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Invalid JSON body"); }

    const { name, content, is_default } = body as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) return jsonError("name is required");
    if (typeof content !== "string" || content.trim().length === 0) return jsonError("content is required");

    const signature = await createSignature(env.DB, payload.sub, {
      name: name.trim(),
      content: content.trim(),
      is_default: is_default === true,
    });

    return jsonCreated({ signature });
  }

  return jsonError("Method not allowed", 405);
};
