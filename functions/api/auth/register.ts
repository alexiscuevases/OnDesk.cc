import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { hashPassword } from "../../_lib/crypto";
import { createUser, findUserByEmail } from "../../_lib/db";
import { jsonCreated, jsonError } from "../../_lib/response";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON body");
  }

  const { name, email, password } = body;
  if (!name?.trim() || !email?.trim() || !password) {
    return jsonError("name, email, and password are required");
  }
  if (password.length < 8) {
    return jsonError("Password must be at least 8 characters");
  }

  const existing = await findUserByEmail(env.DB, email);
  if (existing) {
    return jsonError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(env.DB, name.trim(), email.trim(), passwordHash);

  return jsonCreated({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};
