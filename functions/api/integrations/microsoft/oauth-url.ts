import { jsonOk, jsonError } from "../../../_lib/response";
import { withWorkspace } from "../../../_lib/middleware";

// GET /api/integrations/microsoft/oauth-url?workspace_id=&slug=
export const onRequestGet = withWorkspace(async ({ request, env, workspaceId }) => {
	const url = new URL(request.url);
	const slug = url.searchParams.get("slug");
	if (!slug) return jsonError("slug is required");

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
});
