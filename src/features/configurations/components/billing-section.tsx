import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Zap, ArrowRight, CheckCircle2, Receipt, ExternalLink, Users, CalendarDays, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useWorkspace } from "@/context/workspace-context";
import {
	apiGetSubscription,
	apiCreateCheckoutSession,
	apiCreatePortalSession,
	type Subscription,
	type SubscriptionPlan,
	type SubscriptionCycle,
} from "../api/billing-api";

const PLANS = [
	{
		id: "starter" as SubscriptionPlan,
		name: "Pulse Starter",
		priceMonthly: 9,
		priceAnnual: 7,
		flat: true,
		maxAgents: 2,
		features: ["Up to 2 agents", "300 tickets / month", "2 channels (email + chat)", "Unified inbox", "Canned replies", "Basic automations"],
	},
	{
		id: "core" as SubscriptionPlan,
		name: "Pulse Core",
		priceMonthly: 19,
		priceAnnual: 15,
		flat: false,
		features: ["Unlimited tickets", "All channels unified", "AI Classification & Routing", "Team workload management", "Analytics dashboard", "24/7 Priority support"],
	},
	{
		id: "enterprise" as SubscriptionPlan,
		name: "Pulse Enterprise",
		priceMonthly: 39,
		priceAnnual: 31,
		flat: false,
		features: ["Everything in Core", "AI Auto-resolution Engine", "Sovereign Data Residency", "Dedicated Success Architect", "Custom SLA Frameworks", "99.99% Uptime Guarantee"],
	},
];

const PLAN_RANK: Record<SubscriptionPlan, number> = { starter: 0, core: 1, enterprise: 2 };

function statusBadge(status: string) {
	if (status === "active") return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">Active</Badge>;
	if (status === "trialing") return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Trial</Badge>;
	if (status === "past_due") return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">Past due</Badge>;
	if (status === "canceled") return <Badge variant="secondary" className="text-[10px]">Canceled</Badge>;
	return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
}

