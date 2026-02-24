import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { findUserById } from "../../_lib/db";
import {
  parseCookies,
  ACCESS_TOKEN_COOKIE,
} from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];

  if (!accessToken) {
    return jsonError("Not authenticated", 401);
  }

  const payload = await verifyJwt(accessToken, env.JWT_SECRET);
  if (!payload) {
    return jsonError("Invalid or expired token", 401);
  }

  const user = await findUserById(env.DB, payload.sub);
  if (!user) {
    return jsonError("User not found", 401);
  }

  return jsonOk({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};
