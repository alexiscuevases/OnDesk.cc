import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { hashPassword } from "../../_lib/crypto";
import {
	createUser,
	findUserByEmail,
	findPendingInvitationByEmail,
	addWorkspaceMember,
	updateInvitationStatus,
	findWorkspaceMemberIds,
	createNotification,
} from "../../_lib/db";
import { jsonCreated, jsonError } from "../../_lib/response";
import { parseJsonBody } from "../../_lib/http";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const parsed = await parseJsonBody(request);
	if (!parsed.ok) return parsed.response;
	const body = parsed.body as { name?: string; email?: string; password?: string };

	const { name, email, password } = body;
	if (!name?.trim() || !email?.trim() || !password) {
		return jsonError("name, email, and password are required");
	}
	if (password.length < 8) {
		return jsonError("Password must be at least 8 characters");
	}

	const existing = await findUserByEmail(env.DB, email);
	if (existing) {
		return jsonError("An account with this email already exists", 409);
	}

	const passwordHash = await hashPassword(password);
	const user = await createUser(env.DB, name.trim(), email.trim(), passwordHash);

	const now = Math.floor(Date.now() / 1000);
	const invite = await findPendingInvitationByEmail(env.DB, email.trim());
	if (invite && invite.expires_at > now) {
		const existingMemberIds = await findWorkspaceMemberIds(env.DB, invite.workspace_id);
		await addWorkspaceMember(env.DB, invite.workspace_id, user.id, invite.role);
		await updateInvitationStatus(env.DB, invite.id, "accepted");

		await Promise.all(
			existingMemberIds.map((uid) =>
				createNotification(env.DB, {
					user_id: uid,
					workspace_id: invite.workspace_id,
					type: "ticket",
					title: "New member joined",
					description: `${user.name} joined the workspace.`,
					actor_id: user.id,
				})
			)
		);
	}

	return jsonCreated({
		user: { id: user.id, name: user.name, email: user.email, role: user.role },
	});
};
