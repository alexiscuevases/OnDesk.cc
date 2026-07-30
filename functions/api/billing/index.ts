import { withWorkspace } from "../../_lib/middleware";
import { jsonOk } from "../../_lib/response";
import { createMethodRouter } from "../../_lib/http";

/**
 * GET /api/billing?workspace_id=... — the mirrored Pulse entitlement.
 *
 * Read-only. Checkout, the customer portal and the Stripe webhook all live on
 * OnDesk now: billing spans products, and running it per product would mean a
 * separate invoice and payment method for each one. The UI links out to
 * {ONDESK_ISSUER}/workspaces/:slug/billing for anything that changes state.
 */
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const row = await env.DB.prepare(
				`SELECT plan, status, agent_count, current_period_end, updated_at
				 FROM workspace_entitlements WHERE workspace_id = ? LIMIT 1`,
			)
				.bind(workspaceId)
				.first<{
					plan: string;
					status: string;
					agent_count: number;
					current_period_end: number | null;
					updated_at: number;
				}>();

			return jsonOk({
				entitlement: row,
				manage_url: `${(env.ONDESK_ISSUER ?? "https://ondesk.cc").replace(/\/$/, "")}/workspaces`,
			});
		},
	});
});
