import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import {
	findUserByEmail,
	isWorkspaceMember,
	getWorkspaceMemberRole,
	addWorkspaceMember,
	createInvitation,
	findPendingInvitationsByWorkspace,
	updateInvitationStatus,
	findWorkspaceMemberIds,
	createNotification,
} from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

const INVITATION_TTL = 60 * 60 * 24 * 7; // 7 days
const VALID_ROLES = ["owner", "admin", "agent"];

function generateInvitationToken(): string {
	const tokenBytes = new Uint8Array(32);
	crypto.getRandomValues(tokenBytes);
	return Array.from(tokenBytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function sendInvitationEmail(env: unknown, to: string, role: string, token: string): Promise<void> {
	const e = env as Record<string, string>;
	const appUrl = e.APP_URL ?? "http://localhost:8788";
	const inviteUrl = `${appUrl}/auth/signup?invite=${token}`;
	const resendKey = e.RESEND_API_KEY;

	if (!resendKey) {
		console.log(`[DEV] Invitation link for ${to}: ${inviteUrl}`);
		return;
	}

	await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${resendKey}`,
		},
		body: JSON.stringify({
			from: "OnDesk.cc <no-reply@pulse.ondesk.cc>",
			to: [to],
			subject: "You've been invited to join a workspace",
			html: `
            <p>You've been invited to join a workspace on <strong>OnDesk.cc</strong> as <strong>${role}</strong>.</p>
            <p><a href="${inviteUrl}" style="background:#000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Accept Invitation</a></p>
            <p>This invitation expires in 7 days. If you did not expect this, you can ignore this email.</p>
          `,
		}),
	});
}

// POST   /api/invitations              - send invitation
// PATCH  /api/invitations?id=&workspace_id=  - resend invitation (refresh token + expiry, re-email)
// GET    /api/invitations?workspace_id= - list pending invitations
// DELETE /api/invitations?id=          - cancel invitation
export const onRequest = withAuth(async ({ request, env, payload }) => {
	const url = new URL(request.url);

	return createMethodRouter(request.method, {
		GET: async () => {
			const workspaceId = url.searchParams.get("workspace_id");
			if (!workspaceId) return jsonError("workspace_id is required");

			const member = await isWorkspaceMember(env.DB, workspaceId, payload.sub);
			if (!member) return jsonError("Forbidden", 403);

			const invitations = await findPendingInvitationsByWorkspace(env.DB, workspaceId);
			return jsonOk({ invitations });
		},
		POST: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const { workspace_id, email, role } = parsed.body;
			if (typeof workspace_id !== "string" || !workspace_id) return jsonError("workspace_id is required");
			if (typeof email !== "string" || !email) return jsonError("email is required");
			if (typeof role !== "string" || !VALID_ROLES.includes(role)) {
				return jsonError(`role must be one of: ${VALID_ROLES.join(", ")}`);
			}

			const callerRole = await getWorkspaceMemberRole(env.DB, workspace_id, payload.sub);
			if (callerRole !== "owner" && callerRole !== "admin") return jsonError("Forbidden", 403);

			const normalizedEmail = email.toLowerCase().trim();
			const existingUser = await findUserByEmail(env.DB, normalizedEmail);
			if (existingUser) {
				const alreadyMember = await isWorkspaceMember(env.DB, workspace_id, existingUser.id);
				if (alreadyMember) return jsonError("This user is already a member of the workspace", 409);

				await addWorkspaceMember(env.DB, workspace_id, existingUser.id, role);

				const memberIds = await findWorkspaceMemberIds(env.DB, workspace_id);
				await Promise.all(
					memberIds
						.filter((uid) => uid !== existingUser.id)
						.map((uid) =>
							createNotification(env.DB, {
								user_id: uid,
								workspace_id: workspace_id,
								type: "ticket",
								title: "New member joined",
								description: `${existingUser.name} joined the workspace.`,
								actor_id: existingUser.id,
							}),
						),
				);

				return jsonCreated({ added: true });
			}

			const token = generateInvitationToken();
			await createInvitation(env.DB, workspace_id, normalizedEmail, role, payload.sub, token, INVITATION_TTL);
			await sendInvitationEmail(env, normalizedEmail, role, token);

			return jsonCreated({ invited: true, email: normalizedEmail });
		},
		PATCH: async () => {
			const invitationId = url.searchParams.get("id");
			const workspaceId = url.searchParams.get("workspace_id");
			if (!invitationId) return jsonError("id is required");
			if (!workspaceId) return jsonError("workspace_id is required");

			const callerRole = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
			if (callerRole !== "owner" && callerRole !== "admin") return jsonError("Forbidden", 403);

			const invitations = await findPendingInvitationsByWorkspace(env.DB, workspaceId);
			const target = invitations.find((i) => i.id === invitationId);
			if (!target) return jsonError("Invitation not found", 404);

			const token = generateInvitationToken();
			const updated = await createInvitation(env.DB, workspaceId, target.email, target.role, payload.sub, token, INVITATION_TTL);
			await sendInvitationEmail(env, target.email, target.role, token);

			return jsonOk({ resent: true, email: target.email, expires_at: updated.expires_at });
		},
		DELETE: async () => {
			const invitationId = url.searchParams.get("id");
			if (!invitationId) return jsonError("id is required");

			const workspaceId = url.searchParams.get("workspace_id");
			if (!workspaceId) return jsonError("workspace_id is required");

			const callerRole = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
			if (callerRole !== "owner" && callerRole !== "admin") return jsonError("Forbidden", 403);

			await updateInvitationStatus(env.DB, invitationId, "cancelled");
			return jsonOk({ success: true });
		},
	});
});
