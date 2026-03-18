import Stripe from "stripe";
import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import { upsertSubscriptionFromStripe, updateSubscriptionStatus } from "../../_lib/db";
import { jsonOk, jsonError } from "../../_lib/response";
import type { SubscriptionPlan, SubscriptionCycle, SubscriptionStatus } from "../../_lib/types";

// POST /api/billing/webhook — Stripe webhook handler (no auth, verified via signature)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const signature = request.headers.get("stripe-signature");
	if (!signature) return jsonError("Missing stripe-signature header", 400);

	const body = await request.text();

	const stripe = new Stripe(env.STRIPE_SECRET_KEY);

	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(body, signature, env.STRIPE_WEBHOOK_SECRET);
	} catch {
		return jsonError("Invalid webhook signature", 400);
	}

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;
			if (session.mode !== "subscription" || !session.subscription) break;

			const stripeSubscriptionId =
				typeof session.subscription === "string" ? session.subscription : session.subscription.id;

			const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

			await syncSubscriptionToDb(env.DB, stripeSubscription);
			break;
		}

		case "customer.subscription.updated": {
			const stripeSubscription = event.data.object as Stripe.Subscription;
			await syncSubscriptionToDb(env.DB, stripeSubscription);
			break;
		}

		case "customer.subscription.deleted": {
			const stripeSubscription = event.data.object as Stripe.Subscription;
			await updateSubscriptionStatus(env.DB, stripeSubscription.id, "canceled");
			break;
		}

		case "invoice.payment_failed": {
			const invoice = event.data.object as Stripe.Invoice;
			const subscriptionId = typeof invoice.subscription === "string"
				? invoice.subscription
				: invoice.subscription?.id;
			if (subscriptionId) {
				await updateSubscriptionStatus(env.DB, subscriptionId, "past_due");
			}
			break;
		}

		case "invoice.payment_succeeded": {
			const invoice = event.data.object as Stripe.Invoice;
			const subscriptionId = typeof invoice.subscription === "string"
				? invoice.subscription
				: invoice.subscription?.id;
			if (subscriptionId) {
				await updateSubscriptionStatus(env.DB, subscriptionId, "active");
			}
			break;
		}
	}

	return jsonOk({ received: true });
};

async function syncSubscriptionToDb(db: D1Database, sub: Stripe.Subscription): Promise<void> {
	const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
	const metadata = sub.metadata ?? {};

	const plan = (metadata.plan ?? "professional") as SubscriptionPlan;
	const cycle = (metadata.cycle ?? "monthly") as SubscriptionCycle;

	const status = mapStripeStatus(sub.status);

	const item = sub.items.data[0];
	const agentCount = item?.quantity ?? 1;

	await upsertSubscriptionFromStripe(db, {
		stripe_customer_id: customerId,
		stripe_subscription_id: sub.id,
		plan,
		cycle,
		status,
		agent_count: agentCount,
		trial_ends_at: sub.trial_end ?? null,
		current_period_start: sub.current_period_start ?? null,
		current_period_end: sub.current_period_end ?? null,
	});
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
	switch (status) {
		case "active":    return "active";
		case "trialing":  return "trialing";
		case "past_due":  return "past_due";
		case "canceled":  return "canceled";
		default:          return "incomplete";
	}
}
