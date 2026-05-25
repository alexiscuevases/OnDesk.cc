import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { hashRefreshToken, hashPassword } from "../../_lib/crypto";
import {
	findPasswordResetToken,
	markPasswordResetTokenUsed,
	updateUserPassword,
	revokeAllUserRefreshTokens,
} from "../../_lib/db";
import { jsonError } from "../../_lib/response";
import { parseJsonBody } from "../../_lib/http";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const parsed = await parseJsonBody(request);
	if (!parsed.ok) return parsed.response;
	const body = parsed.body as { token?: string; password?: string };

	if (!body.token || !body.password) {
		return jsonError("token and password are required");
	}
	if (body.password.length < 8) {
		return jsonError("Password must be at least 8 characters");
	}

	const tokenHash = await hashRefreshToken(body.token);
	const resetToken = await findPasswordResetToken(env.DB, tokenHash);

	const now = Math.floor(Date.now() / 1000);
	if (!resetToken || resetToken.expires_at < now) {
		return jsonError("Invalid or expired reset link", 400);
	}

	const newPasswordHash = await hashPassword(body.password);
	await updateUserPassword(env.DB, resetToken.user_id, newPasswordHash);
	await markPasswordResetTokenUsed(env.DB, resetToken.id);
	await revokeAllUserRefreshTokens(env.DB, resetToken.user_id);

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
