import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { ondeskIssuer } from "../../_lib/sso";
import {
	upsertMirroredUser,
	upsertMirroredWorkspace,
	upsertMirroredMember,
	upsertEntitlement,
} from "../../_lib/db/mirror";
import { jsonOk, jsonError } from "../../_lib/response";

interface MirrorResponse {
	app_id: string;
	generated_at: number;
	workspaces: {
		id: string;
		name: string;
		slug: string;
		logo_url: string | null;
		entitlement: { plan: string; status: string; agent_count: number; current_period_end: number | null };
		members: { user_id: string; name: string; email: string; logo_url: string | null; role: string }[];
	}[];
}

/**
 * POST /api/platform/reconcile
 * Authorization: Bearer <CRON_SECRET>
 *
 * Pulls the authoritative mirror from OnDesk and replays it locally. Webhooks
 * are best-effort; this is what stops a dropped delivery from leaving the mirror
 * permanently wrong. Run it on a schedule (hourly is plenty).
 *
 * Memberships are reconciled destructively — a member present locally but absent
 * upstream is removed, because a missed member_removed event is precisely the
 * failure that matters. Workspaces are not: their absence here can simply mean
 * the subscription lapsed, and pulse must not delete ticket data over that.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const expected = env.CRON_SECRET;
	if (!expected) return jsonError("Cron is not configured", 500);
	if (request.headers.get("Authorization") !== `Bearer ${expected}`) return jsonError("Forbidden", 403);

	const credentials = btoa(
		`${encodeURIComponent(env.ONDESK_CLIENT_ID)}:${encodeURIComponent(env.ONDESK_CLIENT_SECRET)}`,
	);

	const res = await fetch(`${ondeskIssuer(env)}/api/platform/mirror`, {
		headers: { Authorization: `Basic ${credentials}` },
	});
	if (!res.ok) {
		return jsonError(`Mirror fetch failed (${res.status})`, 502);
	}

	const mirror = (await res.json()) as MirrorResponse;

	let workspaces = 0;
	let members = 0;
	let removed = 0;

	for (const workspace of mirror.workspaces) {
		const owner = workspace.members.find((m) => m.role === "owner") ?? workspace.members[0];
		if (!owner) continue; // a workspace with no members can't satisfy created_by

		// Users first: workspaces.created_by and workspace_members.user_id both
		// have foreign keys into users.
		for (const member of workspace.members) {
			await upsertMirroredUser(env.DB, {
				id: member.user_id,
				name: member.name,
				email: member.email,
				logo_url: member.logo_url,
			});
		}

		await upsertMirroredWorkspace(
			env.DB,
			{ id: workspace.id, name: workspace.name, slug: workspace.slug, logo_url: workspace.logo_url },
			owner.user_id,
		);
		await upsertEntitlement(env.DB, workspace.id, workspace.entitlement);
		workspaces++;

		for (const member of workspace.members) {
			await upsertMirroredMember(env.DB, workspace.id, member.user_id, member.role);
			members++;
		}

		const upstreamIds = new Set(workspace.members.map((m) => m.user_id));
		const local = await env.DB.prepare("SELECT user_id FROM workspace_members WHERE workspace_id = ?")
			.bind(workspace.id)
			.all<{ user_id: string }>();

		for (const row of local.results ?? []) {
			if (upstreamIds.has(row.user_id)) continue;
			await env.DB.prepare("DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
				.bind(workspace.id, row.user_id)
				.run();
			removed++;
		}
	}

	return jsonOk({ workspaces, members, removed, generated_at: mirror.generated_at });
};
