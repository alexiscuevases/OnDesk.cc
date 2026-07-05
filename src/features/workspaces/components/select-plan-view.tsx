import { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	apiCreateCheckoutSession,
	type SubscriptionPlan,
	type SubscriptionCycle,
} from "@/features/configurations/api/billing-api";

const PLANS = [
	{
		id: "starter" as SubscriptionPlan,
		name: "Pulse Starter",
		priceMonthly: 9,
		priceAnnual: 7,
		flat: true,
		maxAgents: 2,
		features: [
			"Up to 2 agents",
			"300 tickets / month",
			"2 channels (email + chat)",
			"Unified inbox",
			"Canned replies",
			"Basic automations",
		],
	},
	{
		id: "core" as SubscriptionPlan,
		name: "Pulse Core",
		priceMonthly: 19,
		priceAnnual: 15,
		flat: false,
		features: [
			"Unlimited tickets",
			"All channels unified",
			"AI Classification & Routing",
			"Team workload management",
			"Analytics dashboard",
			"24/7 Priority support",
		],
	},
	{
		id: "enterprise" as SubscriptionPlan,
		name: "Pulse Enterprise",
		priceMonthly: 39,
		priceAnnual: 31,
		flat: false,
		features: [
			"Everything in Core",
			"AI Auto-resolution Engine",
			"Sovereign Data Residency",
			"Dedicated Success Architect",
			"Custom SLA Frameworks",
			"99.99% Uptime Guarantee",
		],
	},
];

interface SelectPlanViewProps {
	workspaceId: string;
	workspaceName: string;
}

export function SelectPlanView({ workspaceId, workspaceName }: SelectPlanViewProps) {
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
		<div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
			<div className="w-full max-w-xl space-y-6">
				{/* Step indicator */}
				<div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em] mb-2">
					<div className="flex items-center gap-2">
						<span className="size-6 flex items-center justify-center font-mono text-[11px] font-bold bg-primary text-primary-foreground">
							<Check className="size-3" />
						</span>
						<span className="text-muted-foreground">Details</span>
					</div>
					<div className="flex-1 h-px bg-border" />
					<div className="flex items-center gap-2">
						<span className="size-6 flex items-center justify-center font-mono text-[11px] font-bold bg-primary text-primary-foreground">
							2
						</span>
						<span className="font-semibold text-foreground">Plan</span>
					</div>
				</div>

				{/* Header */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<div className="size-9 bg-primary flex items-center justify-center">
							<Zap className="size-4.5 text-primary-foreground" />
						</div>
						<span className="console-label text-primary dark:text-accent">
							Select plan<span className="blink-cursor text-accent">_</span>
						</span>
					</div>
					<h1 className="text-2xl font-black tracking-tight">Choose your plan</h1>
					<p className="text-sm text-muted-foreground">
						Start your 14-day free trial — no credit card required upfront.
					</p>
				</div>

				{/* Billing cycle toggle */}
				<div className="flex items-center gap-px border border-border bg-border w-fit">
					{(["monthly", "annual"] as SubscriptionCycle[]).map((c) => (
						<button
							key={c}
							onClick={() => setCycle(c)}
							className={`px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
								cycle === c
									? "bg-primary text-primary-foreground"
									: "bg-card text-muted-foreground hover:text-foreground"
							}`}>
							{c === "monthly" ? "Monthly" : "Annual (save 20%)"}
						</button>
					))}
				</div>

				{/* Plan cards */}
				<div className="grid gap-px border border-border bg-border sm:grid-cols-3">
					{PLANS.map((p) => {
						const price = cycle === "annual" ? p.priceAnnual : p.priceMonthly;
						const isSelected = plan === p.id;
						return (
							<button
								key={p.id}
								onClick={() => setPlan(p.id)}
								className={`group relative p-4 text-left transition-colors ${
									isSelected ? "bg-primary/5 dark:bg-accent/8" : "bg-card hover:bg-secondary/50"
								}`}>
								{isSelected && <span className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />}
								<div className="flex items-center justify-between mb-3">
									<p className="text-sm font-bold">{p.name}</p>
									<p className="text-lg font-black tabular-nums">
										${price}
										<span className="text-[10px] font-normal text-muted-foreground">{p.flat ? "/mo" : "/agent/mo"}</span>
									</p>
								</div>
								<ul className="space-y-1.5">
									{p.features.map((f) => (
										<li key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
											<CheckCircle2 className="size-2.5 text-accent shrink-0" />
											{f}
										</li>
									))}
								</ul>
							</button>
						);
					})}
				</div>

				{/* Agent count */}
				<div className="flex items-center justify-between gap-4 border p-4 bg-card">
					<div>
						<p className="text-sm font-semibold">Number of agents</p>
						<p className="text-xs text-muted-foreground">Active support agents in your workspace</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setAgents(Math.max(1, agents - 1))}
							className="size-8 border flex items-center justify-center hover:border-primary text-sm font-mono font-bold">
							-
						</button>
						<span className="font-mono text-sm font-black tabular-nums w-8 text-center">{agents}</span>
						<button
							onClick={() => setAgents(agents + 1)}
							className="size-8 border flex items-center justify-center hover:border-primary text-sm font-mono font-bold">
							+
						</button>
					</div>
				</div>

				{/* Summary + CTA */}
				<div className="bg-secondary/50 border p-4 flex items-center justify-between gap-4">
					<div>
						<p className="console-label">Total</p>
						<p className="text-2xl font-black tabular-nums">
							${total}
							<span className="text-sm font-normal text-muted-foreground">/mo</span>
						</p>
						<p className="text-xs text-muted-foreground">
							{currentPlan.flat ? `Flat rate · up to ${currentPlan.maxAgents} agents` : `$${pricePerAgent} × ${effectiveAgents} agents`}
						</p>
					</div>
					<Button className="gap-1.5" onClick={handleCheckout} disabled={loading}>
						{loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
						Start free trial
					</Button>
				</div>
			</div>
		</div>
	);
}
