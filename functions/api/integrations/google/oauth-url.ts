import { jsonOk, jsonError } from "../../../_lib/response";
import { withWorkspace } from "../../../_lib/middleware";
import { createMethodRouter, asTrimmedString } from "../../../_lib/http";
import { GOOGLE_GMAIL_CONFIG } from "../../../_lib/configs";

// GET /api/integrations/google/oauth-url?workspace_id=&slug=
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) =>
	createMethodRouter(request.method, {
		GET: async () => {
			const url = new URL(request.url);
			const slug = asTrimmedString(url.searchParams.get("slug"));
			if (!slug) return jsonError("slug is required");

			const state = btoa(JSON.stringify({ workspace_id: workspaceId, slug }));
			const redirectUri = `${env.APP_URL}/api/integrations/google/callback`;

			const params = new URLSearchParams({
				client_id: env.GOOGLE_CLIENT_ID,
				response_type: "code",
				redirect_uri: redirectUri,
				scope: GOOGLE_GMAIL_CONFIG.OAUTH_SCOPE,
				access_type: "offline",
				prompt: "consent", // force refresh_token on every authorization
				state,
			});

			const authUrl = `${GOOGLE_GMAIL_CONFIG.AUTH_ENDPOINT}?${params.toString()}`;

			return jsonOk({ url: authUrl });
		},
	}));
