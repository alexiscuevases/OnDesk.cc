import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, X, Star, Users, Zap, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const PLANS = [
	{
		name: "Starter",
		price: { monthly: "$29", annual: "$23" },
		period: "/mo",
		description: "Perfect for small teams just getting started with structured support.",
		cta: "Start free trial",
		href: "/signup",
		highlight: false,
		features: [
			"Up to 5 agents",
			"1,000 tickets / month",
			"Email & web widget",
			"Basic AI triage",
			"Standard SLA tracking",
			"7-day analytics history",
			"Email support",
		],
		missing: ["Microsoft 365 SSO", "Advanced AI agents", "Custom reporting", "Data residency", "Dedicated CSM"],
	},
	{
		name: "Professional",
		price: { monthly: "$89", annual: "$71" },
		period: "/mo",
		description: "For growing teams that need AI automation and deeper integrations.",
		cta: "Start free trial",
		href: "/signup",
		highlight: true,
		badge: "Most popular",
		features: [
			"Up to 25 agents",
			"10,000 tickets / month",
			"All Starter channels + Teams",
			"Full AI agents (auto-resolve)",
			"Advanced SLA with breach alerts",
			"90-day analytics history",
			"Microsoft 365 SSO",
			"Custom SLA tiers",
			"Priority support (24h SLA)",
		],
		missing: ["Custom reporting", "Data residency", "Dedicated CSM"],
	},
	{
		name: "Enterprise",
		price: { monthly: "Custom", annual: "Custom" },
		period: "",
		description: "Unlimited scale, custom integrations, and white-glove onboarding.",
		cta: "Talk to sales",
		href: "/contact",
		highlight: false,
		features: [
			"Unlimited agents",
			"Unlimited tickets",
			"All Professional features",
			"Custom AI workflows",
			"Advanced analytics & reporting",
			"Data residency (US/EU/APAC)",
			"Customer-managed encryption",
			"Dedicated Customer Success Manager",
			"Custom SLAs & contracts",
			"SSO & SAML",
		],
		missing: [],
	},
];

const LOGOS = ["Contoso", "Fabrikam", "Northwind", "Tailwind", "Adventure Works", "Wingtip"];

const TESTIMONIALS = [
	{
		quote: "We evaluated six tools. SupportDesk 365 was the only one that had a real Microsoft Teams native experience — not just a webhook.",
		author: "Marcus Rivera",
		role: "IT Director",
		company: "Fabrikam Inc.",
		plan: "Professional",
	},
	{
		quote: "Went from 22 agents to 9 handling the same volume. The ROI paid for three years of Enterprise in the first quarter.",
		author: "Priya Patel",
		role: "VP Operations",
		company: "Northwind Traders",
		plan: "Enterprise",
	},
];

const FAQ = [
	{
		q: "Can I change plans later?",
		a: "Yes. Upgrades take effect immediately; downgrades apply at the next billing cycle. There are no lock-in fees.",
	},
	{
		q: "What counts as a ticket?",
		a: "Each unique inbound conversation — regardless of channel — counts as one ticket. Follow-up messages in the same thread do not.",
	},
	{
		q: "Is there a free trial?",
		a: "All paid plans include a 14-day free trial with full feature access. No credit card required to start.",
	},
	{
		q: "Do you offer discounts for non-profits?",
		a: "Yes — contact us for our non-profit and education pricing. We offer up to 40% off for qualifying organizations.",
	},
	{
		q: "Where is our data stored?",
		a: "Starter and Professional data is stored in the US by default. Enterprise customers choose their region: US, EU, or APAC.",
	},
	{
		q: "What happens when I exceed my ticket limit?",
		a: "You get an in-app alert at 80% usage. If you exceed the limit you can upgrade, purchase an overage pack, or tickets queue until the next billing cycle.",
	},
];

const COMPARE_ROWS = [
	{ feature: "Agents included", starter: "5", pro: "25", enterprise: "Unlimited" },
	{ feature: "Tickets / month", starter: "1,000", pro: "10,000", enterprise: "Unlimited" },
	{ feature: "AI auto-resolve", starter: "Basic", pro: "Full", enterprise: "Custom" },
	{ feature: "Microsoft 365 SSO", starter: false, pro: true, enterprise: true },
	{ feature: "SLA breach alerts", starter: false, pro: true, enterprise: true },
	{ feature: "Custom AI workflows", starter: false, pro: false, enterprise: true },
	{ feature: "Data residency", starter: false, pro: false, enterprise: true },
	{ feature: "Dedicated CSM", starter: false, pro: false, enterprise: true },
	{ feature: "Support SLA", starter: "Email", pro: "24-hour", enterprise: "Custom" },
];

