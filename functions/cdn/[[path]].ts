import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../_lib/types";

// GET /cdn/:folder/:filename — serve objects from R2
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
	if (request.method !== "GET") {
		return new Response("Method not allowed", { status: 405 });
	}

	const pathParts = params.path as string[];
	const key = Array.isArray(pathParts) ? pathParts.join("/") : pathParts;
	if (!key) return new Response("Not found", { status: 404 });

	const obj = await env.STORAGE.get(key);
	if (!obj) return new Response("Not found", { status: 404 });

	const headers = new Headers();
	obj.writeHttpMetadata(headers);
	headers.set("Cache-Control", "public, max-age=31536000, immutable");

	return new Response(obj.body, { headers });
};
