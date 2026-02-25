import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env, JwtPayload } from "./types";
import { verifyJwt } from "./crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "./cookies";
import { jsonError } from "./response";
import { isWorkspaceMember } from "./db";

export interface AuthContext {
	request: Request;
	env: Env;
	params: Record<string, string>;
	payload: JwtPayload;
}

export interface WorkspaceContext extends AuthContext {
	workspaceId: string;
}

type AuthHandler<P extends string = string> = (
	ctx: Omit<AuthContext, "params"> & { params: Record<P, string> }
) => Promise<Response>;

type WorkspaceHandler<P extends string = string> = (
	ctx: Omit<WorkspaceContext, "params"> & { params: Record<P, string> }
) => Promise<Response>;

/**
 * Middleware HOF that extracts and verifies the JWT from cookies.
 * Passes the verified payload to the handler as `ctx.payload`.
 */
export function withAuth<P extends string = string>(
	handler: AuthHandler<P>
): PagesFunction<Env, P> {
	return async ({ request, env, params }) => {
		const cookies = parseCookies(request.headers.get("Cookie"));
		const accessToken = cookies[ACCESS_TOKEN_COOKIE];
		if (!accessToken) return jsonError("Not authenticated", 401);

		const payload = await verifyJwt(accessToken, env.JWT_SECRET);
		if (!payload) return jsonError("Invalid or expired token", 401);

		return handler({ request, env, params: params as Record<P, string>, payload });
	};
}

/**
 * Middleware HOF that verifies auth AND validates workspace membership.
 * Reads `workspace_id` from the query string.
 * Passes payload and workspaceId to the handler.
 */
export function withWorkspace<P extends string = string>(
	handler: WorkspaceHandler<P>
): PagesFunction<Env, P> {
	return withAuth<P>(async ({ request, env, params, payload }) => {
		const url = new URL(request.url);
		const workspaceId = url.searchParams.get("workspace_id");
		if (!workspaceId) return jsonError("workspace_id is required");

		const member = await isWorkspaceMember(env.DB, workspaceId, payload.sub);
		if (!member) return jsonError("Forbidden", 403);

		return handler({ request, env, params, payload, workspaceId });
	});
}
