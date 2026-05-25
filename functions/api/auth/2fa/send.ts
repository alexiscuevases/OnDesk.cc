import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import { verifyJwt, hashRefreshToken } from "../../../_lib/crypto";
import { findUserById, invalidateTwoFactorCodes, createTwoFactorCode } from "../../../_lib/db";
import { jsonError } from "../../../_lib/response";
import { parseJsonBody } from "../../../_lib/http";
import { sendEmail, twoFactorCodeEmail } from "../../../_lib/email";

const TWO_FA_CODE_TTL = 10 * 60;

function generateSixDigitCode(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(4));
	const num = (new DataView(bytes.buffer).getUint32(0) % 900000) + 100000;
	return String(num);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const parsed = await parseJsonBody(request);
	if (!parsed.ok) return parsed.response;
	const body = parsed.body as { twoFactorToken?: string };

	if (!body.twoFactorToken) return jsonError("twoFactorToken is required");

	const payload = await verifyJwt(body.twoFactorToken, env.JWT_SECRET);
	if (!payload || payload.type !== "2fa_pending") {
		return jsonError("Invalid or expired session. Please sign in again.", 401);
	}

	const user = await findUserById(env.DB, payload.sub);
	if (!user) return jsonError("User not found", 404);

	const code = generateSixDigitCode();
	const codeHash = await hashRefreshToken(code);
	await invalidateTwoFactorCodes(env.DB, user.id);
	await createTwoFactorCode(env.DB, user.id, codeHash, TWO_FA_CODE_TTL);

	try {
		await sendEmail(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL, {
			to: user.email,
			subject: "Your new OnDesk sign-in code",
			html: twoFactorCodeEmail(code, user.name),
		});
	} catch {
		return jsonError("Failed to send verification code. Please try again.", 500);
	}

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
