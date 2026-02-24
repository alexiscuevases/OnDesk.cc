import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { hashRefreshToken } from "../../_lib/crypto";
import { revokeRefreshToken } from "../../_lib/db";
import {
  parseCookies,
  serializeCookie,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE,
} from "../../_lib/cookies";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const rawRefreshToken = cookies[REFRESH_TOKEN_COOKIE];

  if (rawRefreshToken) {
    const tokenHash = await hashRefreshToken(rawRefreshToken);
    // Silently ignore errors — token may already be revoked or not found
    await revokeRefreshToken(env.DB, tokenHash).catch(() => {});
  }

  // Clear both cookies by setting Max-Age=0
  const clearOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
    maxAge: 0,
  };

  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append(
    "Set-Cookie",
    serializeCookie(ACCESS_TOKEN_COOKIE, "", clearOptions)
  );
  headers.append(
    "Set-Cookie",
    serializeCookie(REFRESH_TOKEN_COOKIE, "", clearOptions)
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers,
  });
};
