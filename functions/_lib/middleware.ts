import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env, AuthContext, WorkspaceContext, Permission } from "./types";
import { verifyJwt } from "./crypto";
import { parseCookies, ACCESS_TOKEN_COOKIE } from "./cookies";
import { jsonError } from "./response";
import { isWorkspaceMember, hasPermission } from "./db";

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
	return async ({ request, env, params, waitUntil }) => {
		const cookies = parseCookies(request.headers.get("Cookie"));
		const accessToken = cookies[ACCESS_TOKEN_COOKIE];
		if (!accessToken) return jsonError("Not authenticated", 401);

		// Pulse only ever issues fully-authenticated tokens now — the half-issued
		// '2fa_pending' state belongs to ondesk's login flow, not here.
		const payload = await verifyJwt(accessToken, env.JWT_SECRET);
		if (!payload) return jsonError("Invalid or expired token", 401);

		return handler({ request, env, params: params as Record<P, string>, payload, waitUntil });
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
	return withAuth<P>(async ({ request, env, params, payload, waitUntil }) => {
		const url = new URL(request.url);
		const workspaceId = url.searchParams.get("workspace_id");
		if (!workspaceId) return jsonError("workspace_id is required");

		const member = await isWorkspaceMember(env.DB, workspaceId, payload.sub);
		if (!member) return jsonError("Forbidden", 403);

		return handler({ request, env, params, payload, workspaceId, waitUntil });
	});
}

/**
 * Membership, plus one permission from the caller's product role.
 *
 * `withWorkspace` answers "are you in this workspace", which for a long time was
 * the only question anything asked: the permission model existed, the UI hid
 * buttons with it, and no endpoint ever checked it. This is where that stops.
 *
 * The permission comes from `workspace_members.permissions`, resolved by ondesk
 * from the role on this member's Pulse seat and mirrored here. A member with no
 * resolved permissions falls back to the preset for their tenancy role, so
 * wrapping a route in this never locks out an owner.
 */
export function withPermission<P extends string = string>(
	permission: Permission,
	handler: WorkspaceHandler<P>
): PagesFunction<Env, P> {
	return withWorkspace<P>(async (ctx) => {
		if (!(await hasPermission(ctx.env.DB, ctx.workspaceId, ctx.payload.sub, permission))) {
			// Named rather than a bare 403: the client can tell the difference
			// between "not your workspace" and "your role doesn't include this",
			// and only the second is worth explaining to the person.
			return jsonError(`Your role doesn't include ${permission}`, 403);
		}
		return handler(ctx);
	});
}

/**
 * The same, but only for methods that change something.
 *
 * Most of Pulse's routes are one handler serving GET alongside POST/PATCH/DELETE
 * through a method router, and the two halves answer to different permissions: a
 * `.manage` key is about editing, while reading is usually governed by a `.view`
 * key or by nothing at all. Gating the whole route on `.manage` would quietly
 * take the *list* away from everyone who could only ever read it.
 *
 * So this guards the writes and leaves reads exactly as they were — which is
 * also what makes it safe to apply to a route family in one line.
 */
export function withWritePermission<P extends string = string>(
	permission: Permission,
	handler: WorkspaceHandler<P>
): PagesFunction<Env, P> {
	return withWorkspace<P>(async (ctx) => {
		if (ctx.request.method !== "GET" && !(await hasPermission(ctx.env.DB, ctx.workspaceId, ctx.payload.sub, permission))) {
			return jsonError(`Your role doesn't include ${permission}`, 403);
		}
		return handler(ctx);
	});
}
