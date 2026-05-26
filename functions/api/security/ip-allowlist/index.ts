import { withWorkspace } from "../../../_lib/middleware";
import {
	listIpAllowlist,
	addIpAllowlistEntry,
	getWorkspaceMemberRole,
	writeAuditLog,
	ipMatchesCidr,
} from "../../../_lib/db";
import { jsonOk, jsonCreated, jsonError } from "../../../_lib/response";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";

const CIDR_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/([0-9]|[12][0-9]|3[0-2]))?$/;

function isValidCidr(cidr: string): boolean {
	if (!CIDR_RE.test(cidr)) return false;
	const probe = cidr.includes("/") ? cidr.split("/")[0] : cidr;
	return ipMatchesCidr(probe, cidr);
}

// GET    /api/security/ip-allowlist?workspace_id=...
// POST   /api/security/ip-allowlist?workspace_id=...   body: { cidr, label? }
export const onRequest = withWorkspace(async ({ request, env, payload, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const entries = await listIpAllowlist(env.DB, workspaceId);
			return jsonOk({ entries });
		},
		POST: async () => {
			const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
			if (role !== "owner" && role !== "admin") return jsonError("Forbidden", 403);

			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;
			const body = parsed.body as { cidr?: string; label?: string };

			const cidrRaw = typeof body.cidr === "string" ? body.cidr.trim() : "";
			if (!cidrRaw) return jsonError("cidr is required");
			const cidr = cidrRaw.includes("/") ? cidrRaw : `${cidrRaw}/32`;
			if (!isValidCidr(cidr)) return jsonError("Invalid IP or CIDR (IPv4 only)");

			const label = typeof body.label === "string" ? body.label.trim().slice(0, 80) : null;

			try {
				const entry = await addIpAllowlistEntry(env.DB, {
					workspace_id: workspaceId,
					cidr,
					label: label || null,
					created_by: payload.sub,
				});

				await writeAuditLog(env.DB, {
					workspace_id: workspaceId,
					actor_id: payload.sub,
					actor_email: payload.email,
					action: "security.ip_added",
					target: cidr,
					ip: request.headers.get("CF-Connecting-IP"),
				});

				return jsonCreated({ entry });
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				if (msg.includes("UNIQUE")) return jsonError("This CIDR is already on the allowlist", 409);
				return jsonError("Failed to add entry", 500);
			}
		},
	});
});
