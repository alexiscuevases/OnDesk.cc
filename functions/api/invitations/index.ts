import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import {
	findUserByEmail,
	isWorkspaceMember,
	getWorkspaceMemberRole,
	addWorkspaceMember,
	createInvitation,
	findPendingInvitationsByWorkspace,
	findPendingInvitationByWorkspaceAndEmail,
	updateInvitationStatus,
	findWorkspaceMemberIds,
	createNotification,
} from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";

const INVITATION_TTL = 60 * 60 * 24 * 7; // 7 days
const VALID_ROLES = ["owner", "admin", "agent"];

// POST   /api/invitations              — send invitation
// GET    /api/invitations?workspace_id= — list pending invitations
// DELETE /api/invitations?id=          — cancel invitation
export const onRequest = withAuth(async ({ request, env, payload }) => {
	const url = new URL(request.url);

	// ── GET: list pending invitations ──────────────────────────────────────────
	if (request.method === "GET") {
		const workspaceId = url.searchParams.get("workspace_id");
		if (!workspaceId) return jsonError("workspace_id is required");

		const member = await isWorkspaceMember(env.DB, workspaceId, payload.sub);
		if (!member) return jsonError("Forbidden", 403);

		const invitations = await findPendingInvitationsByWorkspace(env.DB, workspaceId);
		return jsonOk({ invitations });
	}

	// ── POST: send invitation ──────────────────────────────────────────────────
	if (request.method === "POST") {
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return jsonError("Invalid JSON body");
		}

		const { workspace_id, email, role } = body as Record<string, unknown>;
		if (typeof workspace_id !== "string" || !workspace_id) return jsonError("workspace_id is required");
		if (typeof email !== "string" || !email) return jsonError("email is required");
		if (typeof role !== "string" || !VALID_ROLES.includes(role)) {
			return jsonError(`role must be one of: ${VALID_ROLES.join(", ")}`);
		}

		const callerRole = await getWorkspaceMemberRole(env.DB, workspace_id, payload.sub);
		if (callerRole !== "owner" && callerRole !== "admin") return jsonError("Forbidden", 403);

		const normalizedEmail = email.toLowerCase().trim();

		// Check if email is already a workspace member
		const existingUser = await findUserByEmail(env.DB, normalizedEmail);
		if (existingUser) {
			const alreadyMember = await isWorkspaceMember(env.DB, workspace_id, existingUser.id);
			if (alreadyMember) return jsonError("This user is already a member of the workspace", 409);

			// User exists but is not a member → add directly
			await addWorkspaceMember(env.DB, workspace_id, existingUser.id, role);

			// — Notification: new member joined — notify all existing workspace members
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
						})
					)
			);

			return jsonCreated({ added: true });
		}

		// Check if there's already a pending invitation for this email in this workspace
		const existingInvite = await findPendingInvitationByWorkspaceAndEmail(env.DB, workspace_id, normalizedEmail);
		if (existingInvite) return jsonError("An invitation has already been sent to this email", 409);

		// Generate secure token and create invitation
		const tokenBytes = new Uint8Array(32);
		crypto.getRandomValues(tokenBytes);
		const token = Array.from(tokenBytes)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

		await createInvitation(env.DB, workspace_id, normalizedEmail, role, payload.sub, token, INVITATION_TTL);

		// Send email via Resend
		const appUrl = (env as unknown as Record<string, string>).APP_URL ?? "http://localhost:8788";
		const inviteUrl = `${appUrl}/auth/signup?invite=${token}`;
		const resendKey = (env as unknown as Record<string, string>).RESEND_API_KEY;

		if (resendKey) {
			await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${resendKey}`,
				},
				body: JSON.stringify({
					from: "OnDesk.cc <no-reply@supportdesk365.app>",
					to: [normalizedEmail],
					subject: "You've been invited to join a workspace",
					html: `
            <p>You've been invited to join a workspace on <strong>OnDesk.cc</strong> as <strong>${role}</strong>.</p>
            <p><a href="${inviteUrl}" style="background:#000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Accept Invitation</a></p>
            <p>This invitation expires in 7 days. If you did not expect this, you can ignore this email.</p>
          `,
				}),
			});
		} else {
			console.log(`[DEV] Invitation link for ${normalizedEmail}: ${inviteUrl}`);
		}

		return jsonCreated({ invited: true, email: normalizedEmail });
	}

	// ── DELETE: cancel invitation ──────────────────────────────────────────────
	if (request.method === "DELETE") {
		const invitationId = url.searchParams.get("id");
		if (!invitationId) return jsonError("id is required");

		const workspaceId = url.searchParams.get("workspace_id");
		if (!workspaceId) return jsonError("workspace_id is required");

		const callerRole = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
		if (callerRole !== "owner" && callerRole !== "admin") return jsonError("Forbidden", 403);

		await updateInvitationStatus(env.DB, invitationId, "cancelled");
		return jsonOk({ success: true });
	}

	return jsonError("Method not allowed", 405);
});
