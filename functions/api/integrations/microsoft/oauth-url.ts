import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../../_lib/types";
import { verifyJwt } from "../../../_lib/crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "../../../_lib/cookies";
import { jsonOk, jsonError } from "../../../_lib/response";
import { isWorkspaceMember } from "../../../_lib/db";

// GET /api/integrations/microsoft/oauth-url?workspace_id=&slug=
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
	const cookies = parseCookies(request.headers.get("Cookie"));
	const accessToken = cookies[ACCESS_TOKEN_COOKIE];
	if (!accessToken) return jsonError("Not authenticated", 401);

	const payload = await verifyJwt(accessToken, env.JWT_SECRET);
	if (!payload) return jsonError("Invalid or expired token", 401);

	const url = new URL(request.url);
	const workspaceId = url.searchParams.get("workspace_id");
	const slug = url.searchParams.get("slug");
	if (!workspaceId) return jsonError("workspace_id is required");
	if (!slug) return jsonError("slug is required");

	const member = await isWorkspaceMember(env.DB, workspaceId, payload.sub);
	if (!member) return jsonError("Forbidden", 403);

	const state = btoa(JSON.stringify({ workspace_id: workspaceId, slug }));
	const redirectUri = `${env.APP_URL}/api/integrations/microsoft/callback`;

	const params = new URLSearchParams({
		client_id: env.MS_CLIENT_ID,
		response_type: "code",
		redirect_uri: redirectUri,
		response_mode: "query",
		scope: "User.Read Mail.Read Mail.ReadWrite Mail.Send offline_access",
		state,
	});

	const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;

	return jsonOk({ url: authUrl });
};
