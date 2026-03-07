import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, X, Star, Users, Zap, Shield, ChevronDown, Sparkles, TrendingUp, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useInView, useMountVisible, useMouseGlow, SectionBadge, CtaDecorations } from "./shared";



// ── Pricing data ──
// Price is per agent per month (USD)
const PLANS = [
	{
		name: "Professional",
		pricePerAgent: { monthly: 15, annual: 12 },
		description: "AI-powered support for growing teams. Everything you need to scale.",
		cta: "Start free trial",
		href: "/auth/signup",
		highlight: false,
		features: [
			"Unlimited tickets",
			"Email, web widget & Teams",
			"Full AI auto-resolve engine",
			"Advanced SLA with breach alerts",
			"90-day analytics history",
			"Microsoft 365 SSO",
			"Custom SLA tiers",
			"Priority support (24h SLA)",
		],
		missing: ["Custom AI workflows", "Data residency", "Dedicated CSM", "Custom contracts"],
	},
	{
		name: "Business",
		pricePerAgent: { monthly: 29, annual: 23 },
		description: "Enterprise power without the enterprise sales cycle.",
		cta: "Start free trial",
		href: "/auth/signup",
		highlight: true,
		badge: "Most popular",
		features: [
			"Everything in Professional",
			"Custom AI workflows",
			"Advanced analytics & reporting",
			"Data residency (US / EU / APAC)",
			"Customer-managed encryption",
			"Dedicated Customer Success Manager",
			"Custom SLAs & contracts",
			"SSO & SAML",
			"99.99% uptime SLA",
		],
		missing: [],
	},
];

const LOGOS = ["Contoso", "Fabrikam", "Northwind", "Tailwind", "Adventure Works", "Wingtip"];

const TESTIMONIALS = [
	{
		quote: "We evaluated six tools. OnDesk.cc was the only one that had a real Microsoft Teams native experience — not just a webhook.",
		author: "Marcus Rivera",
		role: "IT Director",
		company: "Fabrikam Inc.",
		plan: "Business",
	},
	{
		quote: "Went from 22 agents to 9 handling the same volume. The ROI paid for three years of Business in the first quarter.",
		author: "Priya Patel",
		role: "VP Operations",
		company: "Northwind Traders",
		plan: "Business",
	},
];

const FAQ = [
	{
		q: "How does per-agent pricing work?",
		a: "You pay for each active agent seat. Add or remove agents at any time — changes are prorated to the day. No minimum seat commitments on Professional.",
	},
	{
		q: "Can I change plans later?",
		a: "Yes. Upgrades take effect immediately; downgrades apply at the next billing cycle. There are no lock-in fees.",
	},
	{
		q: "What counts as an agent?",
		a: "Any user who can view, respond to, or manage tickets. Read-only viewers and admins who don't handle tickets are free.",
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
		a: "Professional data is stored in the US by default. Business customers choose their region: US, EU, or APAC.",
	},
];

const COMPARE_ROWS = [
	{ feature: "Tickets / month", pro: "Unlimited", biz: "Unlimited" },
	{ feature: "AI auto-resolve", pro: "Full", biz: "Full + Custom" },
	{ feature: "Microsoft 365 SSO", pro: true, biz: true },
	{ feature: "SLA breach alerts", pro: true, biz: true },
	{ feature: "Custom AI workflows", pro: false, biz: true },
	{ feature: "Data residency", pro: false, biz: true },
	{ feature: "Dedicated CSM", pro: false, biz: true },
	{ feature: "Uptime SLA", pro: "99.97%", biz: "99.99%" },
	{ feature: "Support SLA", pro: "24-hour", biz: "Custom" },
];

