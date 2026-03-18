import { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	apiCreateCheckoutSession,
	type SubscriptionPlan,
	type SubscriptionCycle,
} from "@/features/configurations/api/billing-api";

const PLANS = [
	{
		id: "professional" as SubscriptionPlan,
		name: "Professional",
		priceMonthly: 15,
		priceAnnual: 12,
		features: [
			"Unlimited tickets",
			"Full AI auto-resolve engine",
			"Advanced SLA with breach alerts",
			"90-day analytics history",
			"Microsoft 365 SSO",
			"Priority support (24h SLA)",
		],
	},
	{
		id: "business" as SubscriptionPlan,
		name: "Business",
		priceMonthly: 29,
		priceAnnual: 23,
		features: [
			"Everything in Professional",
			"Custom AI workflows",
			"Advanced analytics & reporting",
			"Data residency (US / EU / APAC)",
			"Dedicated Customer Success Manager",
			"99.99% uptime SLA",
		],
	},
];

interface SelectPlanViewProps {
	workspaceId: string;
	workspaceName: string;
}

export function SelectPlanView({ workspaceId, workspaceName }: SelectPlanViewProps) {
	const [plan, setPlan] = useState<SubscriptionPlan>("professional");
	const [cycle, setCycle] = useState<SubscriptionCycle>("monthly");
	const [agents, setAgents] = useState(5);
	const [loading, setLoading] = useState(false);

	const currentPlan = PLANS.find((p) => p.id === plan)!;
	const pricePerAgent = cycle === "annual" ? currentPlan.priceAnnual : currentPlan.priceMonthly;

	async function handleCheckout() {
		setLoading(true);
		try {
			const url = await apiCreateCheckoutSession({
				workspace_id: workspaceId,
				plan,
				cycle,
				agent_count: agents,
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
				{/* Header */}
				<div className="text-center space-y-2">
					<div className="mx-auto size-12 rounded-2xl bg-primary flex items-center justify-center mb-4">
						<Zap className="size-6 text-primary-foreground" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight">Choose your plan</h1>
					<p className="text-sm text-muted-foreground">
						Start your 14-day free trial — no credit card required upfront.
					</p>
				</div>

				{/* Billing cycle toggle */}
				<div className="flex items-center justify-center gap-2">
					{(["monthly", "annual"] as SubscriptionCycle[]).map((c) => (
						<button
							key={c}
							onClick={() => setCycle(c)}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
								cycle === c
									? "bg-primary text-primary-foreground border-primary"
									: "border-border text-muted-foreground hover:border-primary/40"
							}`}>
							{c === "monthly" ? "Monthly" : "Annual (save 20%)"}
						</button>
					))}
				</div>

				{/* Plan cards */}
				<div className="grid gap-3 sm:grid-cols-2">
					{PLANS.map((p) => {
						const price = cycle === "annual" ? p.priceAnnual : p.priceMonthly;
						const isSelected = plan === p.id;
						return (
							<button
								key={p.id}
								onClick={() => setPlan(p.id)}
								className={`rounded-xl border p-4 text-left transition-all ${
									isSelected
										? "border-primary bg-primary/5 shadow-sm"
										: "border-border hover:border-primary/40"
								}`}>
								<div className="flex items-center justify-between mb-3">
									<p className="text-sm font-bold">{p.name}</p>
									<p className="text-lg font-black tabular-nums">
										${price}
										<span className="text-[10px] font-normal text-muted-foreground">/agent/mo</span>
									</p>
								</div>
								<ul className="space-y-1.5">
									{p.features.map((f) => (
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
				<div className="flex items-center justify-between gap-4 rounded-xl border p-4">
					<div>
						<p className="text-sm font-semibold">Number of agents</p>
						<p className="text-xs text-muted-foreground">Active support agents in your workspace</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setAgents(Math.max(1, agents - 1))}
							className="size-8 rounded-lg border flex items-center justify-center hover:border-primary/50 text-sm font-bold">
							-
						</button>
						<span className="text-sm font-black tabular-nums w-8 text-center">{agents}</span>
						<button
							onClick={() => setAgents(agents + 1)}
							className="size-8 rounded-lg border flex items-center justify-center hover:border-primary/50 text-sm font-bold">
							+
						</button>
					</div>
				</div>

				{/* Summary + CTA */}
				<div className="rounded-xl bg-secondary/50 border p-4 flex items-center justify-between gap-4">
					<div>
						<p className="text-xs text-muted-foreground">Total</p>
						<p className="text-2xl font-black tabular-nums">
							${pricePerAgent * agents}
							<span className="text-sm font-normal text-muted-foreground">/mo</span>
						</p>
						<p className="text-xs text-muted-foreground">
							${pricePerAgent} × {agents} agents
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