export default function PricingPage() {
	const [annual, setAnnual] = useState(false);
	const [openFaq, setOpenFaq] = useState<number | null>(null);

	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 text-center">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
						<Zap className="size-3.5" />
						14-day free trial — no credit card required
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">Simple, transparent pricing</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty mb-8">
						Start free for 14 days, then choose the plan that fits your team. No hidden fees, no per-ticket surprises.
					</p>

					{/* Billing toggle */}
					<div className="inline-flex items-center gap-3 p-1 rounded-full border border-border bg-card">
						<button
							onClick={() => setAnnual(false)}
							className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!annual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
							Monthly
						</button>
						<button
							onClick={() => setAnnual(true)}
							className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
							Annual
							<span
								className={`text-xs px-1.5 py-0.5 rounded-full font-semibold transition-colors ${annual ? "bg-primary-foreground/20 text-primary-foreground" : "bg-success/15 text-success"}`}>
								Save 20%
							</span>
						</button>
					</div>
				</div>
			</section>

			{/* Plans */}
			<section className="container mx-auto px-4 py-20 md:py-24">
				<div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
					{PLANS.map((plan) => (
						<div
							key={plan.name}
							className={`relative rounded-2xl border p-8 flex flex-col gap-6 transition-all duration-300 ${plan.highlight ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]" : "border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"}`}>
							{plan.highlight && plan.badge && (
								<span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-sm">
									{plan.badge}
								</span>
							)}

							<div>
								<h3 className="text-lg font-bold mb-1">{plan.name}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
							</div>

							<div className="flex items-end gap-1">
								<span className="text-4xl font-black transition-all duration-300">{annual ? plan.price.annual : plan.price.monthly}</span>
								{plan.period && <span className="text-muted-foreground mb-1">{plan.period}</span>}
							</div>
							{annual && plan.price.annual !== "Custom" && (
								<p className="text-xs text-success font-medium -mt-4">Billed annually — you save 20%</p>
							)}

							<Button size="lg" asChild variant={plan.highlight ? "default" : "outline"} className="group h-11 w-full">
								<a href={plan.href}>
									{plan.cta}
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>

							<ul className="space-y-2.5">
								{plan.features.map((f) => (
									<li key={f} className="flex items-start gap-2.5 text-sm">
										<CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
										{f}
									</li>
								))}
								{plan.missing.map((f) => (
									<li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/50">
										<X className="size-4 shrink-0 mt-0.5" />
										{f}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Trust row */}
				<div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
					{[
						{ icon: Shield, text: "SOC 2 Type II certified" },
						{ icon: Zap, text: "99.97% uptime SLA" },
						{ icon: Users, text: "1,200+ customers" },
						{ icon: Star, text: "4.9 / 5 average rating" },
					].map(({ icon: Icon, text }) => (
						<span key={text} className="flex items-center gap-1.5">
							<Icon className="size-4 text-primary" />
							{text}
						</span>
					))}
				</div>
			</section>

			{/* Social proof */}
			<section className="border-y border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4">
					<p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">Trusted by teams at</p>
					<div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-14">
						{LOGOS.map((l) => (
							<span key={l} className="text-muted-foreground/50 font-semibold text-sm tracking-wide">
								{l}
							</span>
						))}
					</div>
					<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
						{TESTIMONIALS.map(({ quote, author, role, company, plan }) => (
							<div key={author} className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card">
								<div className="flex gap-1">
									{Array.from({ length: 5 }).map((_, i) => (
										<Star key={i} className="size-3.5 fill-primary text-primary" />
									))}
								</div>
								<blockquote className="text-sm text-foreground leading-relaxed">"{quote}"</blockquote>
								<div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
									<div>
										<p className="text-sm font-semibold">{author}</p>
										<p className="text-xs text-muted-foreground">
											{role}, {company}
										</p>
									</div>
									<span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
										{plan} plan
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Feature comparison table */}
			<section className="container mx-auto px-4 py-20">
				<h2 className="text-3xl font-bold text-center mb-10">Compare plans</h2>
				<div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card overflow-hidden">
					{/* Header */}
					<div className="grid grid-cols-4 divide-x divide-border bg-muted/30">
						<div className="p-4 text-sm font-semibold">Feature</div>
						{["Starter", "Professional", "Enterprise"].map((p) => (
							<div key={p} className={`p-4 text-sm font-semibold text-center ${p === "Professional" ? "text-primary" : ""}`}>
								{p}
							</div>
						))}
					</div>
					{/* Rows */}
					<div className="divide-y divide-border">
						{COMPARE_ROWS.map(({ feature, starter, pro, enterprise }) => (
							<div key={feature} className="grid grid-cols-4 divide-x divide-border hover:bg-muted/20 transition-colors">
								<div className="px-4 py-3 text-sm text-muted-foreground">{feature}</div>
								{([starter, pro, enterprise] as (string | boolean)[]).map((val, i) => (
									<div key={i} className="px-4 py-3 text-sm text-center flex items-center justify-center">
										{typeof val === "boolean" ? (
											val ? (
												<CheckCircle2 className="size-4 text-primary" />
											) : (
												<X className="size-4 text-muted-foreground/30" />
											)
										) : (
											<span className={i === 1 ? "font-medium text-primary" : ""}>{val}</span>
										)}
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="border-t border-border bg-muted/10 py-20">
				<div className="container mx-auto px-4 max-w-2xl">
					<h2 className="text-3xl font-bold mb-10 text-center">Frequently asked questions</h2>
					<div className="space-y-2">
						{FAQ.map(({ q, a }, i) => (
							<div key={q} className="rounded-xl border border-border bg-card overflow-hidden">
								<button
									onClick={() => setOpenFaq(openFaq === i ? null : i)}
									className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold hover:bg-muted/30 transition-colors">
									{q}
									{openFaq === i ? (
										<ChevronUp className="size-4 text-muted-foreground shrink-0" />
									) : (
										<ChevronDown className="size-4 text-muted-foreground shrink-0" />
									)}
								</button>
								{openFaq === i && (
									<div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{a}</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="py-20 border-t border-border">
				<div className="container mx-auto px-4 text-center max-w-2xl">
					<h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
					<p className="text-muted-foreground mb-8 leading-relaxed">
						Talk to our team. We will walk you through the right plan for your team size and support volume — no pressure.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3">
						<Button size="lg" asChild className="group h-12 px-8">
							<a href="/contact">
								Talk to sales
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="h-12 px-8">
							<a href="/signup">Start free trial</a>
						</Button>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