// ── Agent counter component ──
function AgentCounter({ agents, setAgents }: { agents: number; setAgents: (n: number) => void }) {
	const MIN = 1;
	const MAX = 150;

	const pct = ((agents - MIN) / (MAX - MIN)) * 100;

	return (
		<div
			className="relative rounded-2xl border p-6 md:p-8 max-w-2xl mx-auto w-full"
			style={{
				background: "var(--color-card)",
				borderColor: "color-mix(in srgb, var(--color-primary) 20%, var(--color-border))",
				boxShadow: "0 8px 40px -8px color-mix(in srgb, var(--color-primary) 12%, transparent)",
			}}>
			{/* Dot grid */}
			<div
				className="absolute inset-0 rounded-2xl opacity-[0.025] pointer-events-none"
				style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
			/>

			<div className="relative z-10">
				<div className="flex items-center gap-2 mb-6">
					<div
						className="size-8 rounded-lg flex items-center justify-center"
						style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
						<Users className="size-4 text-primary" />
					</div>
					<span className="text-sm font-semibold text-muted-foreground">How many agents do you need?</span>
				</div>

				{/* Stepper + display */}
				<div className="flex items-center justify-between mb-6 gap-4">
					<button
						onClick={() => setAgents(Math.max(MIN, agents - 1))}
						className="size-10 rounded-xl border flex items-center justify-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/8 hover:scale-105 active:scale-95"
						style={{ borderColor: "var(--color-border)" }}>
						<Minus className="size-4" />
					</button>

					<div className="text-center flex-1">
						<span
							className="text-5xl font-black tabular-nums"
							style={{ color: "var(--color-primary)" }}>
							{agents}
						</span>
						<span className="text-lg text-muted-foreground ml-2">agents</span>
					</div>

					<button
						onClick={() => setAgents(Math.min(MAX, agents + 1))}
						className="size-10 rounded-xl border flex items-center justify-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/8 hover:scale-105 active:scale-95"
						style={{ borderColor: "var(--color-border)" }}>
						<Plus className="size-4" />
					</button>
				</div>

				{/* Slider */}
				<div className="relative">
					<input
						type="range"
						min={MIN}
						max={MAX}
						value={agents}
						onChange={(e) => setAgents(Number(e.target.value))}
						className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
						style={{
							background: `linear-gradient(to right, var(--color-primary) ${pct}%, color-mix(in srgb, var(--color-primary) 15%, var(--color-border)) ${pct}%)`,
						}}
					/>
					<div className="flex justify-between text-xs text-muted-foreground mt-2">
						<span>1</span>
						<span>25</span>
						<span>50</span>
						<span>100</span>
						<span>150</span>
					</div>
				</div>

				{/* Quick presets */}
				<div className="flex flex-wrap gap-2 mt-5">
					{[5, 10, 25, 50, 100].map((n) => (
						<button
							key={n}
							onClick={() => setAgents(n)}
							className="px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200"
							style={
								agents === n
									? { background: "var(--color-primary)", color: "white", borderColor: "var(--color-primary)" }
									: { background: "transparent", color: "var(--color-muted-foreground)", borderColor: "var(--color-border)" }
							}>
							{n}
						</button>
					))}
					<button
						onClick={() => setAgents(150)}
						className="px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200"
						style={
							agents === 150
								? { background: "var(--color-primary)", color: "white", borderColor: "var(--color-primary)" }
								: { background: "transparent", color: "var(--color-muted-foreground)", borderColor: "var(--color-border)" }
						}>
						150+
					</button>
				</div>
			</div>
		</div>
	);
}

