import type { SubscriptionRow, PublicSubscription, SubscriptionPlan, SubscriptionCycle, SubscriptionStatus } from "../types";

export async function findSubscriptionByWorkspace(
	db: D1Database,
	workspaceId: string
): Promise<PublicSubscription | null> {
	const row = await db
		.prepare(
			`SELECT id, workspace_id, plan, cycle, status, agent_count,
			        trial_ends_at, current_period_start, current_period_end, created_at
			 FROM subscriptions WHERE workspace_id = ? LIMIT 1`
		)
		.bind(workspaceId)
		.first<PublicSubscription>();
	return row ?? null;
}

export async function findSubscriptionByStripeCustomer(
	db: D1Database,
	stripeCustomerId: string
): Promise<SubscriptionRow | null> {
	const row = await db
		.prepare(`SELECT * FROM subscriptions WHERE stripe_customer_id = ? LIMIT 1`)
		.bind(stripeCustomerId)
		.first<SubscriptionRow>();
	return row ?? null;
}

export async function findSubscriptionByStripeSubscriptionId(
	db: D1Database,
	stripeSubscriptionId: string
): Promise<SubscriptionRow | null> {
	const row = await db
		.prepare(`SELECT * FROM subscriptions WHERE stripe_subscription_id = ? LIMIT 1`)
		.bind(stripeSubscriptionId)
		.first<SubscriptionRow>();
	return row ?? null;
}

export async function createSubscription(
	db: D1Database,
	data: {
		workspace_id: string;
		stripe_customer_id: string;
		stripe_subscription_id?: string;
		plan: SubscriptionPlan;
		cycle: SubscriptionCycle;
		status: SubscriptionStatus;
		agent_count: number;
		trial_ends_at?: number;
		current_period_start?: number;
		current_period_end?: number;
	}
): Promise<void> {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO subscriptions
			 (id, workspace_id, stripe_customer_id, stripe_subscription_id, plan, cycle, status,
			  agent_count, trial_ends_at, current_period_start, current_period_end)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			id,
			data.workspace_id,
			data.stripe_customer_id,
			data.stripe_subscription_id ?? null,
			data.plan,
			data.cycle,
			data.status,
			data.agent_count,
			data.trial_ends_at ?? null,
			data.current_period_start ?? null,
			data.current_period_end ?? null
		)
		.run();
}

export async function upsertSubscriptionFromStripe(
	db: D1Database,
	data: {
		stripe_customer_id: string;
		stripe_subscription_id: string;
		plan: SubscriptionPlan;
		cycle: SubscriptionCycle;
		status: SubscriptionStatus;
		agent_count: number;
		trial_ends_at?: number | null;
		current_period_start?: number | null;
		current_period_end?: number | null;
	}
): Promise<void> {
	await db
		.prepare(
			`UPDATE subscriptions
			 SET stripe_subscription_id = ?, plan = ?, cycle = ?, status = ?,
			     agent_count = ?, trial_ends_at = ?, current_period_start = ?,
			     current_period_end = ?, updated_at = unixepoch()
			 WHERE stripe_customer_id = ?`
		)
		.bind(
			data.stripe_subscription_id,
			data.plan,
			data.cycle,
			data.status,
			data.agent_count,
			data.trial_ends_at ?? null,
			data.current_period_start ?? null,
			data.current_period_end ?? null,
			data.stripe_customer_id
		)
		.run();
}

export async function updateSubscriptionStatus(
	db: D1Database,
	stripeSubscriptionId: string,
	status: SubscriptionStatus
): Promise<void> {
	await db
		.prepare(
			`UPDATE subscriptions SET status = ?, updated_at = unixepoch()
			 WHERE stripe_subscription_id = ?`
		)
		.bind(status, stripeSubscriptionId)
		.run();
}
