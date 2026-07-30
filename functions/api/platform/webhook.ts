import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { verifyPlatformWebhook } from "../../_lib/sso";
import {
	upsertMirroredUser,
	upsertMirroredWorkspace,
	upsertMirroredMember,
	removeMirroredMember,
	upsertEntitlement,
	clearEntitlement,
} from "../../_lib/db/mirror";
import { jsonOk, jsonError } from "../../_lib/response";
import { revokeAllUserRefreshTokens } from "../../_lib/db";

const MAX_SKEW_SECONDS = 5 * 60;

interface PlatformEvent {
	event: string;
	timestamp: number;
	workspace_id?: string;
	user?: { id: string; name: string; email: string; logo_url: string | null };
	workspace?: { id: string; name: string; slug: string; logo_url: string | null };
	member?: { user_id: string; role: string };
	subscription?: { app_id: string; plan: string; status: string; agent_count: number };
}

/**
 * POST /api/platform/webhook
 *
 * Mirror updates pushed by OnDesk between sign-ins. Authenticated by an HMAC of
 * the raw body using the shared webhook secret — there is no user session here.
 *
 * Delivery is best-effort on ondesk's side, so this handler must be idempotent:
 * every write below is an upsert or a delete, and replaying an event changes
 * nothing.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const body = await request.text();
	const signature = request.headers.get("X-OnDesk-Signature");

	if (!(await verifyPlatformWebhook(env, body, signature))) {
		return jsonError("Invalid signature", 401);
	}

	let payload: PlatformEvent;
	try {
		payload = JSON.parse(body) as PlatformEvent;
	} catch {
		return jsonError("Invalid JSON body", 400);
	}

	// The timestamp is inside the signed body, so this bounds replay of a
	// captured request without needing to remember every delivery id.
	const age = Math.abs(Math.floor(Date.now() / 1000) - (payload.timestamp ?? 0));
	if (age > MAX_SKEW_SECONDS) return jsonError("Stale webhook", 400);

	switch (payload.event) {
		case "user.updated": {
			if (payload.user) await upsertMirroredUser(env.DB, payload.user);
			break;
		}

		case "workspace.updated": {
			if (payload.workspace) {
				// created_by only matters on insert; an update never touches it.
				await upsertMirroredWorkspace(env.DB, payload.workspace, payload.workspace.id);
			}
			break;
		}

		case "workspace.deleted": {
			// Not deleted locally: tickets, messages and attachments hang off this
			// workspace and dropping the row would cascade them away. Revoking the
			// entitlement cuts off access and leaves the data recoverable.
			if (payload.workspace_id) await clearEntitlement(env.DB, payload.workspace_id);
			break;
		}

		case "workspace.member_added":
		case "workspace.member_updated": {
			if (!payload.workspace_id || !payload.member) break;
			if (payload.user) await upsertMirroredUser(env.DB, payload.user);
			await upsertMirroredMember(env.DB, payload.workspace_id, payload.member.user_id, payload.member.role);
			break;
		}

		case "workspace.member_removed": {
			if (!payload.workspace_id || !payload.member) break;
			await removeMirroredMember(env.DB, payload.workspace_id, payload.member.user_id);
			// Their pulse session is still valid for up to 15 minutes; killing the
			// refresh tokens means it cannot be renewed past that.
			await revokeAllUserRefreshTokens(env.DB, payload.member.user_id);
			break;
		}

		case "subscription.updated": {
			if (!payload.workspace_id || !payload.subscription) break;
			// Ondesk fans out to every product; ignore other products' subscriptions.
			if (payload.subscription.app_id !== "pulse") break;

			await upsertEntitlement(env.DB, payload.workspace_id, {
				plan: payload.subscription.plan,
				status: payload.subscription.status,
				agent_count: payload.subscription.agent_count,
				current_period_end: null,
			});
			break;
		}
	}

	return jsonOk({ received: true });
};
