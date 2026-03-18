import Stripe from "stripe";
import { withWorkspace } from "../../_lib/middleware";
import { findSubscriptionByWorkspace, createSubscription, findWorkspaceById } from "../../_lib/db";
import { jsonOk, jsonError } from "../../_lib/response";
import { parseJsonBody } from "../../_lib/http";
import type { SubscriptionPlan, SubscriptionCycle } from "../../_lib/types";

const PRICE_IDS = (env: { STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID: string; STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID: string; STRIPE_BUSINESS_MONTHLY_PRICE_ID: string; STRIPE_BUSINESS_ANNUAL_PRICE_ID: string }) => ({
	professional: { monthly: env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID, annual: env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID },
	business: { monthly: env.STRIPE_BUSINESS_MONTHLY_PRICE_ID, annual: env.STRIPE_BUSINESS_ANNUAL_PRICE_ID },
});

// POST /api/billing/checkout?workspace_id=...
// Body: { plan, cycle, agent_count, workspace_name, email }
export const onRequestPost = withWorkspace(async ({ request, env, workspaceId, payload }) => {
	const parsed = await parseJsonBody(request);
	if (!parsed.ok) return parsed.response;

	const { plan, cycle, agent_count, workspace_name, email } = parsed.body;

	if (plan !== "professional" && plan !== "business") return jsonError("Invalid plan");
	if (cycle !== "monthly" && cycle !== "annual") return jsonError("Invalid cycle");

	const agentCount = typeof agent_count === "number" && agent_count >= 1 ? Math.floor(agent_count) : 1;

	if (!env.STRIPE_SECRET_KEY) return jsonError("Stripe is not configured", 500);

	const stripe = new Stripe(env.STRIPE_SECRET_KEY);
	const priceIds = PRICE_IDS(env);
	const priceId = priceIds[plan as SubscriptionPlan][cycle as SubscriptionCycle];

	if (!priceId) return jsonError("Stripe price not configured for this plan", 500);

	// Get workspace slug for redirect URLs
	const workspace = await findWorkspaceById(env.DB, workspaceId);
	if (!workspace) return jsonError("Workspace not found", 404);

	// Check if workspace already has a subscription with a Stripe customer
	const existing = await findSubscriptionByWorkspace(env.DB, workspaceId);

	let customerId: string;

	if (existing) {
		// Re-use existing customer — retrieve from stripe
		const sub = await env.DB
			.prepare(`SELECT stripe_customer_id FROM subscriptions WHERE workspace_id = ? LIMIT 1`)
			.bind(workspaceId)
			.first<{ stripe_customer_id: string }>();

		if (!sub) return jsonError("Subscription data inconsistent", 500);
		customerId = sub.stripe_customer_id;
	} else {
		// Create a new Stripe customer
		const customer = await stripe.customers.create({
			email: typeof email === "string" ? email : payload.email,
			name: typeof workspace_name === "string" ? workspace_name : undefined,
			metadata: { workspace_id: workspaceId },
		});
		customerId = customer.id;

		// Pre-create subscription record so we have the customer ID stored
		await createSubscription(env.DB, {
			workspace_id: workspaceId,
			stripe_customer_id: customerId,
			plan: plan as SubscriptionPlan,
			cycle: cycle as SubscriptionCycle,
			status: "incomplete",
			agent_count: agentCount,
		});
	}

	const session = await stripe.checkout.sessions.create({
		mode: "subscription",
		customer: customerId,
		line_items: [{ price: priceId, quantity: agentCount }],
		subscription_data: {
			trial_period_days: existing ? undefined : 14,
			metadata: {
				workspace_id: workspaceId,
				plan: plan as string,
				cycle: cycle as string,
			},
		},
		success_url: `${env.APP_URL}/w/${workspace.slug}/settings?billing=success`,
		cancel_url: `${env.APP_URL}/w/${workspace.slug}/settings?billing=canceled`,
		allow_promotion_codes: true,
	});

	if (!session.url) return jsonError("Failed to create checkout session", 500);

	return jsonOk({ url: session.url });
});
