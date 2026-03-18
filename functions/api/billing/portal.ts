import Stripe from "stripe";
import { withWorkspace } from "../../_lib/middleware";
import { jsonOk, jsonError } from "../../_lib/response";

// POST /api/billing/portal?workspace_id=...
// Returns a Stripe Customer Portal URL so the user can manage their subscription
export const onRequestPost = withWorkspace(async ({ env, workspaceId }) => {
	const sub = await env.DB
		.prepare(`SELECT stripe_customer_id FROM subscriptions WHERE workspace_id = ? LIMIT 1`)
		.bind(workspaceId)
		.first<{ stripe_customer_id: string }>();

	if (!sub) return jsonError("No subscription found for this workspace", 404);

	const stripe = new Stripe(env.STRIPE_SECRET_KEY);

	const session = await stripe.billingPortal.sessions.create({
		customer: sub.stripe_customer_id,
		return_url: `${env.APP_URL}/w/${workspaceId}/settings`,
	});

	return jsonOk({ url: session.url });
});
