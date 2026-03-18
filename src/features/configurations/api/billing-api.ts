export type SubscriptionPlan = "professional" | "business";
export type SubscriptionCycle = "monthly" | "annual";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export interface Subscription {
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

const API_BASE = "/api/billing";

export async function apiGetSubscription(workspaceId: string): Promise<Subscription | null> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
	if (res.status === 404) return null;
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch subscription");
	}
	const data = (await res.json()) as { subscription: Subscription };
	return data.subscription;
}

export async function apiCreateCheckoutSession(input: {
	workspace_id: string;
	plan: SubscriptionPlan;
	cycle: SubscriptionCycle;
	agent_count: number;
	workspace_name?: string;
	email?: string;
}): Promise<string> {
	const { workspace_id, ...body } = input;
	const res = await fetch(`${API_BASE}/checkout?workspace_id=${workspace_id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to create checkout session");
	}
	const data = (await res.json()) as { url: string };
	return data.url;
}

export async function apiCreatePortalSession(workspaceId: string): Promise<string> {
	const res = await fetch(`${API_BASE}/portal?workspace_id=${workspaceId}`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to create portal session");
	}
	const data = (await res.json()) as { url: string };
	return data.url;
}