// ── Main page ──
export default function PricingPage() {
	const [annual, setAnnual] = useState(false);
	const [agents, setAgents] = useState(10);
	const visible = useMountVisible();
	const mousePos = useMouseGlow();

	return (
		<SiteLayout>
			{/* ── HERO ── */}
			<section className="relative pt-16 pb-20 md:pt-28 md:pb-28 overflow-hidden border-b border-border">
				{/* Background */}
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
					<div
						className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 ease-out"
						style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
					/>
					<div
						className="absolute inset-0 opacity-[0.025]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
					/>
				</div>

				<div className="container mx-auto px-4 text-center relative">
					<div className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<SectionBadge icon={Zap} label="14-day free trial — no credit card required" />
						<h1 className="text-5xl md:text-[5rem] font-black mb-5 text-balance tracking-tight" style={{ lineHeight: 1.04 }}>
							Pay per{" "}
							<span
								style={{
									background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}>
								agent
							</span>
						</h1>
						<p
							className={`text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty mb-8 transition-all duration-1000 delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							Simple, transparent pricing that scales with your team. Add or remove agents anytime.
						</p>

						{/* Billing toggle */}
						<div
							className={`inline-flex items-center gap-1 p-1.5 rounded-full border mb-10 transition-all duration-1000 delay-250 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
							<button
								onClick={() => setAnnual(false)}
								className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${!annual ? "text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
								style={!annual ? { background: "var(--color-primary)" } : {}}>
								Monthly
							</button>
							<button
								onClick={() => setAnnual(true)}
								className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${annual ? "text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
								style={annual ? { background: "var(--color-primary)" } : {}}>
								Annual
								<span
									className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-300 ${annual ? "bg-white/20 text-white" : "bg-green-500/15 text-green-600"}`}>
									Save 20%
								</span>
							</button>
						</div>
					</div>

					{/* Agent counter */}
					<div className={`transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<AgentCounter agents={agents} setAgents={setAgents} />
					</div>
				</div>
			</section>

			{/* ── PLANS ── */}
			<PlansSection annual={annual} agents={agents} />

			{/* ── SOCIAL PROOF ── */}
			<SocialProofSection />

			{/* ── COMPARISON TABLE ── */}
			<CompareSection />

			{/* ── FAQ ── */}
			<FaqSection />

			{/* ── FINAL CTA ── */}
			<PricingCtaSection />
		</SiteLayout>
	);
}

// ── Plans section ──
function PlansSection({ annual, agents }: { annual: boolean; agents: number }) {
	const { ref, inView } = useInView();

	return (
		<section ref={ref} className="container mx-auto px-4 py-16 md:py-20">
			<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">
				{PLANS.map((plan, i) => {
					const ratePerAgent = annual ? plan.pricePerAgent.annual : plan.pricePerAgent.monthly;
					const total = ratePerAgent * agents;

					return (
						<div
							key={plan.name}
							className={`relative rounded-2xl flex flex-col gap-6 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
							style={{ transitionDelay: `${i * 120}ms` }}>
							{/* Card shell */}
							<div
								className={`relative flex flex-col gap-6 p-8 rounded-2xl border h-full transition-all duration-300 hover:-translate-y-1 ${plan.highlight ? "hover:shadow-2xl" : "hover:shadow-xl"}`}
								style={
									plan.highlight
										? {
											background:
												"linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 8%, var(--color-card)), var(--color-card))",
											borderColor: "color-mix(in srgb, var(--color-primary) 50%, transparent)",
											boxShadow:
												"0 24px 60px -12px color-mix(in srgb, var(--color-primary) 20%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)",
										}
										: {
											background: "var(--color-card)",
											borderColor: "var(--color-border)",
											boxShadow: "0 4px 20px -4px rgba(0,0,0,0.06)",
										}
								}>
								{/* Glow for highlighted plan */}
								{plan.highlight && (
									<div
										className="absolute inset-0 rounded-2xl pointer-events-none"
										style={{
											background:
												"radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 65%)",
										}}
									/>
								)}

								{/* Popular badge */}
								{plan.highlight && plan.badge && (
									<span
										className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg"
										style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
										<Sparkles className="size-3" />
										{plan.badge}
									</span>
								)}

								{/* Plan name + desc */}
								<div className="relative z-10">
									<h3 className="text-xl font-black mb-1.5">{plan.name}</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
								</div>

								{/* Price */}
								<div className="relative z-10">
									<div className="flex items-baseline gap-1 mb-1">
										<span
											className="text-5xl font-black tabular-nums transition-all duration-500"
											style={plan.highlight ? { color: "var(--color-primary)" } : {}}>
											${total.toLocaleString()}
										</span>
										<span className="text-muted-foreground text-lg">/mo</span>
									</div>
									<p className="text-sm text-muted-foreground">
										<span className="font-semibold" style={{ color: "var(--color-primary)" }}>
											${ratePerAgent}
										</span>
										{" × "}
										<span className="font-semibold">{agents} agents</span>
										{annual && (
											<span className="ml-1.5 text-green-600 font-semibold text-xs">· billed annually</span>
										)}
									</p>
									{annual && (
										<p className="text-xs text-green-600 font-semibold mt-1">
											${(total * 12).toLocaleString()} / year — save ${(agents * plan.pricePerAgent.monthly * 12 - agents * plan.pricePerAgent.annual * 12).toLocaleString()}
										</p>
									)}
								</div>

								{/* CTA */}
								<div className="relative z-10">
									<Button
										size="lg"
										asChild
										variant={plan.highlight ? "default" : "outline"}
										className={`group h-12 w-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${plan.highlight ? "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40" : "hover:border-primary/50 hover:bg-primary/5"}`}>
										<a href={plan.href}>
											{plan.cta}
											<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
										</a>
									</Button>
								</div>

								{/* Feature list */}
								<ul className="space-y-2.5 relative z-10">
									{plan.features.map((f) => (
										<li key={f} className="flex items-start gap-2.5 text-sm group/item">
											<div
												className="size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover/item:scale-110"
												style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
												<CheckCircle2 className="size-3 text-primary" />
											</div>
											<span className="text-foreground/85 group-hover/item:text-foreground transition-colors">{f}</span>
										</li>
									))}
									{plan.missing.map((f) => (
										<li key={f} className="flex items-start gap-2.5 text-sm opacity-35">
											<X className="size-5 shrink-0 mt-0.5 text-muted-foreground" />
											<span>{f}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					);
				})}
			</div>

			{/* Enterprise callout */}
			<div
				className={`relative max-w-4xl mx-auto mt-6 rounded-2xl border overflow-hidden p-6 flex flex-col md:flex-row items-center gap-5 transition-all duration-700 delay-400 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
				style={{
					background: "linear-gradient(120deg, color-mix(in srgb, var(--color-primary) 5%, var(--color-card)), var(--color-card))",
					borderColor: "color-mix(in srgb, var(--color-primary) 20%, var(--color-border))",
				}}>
				<div
					className="absolute inset-0 opacity-[0.02] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
				/>
				<div className="flex-1 relative z-10">
					<p className="font-bold mb-0.5">Need 150+ agents or custom contracts?</p>
					<p className="text-sm text-muted-foreground">We offer volume discounts, custom SLAs, dedicated infrastructure, and white-glove onboarding for large teams.</p>
				</div>
				<Button
					variant="outline"
					asChild
					className="shrink-0 relative z-10 group hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5 transition-all duration-200">
					<a href="/contact">
						Talk to sales
						<ArrowRight className="ml-1.5 size-4 group-hover:translate-x-0.5 transition-transform" />
					</a>
				</Button>
			</div>

			{/* Trust row */}
			<div
				className={`flex flex-wrap justify-center gap-8 mt-12 text-sm text-muted-foreground transition-all duration-700 delay-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				{[
					{ icon: Shield, text: "SOC 2 Type II certified" },
					{ icon: Zap, text: "99.97% uptime SLA" },
					{ icon: Users, text: "1,200+ customers" },
					{ icon: Star, text: "4.9 / 5 average rating" },
				].map(({ icon: Icon, text }) => (
					<span key={text} className="flex items-center gap-2 transition-colors hover:text-foreground cursor-default">
						<Icon className="size-4 text-primary" />
						{text}
					</span>
				))}
			</div>
		</section>
	);
}

// ── Social proof ──
function SocialProofSection() {
	const { ref, inView } = useInView();
	return (
		<section
			ref={ref}
			className="border-y border-border py-20 relative overflow-hidden"
			style={{ background: "color-mix(in srgb, var(--color-muted) 15%, transparent)" }}>
			<div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full blur-[120px] pointer-events-none"
				style={{ background: "color-mix(in srgb, var(--color-primary) 5%, transparent)" }}
			/>
			<div className="container mx-auto px-4 relative">
				{/* Logo strip */}
				<div className={`text-center mb-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-6">Trusted by teams at</p>
					<div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
						{LOGOS.map((l, i) => (
							<span
								key={l}
								className={`text-muted-foreground/40 font-bold text-sm tracking-wide hover:text-muted-foreground transition-all duration-500 cursor-default select-none ${inView ? "opacity-100" : "opacity-0"}`}
								style={{ transitionDelay: `${i * 60}ms` }}>
								{l}
							</span>
						))}
					</div>
				</div>

				{/* Testimonial cards */}
				<div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
					{TESTIMONIALS.map(({ quote, author, role, company, plan }, i) => (
						<div
							key={author}
							className={`group relative flex flex-col gap-4 p-7 rounded-2xl border overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{
								background: "var(--color-card)",
								borderColor: "var(--color-border)",
								transitionDelay: `${i * 120}ms`,
							}}>
							{/* Hover glow */}
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 70%)",
								}}
							/>
							<div
								className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)" }}
							/>

							<div className="flex gap-1 relative z-10">
								{Array.from({ length: 5 }).map((_, idx) => (
									<Star key={idx} className="size-4 fill-primary text-primary" />
								))}
							</div>
							<blockquote className="text-sm text-foreground leading-relaxed flex-1 relative z-10">"{quote}"</blockquote>
							<div className="flex items-center justify-between pt-4 border-t border-border relative z-10">
								<div>
									<p className="text-sm font-bold">{author}</p>
									<p className="text-xs text-muted-foreground mt-0.5">
										{role}, {company}
									</p>
								</div>
								<span
									className="text-xs px-2.5 py-1 rounded-full font-semibold"
									style={{
										background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
										color: "var(--color-primary)",
										border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
									}}>
									{plan} plan
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ── Comparison table ──
function CompareSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-20 md:py-28">
			<div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<SectionBadge icon={TrendingUp} label="Plan comparison" />
				<h2 className="text-3xl md:text-5xl font-black text-balance tracking-tight">Compare plans side by side</h2>
			</div>

			<div
				className={`max-w-3xl mx-auto rounded-2xl border overflow-hidden transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
				style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "0 8px 40px -8px rgba(0,0,0,0.08)" }}>
				{/* Header */}
				<div className="grid grid-cols-3 divide-x divide-border" style={{ background: "color-mix(in srgb, var(--color-muted) 30%, transparent)" }}>
					<div className="p-5 text-sm font-bold text-muted-foreground">Feature</div>
					{["Professional", "Business"].map((p) => (
						<div key={p} className="p-5 text-sm font-black text-center" style={p === "Business" ? { color: "var(--color-primary)" } : {}}>
							{p}
						</div>
					))}
				</div>
				{/* Rows */}
				<div className="divide-y divide-border">
					{COMPARE_ROWS.map(({ feature, pro, biz }, rowIdx) => (
						<div
							key={feature}
							className="grid grid-cols-3 divide-x divide-border transition-colors duration-200 hover:bg-primary/3"
							style={{ transitionDelay: `${rowIdx * 30}ms` }}>
							<div className="px-5 py-3.5 text-sm text-muted-foreground font-medium">{feature}</div>
							{([pro, biz] as (string | boolean)[]).map((val, i) => (
								<div key={i} className="px-5 py-3.5 text-sm text-center flex items-center justify-center">
									{typeof val === "boolean" ? (
										val ? (
											<div
												className="size-6 rounded-full flex items-center justify-center"
												style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
												<CheckCircle2 className="size-3.5 text-primary" />
											</div>
										) : (
											<X className="size-4 opacity-25" />
										)
									) : (
										<span className={`text-sm ${i === 1 ? "font-bold" : ""}`} style={i === 1 ? { color: "var(--color-primary)" } : {}}>
											{val}
										</span>
									)}
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ── FAQ ──
function FaqSection() {
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="border-y border-border py-20" style={{ background: "color-mix(in srgb, var(--color-muted) 12%, transparent)" }}>
			<div className="container mx-auto px-4 max-w-2xl">
				<div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<SectionBadge icon={ChevronDown} label="FAQ" />
					<h2 className="text-3xl md:text-4xl font-black text-balance tracking-tight">Frequently asked questions</h2>
				</div>
				<div className="space-y-3">
					{FAQ.map(({ q, a }, i) => {
						const isOpen = openFaq === i;
						return (
							<div
								key={q}
								className={`rounded-2xl border overflow-hidden transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{
									borderColor: isOpen ? "color-mix(in srgb, var(--color-primary) 35%, transparent)" : "var(--color-border)",
									background: "var(--color-card)",
									boxShadow: isOpen ? "0 4px 24px -4px color-mix(in srgb, var(--color-primary) 12%, transparent)" : "none",
									transitionDelay: `${i * 60}ms`,
								}}>
								<button
									onClick={() => setOpenFaq(isOpen ? null : i)}
									className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left text-sm font-bold hover:bg-primary/4 transition-colors duration-200">
									<span>{q}</span>
									<div
										className="size-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
										style={{
											background: isOpen ? "var(--color-primary)" : "color-mix(in srgb, var(--color-muted) 60%, transparent)",
											transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
										}}>
										<ChevronDown
											className="size-3.5"
											style={{ color: isOpen ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)" }}
										/>
									</div>
								</button>
								<div className="overflow-hidden transition-all duration-400" style={{ maxHeight: isOpen ? "200px" : "0px" }}>
									<p className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border">{a}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

// ── Final CTA ──
function PricingCtaSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-24">
			<div
				className={`cta-gradient relative max-w-5xl mx-auto rounded-3xl overflow-hidden p-12 md:p-20 text-center transition-all duration-1000 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
				<CtaDecorations />

				<div className="relative z-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-sm font-medium text-white mb-8">
						<Sparkles className="size-3.5" /> Still have questions?
					</div>
					<h2 className="text-4xl md:text-6xl font-black mb-5 text-white text-balance tracking-tight">Talk to our team</h2>
					<p className="text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
						We'll walk you through the right plan for your team size and support volume. No pressure, no sales scripts.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Button
							size="xl"
							asChild
							className="group bg-white hover:bg-white/90"
							style={{ color: "var(--color-primary)" }}>
							<a href="/contact">
								Talk to sales
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button
							size="xl"
							variant="outline"
							asChild
							className="text-white border-white/35 hover:bg-white/10 hover:border-white/60">
							<a href="/auth/signup">Start free trial</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
