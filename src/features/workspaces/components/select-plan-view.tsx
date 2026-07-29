import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2, Zap, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StepIndicator } from "./workspace-step-indicator";
import {
	apiCreateCheckoutSession,
	type SubscriptionPlan,
	type SubscriptionCycle,
} from "@/features/configurations/api/billing-api";

const PLANS = [
	{
		id: "starter" as SubscriptionPlan,
		name: "Pulse Starter",
		tagline: "Solo & small teams",
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
		tagline: "Growing support teams",
		priceMonthly: 19,
		priceAnnual: 15,
		flat: false,
		recommended: true,
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
		tagline: "Scale & compliance",
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
	const navigate = useNavigate();
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
			<div className="w-full max-w-3xl">
				<StepIndicator step={2} className="mb-8" />

				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center gap-2 mb-3">
						<div className="size-9 bg-primary flex items-center justify-center shrink-0">
							<Zap className="size-4.5 text-primary-foreground" />
						</div>
						<span className="console-label text-primary dark:text-accent">
							Select plan<span className="blink-cursor text-accent">_</span>
						</span>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="space-y-1.5">
							<h1 className="text-2xl font-black tracking-tight">Choose your plan</h1>
							<p className="text-sm text-muted-foreground">
								Start your 14-day free trial — no credit card required upfront.
							</p>
						</div>

						{/* Billing cycle toggle */}
						<div className="flex items-center gap-px border border-border bg-border w-fit shrink-0">
							{(["monthly", "annual"] as SubscriptionCycle[]).map((c) => (
								<button
									key={c}
									onClick={() => setCycle(c)}
									className={`px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
										cycle === c
											? "bg-primary text-primary-foreground"
											: "bg-card text-muted-foreground hover:text-foreground"
									}`}>
									{c === "monthly" ? "Monthly" : "Annual −20%"}
								</button>
							))}
						</div>
					</div>
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
								aria-pressed={isSelected}
								className={`relative flex flex-col p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset ${
									isSelected ? "bg-primary/4 dark:bg-accent/10" : "bg-card hover:bg-secondary/60"
								}`}>
								{isSelected && <span className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />}

								{/* Name + recommended tag */}
								<div className="flex items-start justify-between gap-2 min-h-5">
									<p className="text-sm font-bold leading-5">{p.name}</p>
									{p.recommended && (
										<span className="bg-accent text-accent-foreground px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest shrink-0">
											Popular
										</span>
									)}
								</div>
								<p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
									{p.tagline}
								</p>

								{/* Price */}
								<div className="mt-4 flex items-end justify-between gap-2">
									<div className="flex items-baseline gap-1">
										<span className="text-3xl font-black tracking-tight tabular-nums leading-none">
											${price}
										</span>
										<span className="font-mono text-[10px] text-muted-foreground">
											{p.flat ? "/mo" : "/agent/mo"}
										</span>
									</div>
									<span
										className={`size-4 flex items-center justify-center shrink-0 transition-colors ${
											isSelected ? "bg-accent text-accent-foreground" : "border border-border"
										}`}>
										{isSelected && <Check className="size-3" strokeWidth={3} />}
									</span>
								</div>
								<p className="mt-1 font-mono text-[10px] text-muted-foreground/80 tabular-nums">
									{cycle === "annual" ? `billed yearly · was $${p.priceMonthly}` : "billed monthly"}
								</p>

								{/* Features */}
								<div className="-mx-5 my-4 h-px bg-border" />
								<ul className="space-y-2">
									{p.features.map((f) => (
										<li key={f} className="flex items-start gap-2 text-[11px] leading-4 text-muted-foreground">
											<CheckCircle2 className="size-3 text-accent shrink-0 mt-px" />
											<span>{f}</span>
										</li>
									))}
								</ul>
							</button>
						);
					})}
				</div>

				{/* Agent count */}
				<div className="mt-4 flex items-center justify-between gap-4 border p-4 bg-card">
					<div className="min-w-0">
						<p className="text-sm font-semibold">Number of agents</p>
						<p className="text-xs text-muted-foreground">
							{currentPlan.flat
								? `${currentPlan.name} is a flat rate for up to ${currentPlan.maxAgents} agents`
								: "Active support agents in your workspace"}
						</p>
					</div>
					<div className="flex items-center gap-px bg-border border border-border shrink-0">
						<button
							onClick={() => setAgents(Math.max(1, agents - 1))}
							disabled={currentPlan.flat || agents <= 1}
							aria-label="Remove one agent"
							className="size-8 bg-card flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card disabled:cursor-not-allowed">
							<Minus className="size-3.5" />
						</button>
						<span className="w-10 h-8 bg-card flex items-center justify-center font-mono text-sm font-black tabular-nums">
							{effectiveAgents}
						</span>
						<button
							onClick={() => setAgents(agents + 1)}
							disabled={currentPlan.flat}
							aria-label="Add one agent"
							className="size-8 bg-card flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card disabled:cursor-not-allowed">
							<Plus className="size-3.5" />
						</button>
					</div>
				</div>

				{/* Summary + CTA */}
				<div className="mt-4 border bg-secondary/50 p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="console-label">Total</p>
						<p className="text-2xl font-black tracking-tight tabular-nums">
							${total}
							<span className="text-sm font-normal text-muted-foreground">/mo</span>
						</p>
						<p className="font-mono text-[11px] text-muted-foreground tabular-nums">
							{currentPlan.flat
								? `Flat rate · up to ${currentPlan.maxAgents} agents`
								: `$${pricePerAgent} × ${effectiveAgents} agents`}
							{cycle === "annual" && ` · $${total * 12}/yr`}
						</p>
					</div>
					<Button className="gap-1.5 shrink-0" size="lg" onClick={handleCheckout} disabled={loading}>
						{loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
						Start free trial
					</Button>
				</div>

				{/* Back link */}
				<button
					onClick={() => navigate({ to: "/workspaces" })}
					className="mt-4 w-full flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors py-2">
					<ArrowLeft className="size-3.5" />
					Back to workspaces
				</button>
			</div>
		</div>
	);
}
