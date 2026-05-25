import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { generateRefreshToken, hashRefreshToken } from "../../_lib/crypto";
import { findUserByEmail, invalidatePasswordResetTokens, createPasswordResetToken } from "../../_lib/db";
import { jsonError } from "../../_lib/response";
import { parseJsonBody } from "../../_lib/http";
import { sendEmail, passwordResetEmail } from "../../_lib/email";

const RESET_TOKEN_TTL = 60 * 60; // 1 hour

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const parsed = await parseJsonBody(request);
	if (!parsed.ok) return parsed.response;
	const body = parsed.body as { email?: string };

	if (!body.email) return jsonError("email is required");

	// Always return success to avoid leaking whether an email exists
	const ok = new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});

	const user = await findUserByEmail(env.DB, body.email);
	if (!user) return ok;

	// Invalidate any existing tokens before issuing a new one
	await invalidatePasswordResetTokens(env.DB, user.id);

	const token = generateRefreshToken();
	const tokenHash = await hashRefreshToken(token);
	await createPasswordResetToken(env.DB, user.id, tokenHash, RESET_TOKEN_TTL);

	const resetUrl = `${env.APP_URL}/auth/reset-password?token=${token}`;

	try {
		await sendEmail(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL, {
			to: user.email,
			subject: "Reset your OnDesk password",
			html: passwordResetEmail(env.APP_URL, resetUrl, user.name),
		});
	} catch {
		// Log but don't expose to client
	}

	return ok;
};
