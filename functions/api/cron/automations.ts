import { jsonOk, jsonError } from "../../_lib/response";
import { runScheduledAutomations } from "../../_lib/automations-runner";
import type { Env } from "../../_lib/types/env";
import type { PagesFunction } from "@cloudflare/workers-types";

// POST /api/cron/automations
// Invoked by an external scheduler (Cloudflare Cron via Worker, GitHub Action, etc).
// Authenticated via a bearer token kept in CRON_SECRET.
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
	if (request.method !== "POST") return jsonError("Method not allowed", 405);

	const auth = request.headers.get("Authorization");
	const expected = `Bearer ${env.CRON_SECRET ?? ""}`;
	if (!env.CRON_SECRET || auth !== expected) return jsonError("Unauthorized", 401);

	const result = await runScheduledAutomations(env);
	return jsonOk(result);
};
