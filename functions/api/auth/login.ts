import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import {
  verifyPassword,
  signJwt,
  generateRefreshToken,
  hashRefreshToken,
} from "../../_lib/crypto";
import { findUserByEmail, createRefreshToken } from "../../_lib/db";
import {
  serializeCookie,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from "../../_lib/cookies";
import { jsonError } from "../../_lib/response";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { email?: string; password?: string; rememberMe?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const { email, password } = body;
  if (!email || !password) {
    return jsonError("email and password are required");
  }

  const user = await findUserByEmail(env.DB, email);
  if (!user) {
    // Constant-time delay to prevent user enumeration via timing
    await new Promise((r) => setTimeout(r, 300));
    return jsonError("Invalid credentials", 401);
  }

  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    return jsonError("Invalid credentials", 401);
  }

  // Issue JWT access token (15 min)
  const accessToken = await signJwt(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    env.JWT_SECRET,
    ACCESS_TOKEN_TTL
  );

  // Issue refresh token (7 days) — store only the SHA-256 hash in D1
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = await hashRefreshToken(refreshToken);
  await createRefreshToken(env.DB, user.id, refreshTokenHash, REFRESH_TOKEN_TTL);

  const isSecure = new URL(request.url).protocol === "https:";
  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: "Strict" as const,
    path: "/",
  };

  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append(
    "Set-Cookie",
    serializeCookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_TTL,
    })
  );
  headers.append(
    "Set-Cookie",
    serializeCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_TTL,
    })
  );

  return new Response(
    JSON.stringify({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }),
    { status: 200, headers }
  );
};
