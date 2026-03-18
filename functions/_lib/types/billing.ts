export type SubscriptionPlan = "professional" | "business";
export type SubscriptionCycle = "monthly" | "annual";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export interface SubscriptionRow {
	id: string;
	workspace_id: string;
	stripe_customer_id: string;
	stripe_subscription_id: string | null;
	plan: SubscriptionPlan;
	cycle: SubscriptionCycle;
	status: SubscriptionStatus;
	agent_count: number;
	trial_ends_at: number | null;
	current_period_start: number | null;
	current_period_end: number | null;
	created_at: number;
	updated_at: number;
}

export interface PublicSubscription {
	id: string;
	workspace_id: string;
	plan: SubscriptionPlan;
	cycle: SubscriptionCycle;
	status: SubscriptionStatus;
	agent_count: number;
	trial_ends_at: number | null;
	current_period_start: number | null;
	current_period_end: number | null;
	created_at: number;
}