function NoSubscription({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
	const [plan, setPlan] = useState<SubscriptionPlan>("core");
	const [cycle, setCycle] = useState<SubscriptionCycle>("monthly");
	const [agents, setAgents] = useState(5);
	const [loading, setLoading] = useState(false);

	const currentPlan = PLANS.find((p) => p.id === plan)!;
	const pricePerAgent = cycle === "annual" ? currentPlan.priceAnnual : currentPlan.priceMonthly;
	const effectiveAgents = currentPlan.flat ? Math.min(agents, currentPlan.maxAgents ?? agents) : agents;
	const total = currentPlan.flat ? pricePerAgent : pricePerAgent * effectiveAgents;

	async function handleCheckout() {
		setLoading(true);
		try {
			const url = await apiCreateCheckoutSession({
				workspace_id: workspaceId,
				plan,
				cycle,
				agent_count: effectiveAgents,
				workspace_name: workspaceName,
			});
			window.location.href = url;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to start checkout");
			setLoading(false);
		}
	}

	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Choose a Plan</CardTitle>
					<CardDescription className="text-xs">Start your 14-day free trial — no credit card required upfront</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					{/* Billing cycle toggle */}
					<div className="flex items-center gap-2">
						{(["monthly", "annual"] as SubscriptionCycle[]).map((c) => (
							<button
								key={c}
								onClick={() => setCycle(c)}
								className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${cycle === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
								{c === "monthly" ? "Monthly" : "Annual (save 20%)"}
							</button>
						))}
					</div>

					{/* Plan cards */}
					<div className="grid gap-3 sm:grid-cols-3">
						{PLANS.map((p) => {
							const price = cycle === "annual" ? p.priceAnnual : p.priceMonthly;
							const isSelected = plan === p.id;
							return (
								<button
									key={p.id}
									onClick={() => setPlan(p.id)}
									className={`rounded-xl border p-4 text-left transition-all ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}>
									<div className="flex items-center justify-between mb-2">
										<p className="text-xs font-bold">{p.name}</p>
										<p className="text-sm font-black tabular-nums">${price}<span className="text-[10px] font-normal text-muted-foreground">{p.flat ? "/mo" : "/agent/mo"}</span></p>
									</div>
									<ul className="space-y-1">
										{p.features.slice(0, 3).map((f) => (
											<li key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
												<CheckCircle2 className="size-2.5 text-primary shrink-0" />
												{f}
											</li>
										))}
									</ul>
								</button>
							);
						})}
					</div>

					{/* Agent count */}
					<div className="flex items-center justify-between gap-4 rounded-xl border p-3">
						<div>
							<p className="text-xs font-semibold">Number of agents</p>
							<p className="text-[10px] text-muted-foreground">Active support agents in your workspace</p>
						</div>
						<div className="flex items-center gap-2">
							<button onClick={() => setAgents(Math.max(1, agents - 1))} className="size-7 rounded-lg border flex items-center justify-center hover:border-primary/50 text-sm font-bold">-</button>
							<span className="text-sm font-black tabular-nums w-6 text-center">{agents}</span>
							<button onClick={() => setAgents(agents + 1)} className="size-7 rounded-lg border flex items-center justify-center hover:border-primary/50 text-sm font-bold">+</button>
						</div>
					</div>

					{/* Summary + CTA */}
					<div className="rounded-xl bg-secondary/50 p-3 flex items-center justify-between gap-4">
						<div>
							<p className="text-xs text-muted-foreground">Total</p>
							<p className="text-lg font-black tabular-nums">${total}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
							<p className="text-[10px] text-muted-foreground">{currentPlan.flat ? `Flat · up to ${currentPlan.maxAgents} agents` : `$${pricePerAgent} × ${effectiveAgents} agents`}</p>
						</div>
						<Button size="sm" className="gap-1.5 h-8 text-xs" onClick={handleCheckout} disabled={loading}>
							{loading ? <Loader2 className="size-3 animate-spin" /> : <ArrowRight className="size-3" />}
							Start free trial
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function ActiveSubscription({ sub, workspaceId }: { sub: Subscription; workspaceId: string }) {
	const [portalLoading, setPortalLoading] = useState(false);
	const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

	const currentPlan = PLANS.find((p) => p.id === sub.plan) ?? PLANS[1];
	const otherPlans = PLANS.filter((p) => p.id !== currentPlan.id);
	const pricePerAgent = sub.cycle === "annual" ? currentPlan.priceAnnual : currentPlan.priceMonthly;
	const totalMonthly = currentPlan.flat ? pricePerAgent : pricePerAgent * sub.agent_count;

	async function openPortal() {
		setPortalLoading(true);
		try {
			const url = await apiCreatePortalSession(workspaceId);
			window.location.href = url;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to open billing portal");
			setPortalLoading(false);
		}
	}

	async function switchCycle() {
		const newCycle: SubscriptionCycle = sub.cycle === "monthly" ? "annual" : "monthly";
		setCheckoutLoading("cycle");
		try {
			const url = await apiCreateCheckoutSession({
				workspace_id: workspaceId,
				plan: sub.plan,
				cycle: newCycle,
				agent_count: sub.agent_count,
			});
			window.location.href = url;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to switch billing cycle");
			setCheckoutLoading(null);
		}
	}

	async function changePlan(plan: SubscriptionPlan) {
		setCheckoutLoading(plan);
		try {
			const url = await apiCreateCheckoutSession({
				workspace_id: workspaceId,
				plan,
				cycle: sub.cycle,
				agent_count: sub.agent_count,
			});
			window.location.href = url;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to change plan");
			setCheckoutLoading(null);
		}
	}

	return (
		<div className="grid gap-4">
			{/* Current plan */}
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Current Plan</CardTitle>
							<CardDescription className="text-xs">Your active subscription and usage</CardDescription>
						</div>
						{statusBadge(sub.status)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-xl flex items-center justify-center bg-primary/10">
								<Zap className="size-4 text-primary" />
							</div>
							<div>
								<p className="text-sm font-bold">{currentPlan.name}</p>
								<p className="text-[10px] text-muted-foreground capitalize">{sub.cycle} billing</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-xl font-black tabular-nums">${totalMonthly}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
							<p className="text-[10px] text-muted-foreground">${pricePerAgent} × {sub.agent_count} agents</p>
						</div>
					</div>

					<Separator />

					<div className="grid grid-cols-3 gap-4 text-center">
						<div>
							<div className="flex items-center justify-center gap-1.5 mb-1">
								<Users className="size-3 text-muted-foreground" />
								<p className="text-[10px] text-muted-foreground">Agents</p>
							</div>
							<p className="text-sm font-bold">{sub.agent_count}</p>
						</div>
						<div>
							<div className="flex items-center justify-center gap-1.5 mb-1">
								<CalendarDays className="size-3 text-muted-foreground" />
								<p className="text-[10px] text-muted-foreground">Next billing</p>
							</div>
							<p className="text-sm font-bold">
								{sub.current_period_end
									? new Date(sub.current_period_end * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
									: "—"}
							</p>
						</div>
						<div>
							<div className="flex items-center justify-center gap-1.5 mb-1">
								<TrendingUp className="size-3 text-muted-foreground" />
								<p className="text-[10px] text-muted-foreground">Annual total</p>
							</div>
							<p className="text-sm font-bold">${(totalMonthly * 12).toLocaleString()}</p>
						</div>
					</div>

					{sub.status === "trialing" && sub.trial_ends_at && (
						<>
							<Separator />
							<div className="flex items-center gap-2 rounded-lg bg-blue-500/8 border border-blue-500/20 px-3 py-2">
								<AlertCircle className="size-3.5 text-blue-500 shrink-0" />
								<p className="text-[10px] text-blue-600">
									Free trial ends on {new Date(sub.trial_ends_at * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
								</p>
							</div>
						</>
					)}

					{sub.status === "past_due" && (
						<>
							<Separator />
							<div className="flex items-center gap-2 rounded-lg bg-red-500/8 border border-red-500/20 px-3 py-2">
								<AlertCircle className="size-3.5 text-red-500 shrink-0" />
								<p className="text-[10px] text-red-600">
									Your last payment failed. Update your payment method to keep your subscription active.
								</p>
							</div>
						</>
					)}

					<Separator />

					<div className="flex gap-2 flex-wrap">
						<Button size="sm" className="h-7 text-xs gap-1.5" onClick={openPortal} disabled={portalLoading}>
							{portalLoading ? <Loader2 className="size-3 animate-spin" /> : <CreditCard className="size-3" />}
							Manage subscription
							{!portalLoading && <ExternalLink className="size-3 opacity-60" />}
						</Button>
						<Button size="sm" variant="outline" className="h-7 text-xs" onClick={switchCycle} disabled={checkoutLoading === "cycle"}>
							{checkoutLoading === "cycle" && <Loader2 className="size-3 animate-spin mr-1" />}
							{sub.cycle === "monthly" ? "Switch to annual (save 20%)" : "Switch to monthly"}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Upgrade / downgrade */}
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Available Plans</CardTitle>
					<CardDescription className="text-xs">Upgrade or downgrade at any time — changes are prorated</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{otherPlans.map((other) => {
						const isUpgrade = PLAN_RANK[other.id] > PLAN_RANK[sub.plan];
						const price = sub.cycle === "annual" ? other.priceAnnual : other.priceMonthly;
						return (
							<div key={other.id} className="rounded-xl border p-4 flex items-start gap-4">
								<div className="size-9 rounded-lg flex items-center justify-center bg-primary/10 shrink-0">
									<Zap className="size-4 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between gap-2">
										<p className="text-sm font-bold">{other.name}</p>
										<p className="text-sm font-black tabular-nums">
											${price}
											<span className="text-[10px] font-normal text-muted-foreground">{other.flat ? "/mo" : "/agent/mo"}</span>
										</p>
									</div>
									<ul className="mt-2 space-y-1">
										{other.features.slice(0, 4).map((f) => (
											<li key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
												<CheckCircle2 className="size-3 text-primary shrink-0" />
												{f}
											</li>
										))}
									</ul>
								</div>
								<Button
									size="sm"
									variant={isUpgrade ? "default" : "outline"}
									className="h-7 text-xs shrink-0 gap-1"
									onClick={() => changePlan(other.id)}
									disabled={checkoutLoading === other.id}>
									{checkoutLoading === other.id
										? <Loader2 className="size-3 animate-spin" />
										: <ArrowRight className="size-3" />}
									{isUpgrade ? "Upgrade" : "Downgrade"}
								</Button>
							</div>
						);
					})}
				</CardContent>
			</Card>
		</div>
	);
}

export function BillingSection() {
	const { workspace } = useWorkspace();

	const { data: sub, isLoading, isError } = useQuery({
		queryKey: ["subscription", workspace.id],
		queryFn: () => apiGetSubscription(workspace.id),
		retry: false,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12 text-muted-foreground">
				<Loader2 className="size-4 animate-spin mr-2" />
				<span className="text-sm">Loading billing info...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
				<AlertCircle className="size-4 text-destructive shrink-0" />
				<p className="text-xs text-destructive">Failed to load billing information. Please try again.</p>
			</div>
		);
	}

	if (!sub) {
		return <NoSubscription workspaceId={workspace.id} workspaceName={workspace.name} />;
	}

	return <ActiveSubscription sub={sub} workspaceId={workspace.id} />;
}
