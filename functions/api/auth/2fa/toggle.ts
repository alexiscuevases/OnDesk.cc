import type { Env } from "../../../_lib/types";
import { withAuth } from "../../../_lib/middleware";
import { setTwoFactorEnabled } from "../../../_lib/db";
import { jsonError } from "../../../_lib/response";
import { parseJsonBody } from "../../../_lib/http";

export const onRequestPost = withAuth<string>(async ({ request, env, payload }) => {
	const parsed = await parseJsonBody(request);
	if (!parsed.ok) return parsed.response;
	const body = parsed.body as { enabled?: boolean };

	if (typeof body.enabled !== "boolean") {
		return jsonError("enabled (boolean) is required");
	}

	await setTwoFactorEnabled(env.DB, payload.sub, body.enabled);

	return new Response(
		JSON.stringify({ ok: true, two_factor_enabled: body.enabled }),
		{ status: 200, headers: { "Content-Type": "application/json" } }
	);
});
