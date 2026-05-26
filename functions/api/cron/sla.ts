import { jsonOk, jsonError } from "../../_lib/response";
import { scanSlaBreaches } from "../../_lib/db";
import type { Env } from "../../_lib/types/env";
import type { PagesFunction } from "@cloudflare/workers-types";

// POST /api/cron/sla — invoked externally with Authorization: Bearer CRON_SECRET
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
	if (request.method !== "POST") return jsonError("Method not allowed", 405);
	const auth = request.headers.get("Authorization");
	const expected = `Bearer ${env.CRON_SECRET ?? ""}`;
	if (!env.CRON_SECRET || auth !== expected) return jsonError("Unauthorized", 401);
	const result = await scanSlaBreaches(env.DB);
	return jsonOk(result);
};
