import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyJwt } from "../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../_lib/cookies";
import { jsonOk, jsonError } from "../../_lib/response";
import { createMethodRouter } from "../../_lib/http";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

// POST /api/upload?folder=logos — raw binary body, filename + mime passed as query params
// Headers required: Content-Type (mime), X-File-Name (original filename)
// Returns { url: string }
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
	return createMethodRouter(request.method, {
		POST: async () => {
			const cookies = parseCookies(request.headers.get("Cookie"));
			const accessToken = cookies[ACCESS_TOKEN_COOKIE];
			if (!accessToken) return jsonError("Not authenticated", 401);

			const payload = await verifyJwt(accessToken, env.JWT_SECRET);
			if (!payload) return jsonError("Invalid or expired token", 401);

			const url = new URL(request.url);
			const folder = url.searchParams.get("folder") ?? "logos";
			const fileName = request.headers.get("X-File-Name") ?? "upload";
			const mimeType = request.headers.get("Content-Type") ?? "";

			if (!ALLOWED_TYPES.includes(mimeType)) {
				return jsonError("File type not allowed. Use JPEG, PNG, WEBP, GIF or SVG");
			}

			const buffer = await request.arrayBuffer();
			if (buffer.byteLength > MAX_SIZE) {
				return jsonError("File too large. Max 2 MB");
			}
			if (buffer.byteLength === 0) {
				return jsonError("file field is required");
			}

			const ext = fileName.split(".").pop() || "bin";
			const key = `${folder}/${crypto.randomUUID()}.${ext}`;

			await env.STORAGE.put(key, buffer, {
				httpMetadata: { contentType: mimeType },
			});

			return jsonOk({ url: `/cdn/${key}` });
		},
	}) as unknown as Response;
};
