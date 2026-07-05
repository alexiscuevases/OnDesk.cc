import { SiteLayout } from "./site-layout";
import { ArrowRight, CheckCircle2, X, Users, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useInView, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";

// ── Pricing data ──
const PLANS = [
	{
		name: "Pulse Starter",
		tagline: "FOR SOLO & SMALL TEAMS",
		pricingType: "flat" as const,
		priceFlat: { monthly: 9, annual: 7 },
		description: "Keep every request organized. Set up in minutes, cancel anytime.",
		cta: "Start free trial",
		href: "/auth/signup",
		highlight: false,
		features: [
			"Up to 2 agents",
			"300 tickets / month",
			"2 channels (email + chat)",
			"Unified inbox",
			"Canned replies",
			"Basic automations",
			"Mobile app",
			"Community support",
		],
		missing: [
			"AI classification & routing",
			"AI auto-resolution",
			"Analytics dashboard",
			"Data residency",
			"Dedicated architect",
		],
	},
	{
		name: "Pulse Core",
		tagline: "FOR TEAMS & AGENCIES",
		pricingType: "per-agent" as const,
		pricePerAgent: { monthly: 19, annual: 15 },
		description: "Full-featured support with AI routing, omnichannel inbox, and team management.",
		cta: "Start free trial",
		href: "/auth/signup",
		highlight: false,
		features: [
			"Unlimited ticket volume",
			"All channels unified",
			"AI Classification & Routing",
			"Team workload management",
			"Analytics dashboard",
			"Marketplace access",
			"Canned replies & automation",
			"24/7 Priority support",
		],
		missing: [
			"AI auto-resolution",
			"Sovereign data residency",
			"Dedicated success architect",
			"Custom SLA frameworks",
		],
	},
	{
		name: "Pulse Enterprise",
		tagline: "FOR LARGE ORGANIZATIONS",
		pricingType: "per-agent" as const,
		pricePerAgent: { monthly: 39, annual: 31 },
		description: "The complete platform for complex, high-volume support operations.",
		cta: "Start free trial",
		href: "/auth/signup",
		highlight: true,
		features: [
			"Everything in Pulse Core",
			"AI Auto-resolution Engine",
			"Predictive Volume Forecasting",
			"Sovereign Data Residency (US/EU/APAC)",
			"Enterprise Key Management",
			"Dedicated Success Architect",
			"Custom SLA Frameworks",
			"99.99% Uptime Guarantee",
		],
		missing: [] as string[],
	},
];

const TESTIMONIALS = [
	{
		quote: "I was live in under 10 minutes. All my client emails in one inbox, basic automations done, and nothing I didn't need.",
		author: "Mia Torres",
		role: "Independent Consultant, Torres Digital",
		plan: "STARTER",
	},
	{
		quote: "Core gave our agency real visibility. We manage 8 clients and everyone's queue stays separate without any extra effort.",
		author: "James Okafor",
		role: "Operations Lead, BrightSupport Agency",
		plan: "CORE",
	},
	{
		quote: "The autonomous resolution engine paid for the Enterprise upgrade in less than one quarter. It's not a support tool — it's a competitive edge.",
		author: "Elena Rossi",
		role: "VP of Customer Experience, RetailFlow Group",
		plan: "ENTERPRISE",
	},
];

const FAQ = [
	{
		q: "How does pricing work?",
		a: "Pulse Starter is a flat $9/month for up to 2 agents — perfect for solos and small teams. Core and Enterprise are priced per active agent per month, billed at the end of each billing period. Add or remove agents anytime; changes are prorated to the day.",
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
		a: "Starter and Core data is stored in the US by default. Enterprise customers choose their region: US, EU, or APAC.",
	},
];

const COMPARE_ROWS = [
	{ feature: "Agents", starter: "Up to 2", core: "Unlimited", enterprise: "Unlimited" },
	{ feature: "Ticket volume", starter: "300 / month", core: "Unlimited", enterprise: "Unlimited" },
	{ feature: "Channels", starter: "2", core: "Unlimited", enterprise: "Unlimited" },
	{ feature: "AI Classification & Routing", starter: false, core: true, enterprise: true },
	{ feature: "AI Auto-resolution", starter: false, core: false, enterprise: true },
	{ feature: "Analytics dashboard", starter: false, core: true, enterprise: true },
	{ feature: "Sovereign data residency", starter: false, core: false, enterprise: true },
	{ feature: "Dedicated Architect", starter: false, core: false, enterprise: true },
	{ feature: "Uptime SLA", starter: "99.9%", core: "99.97%", enterprise: "99.99%" },
	{ feature: "Support", starter: "Community", core: "24/7 Priority", enterprise: "White-glove" },
];

// ── Agent counter — telemetry console ──
function AgentCounter({ agents, setAgents }: { agents: number; setAgents: (n: number) => void }) {
	const MIN = 1;
	const MAX = 150;
	const pct = ((agents - MIN) / (MAX - MIN)) * 100;

	return (
		<div className="border border-border bg-background max-w-2xl">
			<div className="flex items-center justify-between px-5 py-3 border-b border-border">
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-primary">
					<Users className="size-3.5 text-accent" />
					AGENT_COUNT
				</span>
				<span className="font-mono text-[10px] tracking-widest text-muted-foreground/60">CORE & ENTERPRISE</span>
			</div>

			<div className="p-6">
				{/* Stepper + display */}
				<div className="flex items-center justify-between mb-6 gap-4">
					<button
						onClick={() => setAgents(Math.max(MIN, agents - 1))}
						className="size-10 border border-border flex items-center justify-center transition-colors duration-200 hover:border-primary hover:text-primary"
						aria-label="Fewer agents">
						<Minus className="size-4" />
					</button>

					<div className="text-center flex-1">
						<span className="text-5xl font-black tracking-tighter tabular-nums text-primary">{agents}</span>
						<span className="ml-3 font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground">agents</span>
					</div>

					<button
						onClick={() => setAgents(Math.min(MAX, agents + 1))}
						className="size-10 border border-border flex items-center justify-center transition-colors duration-200 hover:border-primary hover:text-primary"
						aria-label="More agents">
						<Plus className="size-4" />
					</button>
				</div>

				{/* Slider */}
				<input
					type="range"
					min={MIN}
					max={MAX}
					value={agents}
					onChange={(e) => setAgents(Number(e.target.value))}
					className="w-full h-1.5 appearance-none cursor-pointer outline-none"
					style={{
						background: `linear-gradient(to right, var(--color-primary) ${pct}%, color-mix(in srgb, var(--color-primary) 15%, var(--color-border)) ${pct}%)`,
					}}
				/>
				<div className="flex justify-between font-mono text-[10px] text-muted-foreground mt-2">
					<span>1</span>
					<span>25</span>
					<span>50</span>
					<span>100</span>
					<span>150</span>
				</div>

				{/* Presets */}
				<div className="flex flex-wrap gap-2 mt-5">
					{[5, 10, 25, 50, 100, 150].map((n) => (
						<button
							key={n}
							onClick={() => setAgents(n)}
							className={`px-3 py-1.5 border font-mono text-[11px] font-semibold transition-colors duration-200 ${
								agents === n
									? "bg-primary text-primary-foreground border-primary"
									: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
							}`}>
							{n === 150 ? "150+" : n}
						</button>
					))}
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

	return (
		<SiteLayout>
			<div className="mx-auto max-w-350 border-x border-border">
				{/* ── HERO ── */}
				<section className="relative border-b border-border overflow-hidden">
					<div
						className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
					/>

					<div
						className={`relative px-6 md:px-12 pt-16 md:pt-24 pb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<div className="flex items-center gap-3 mb-10">
							<span className="relative flex size-2">
								<span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
								<span className="relative inline-flex size-2 rounded-full bg-accent" />
							</span>
							<MonoTag className="text-foreground/70">
								PRICING_MATRIX — 14-DAY TRIAL / NO CARD<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Simple,{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								honest
							</span>{" "}
							pricing
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
							Flat pricing for solos. Flexible per-agent pricing for teams. All plans include a 14-day free trial.
						</p>

						{/* Billing toggle — segmented mono control */}
						<div className="inline-flex border border-border mb-10">
							<button
								onClick={() => setAnnual(false)}
								className={`px-5 py-3 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
									!annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
								}`}>
								Monthly
							</button>
							<button
								onClick={() => setAnnual(true)}
								className={`px-5 py-3 border-l border-border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
									annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
								}`}>
								Annual <span className={annual ? "text-(--pulse-lime)" : "text-accent"}>−20%</span>
							</button>
						</div>

						<AgentCounter agents={agents} setAgents={setAgents} />
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── PLANS ── */}
				<PlansSection annual={annual} agents={agents} />

				{/* ── FIELD REPORTS ── */}
				<FieldReports />

				{/* ── COMPARISON MATRIX ── */}
				<CompareSection />

				{/* ── FAQ ── */}
				<FaqSection />

				{/* ── FINAL CTA ── */}
				<DarkCta
					tag="05 — CONTACT · NO PRESSURE, NO SALES SCRIPTS"
					headline={
						<>
							Talk to our <span style={{ color: "var(--pulse-lime)" }}>team.</span>
						</>
					}
					desc="We'll walk you through the right plan for your team size and support volume."
					primary={{ href: "/contact", label: "Talk to sales" }}
					secondary={{ href: "/auth/signup", label: "Start free trial" }}
				/>
			</div>
		</SiteLayout>
	);
}

// ── Plans section ──
function PlansSection({ annual, agents }: { annual: boolean; agents: number }) {
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">01 — PLANS</MonoTag>
				<MonoTag className="hidden sm:block">3 TIERS / PRORATED DAILY</MonoTag>
			</div>

			<div className="relative">
				<Cross className="-bottom-2 -left-1.5" />
				<Cross className="-bottom-2 -right-1.5" />
				<div className="grid md:grid-cols-3 gap-px bg-border border-b border-border">
					{PLANS.map((plan, i) => {
						const isFlat = plan.pricingType === "flat";
						const flatRate = isFlat && plan.priceFlat ? (annual ? plan.priceFlat.annual : plan.priceFlat.monthly) : 0;
						const perAgentRate = !isFlat && plan.pricePerAgent ? (annual ? plan.pricePerAgent.annual : plan.pricePerAgent.monthly) : 0;
						const total = isFlat ? flatRate : perAgentRate * agents;
						const dark = plan.highlight;

						return (
							<div
								key={plan.name}
								className={`group relative flex flex-col px-6 md:px-10 py-10 transition-all duration-700 ${dark ? "text-white" : "bg-background"} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ transitionDelay: `${i * 120}ms`, ...(dark ? { background: "var(--pulse-ink)" } : {}) }}>
								{!dark && <span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />}
								{dark && <span className="absolute top-0 left-0 h-0.5 w-full" style={{ background: "var(--pulse-lime)" }} />}

								{/* header */}
								<div className="flex items-center justify-between mb-2">
									<span className={`font-mono text-[10px] tracking-[0.25em] font-semibold ${dark ? "" : "text-primary"}`} style={dark ? { color: "var(--pulse-lime)" } : undefined}>
										{plan.tagline}
									</span>
									{dark && (
										<span className="font-mono text-[10px] tracking-widest px-2 py-1 font-bold" style={{ background: "var(--pulse-lime)", color: "var(--pulse-ink-deep)" }}>
											MOST SELECTED
										</span>
									)}
								</div>
								<h3 className="text-2xl font-black tracking-tight mb-2">{plan.name}</h3>
								<p className={`text-sm leading-relaxed mb-8 ${dark ? "text-white/50" : "text-muted-foreground"}`}>{plan.description}</p>

								{/* price */}
								<div className="mb-8">
									<div className="flex items-baseline gap-2 mb-1.5">
										<span className="text-5xl font-black tracking-tighter tabular-nums">${isFlat ? flatRate : total.toLocaleString()}</span>
										<span className={`font-mono text-[11px] tracking-widest ${dark ? "text-white/40" : "text-muted-foreground"}`}>/MO</span>
									</div>
									<p className={`font-mono text-[10px] tracking-[0.15em] ${dark ? "text-white/45" : "text-muted-foreground"}`}>
										{isFlat ? (
											<>FLAT RATE · UP TO 2 AGENTS{annual && " · BILLED ANNUALLY"}</>
										) : (
											<>
												${perAgentRate} × {agents} AGENTS{annual && " · BILLED ANNUALLY"}
											</>
										)}
									</p>
									{annual && !isFlat && plan.pricePerAgent && (
										<p className="font-mono text-[10px] tracking-[0.15em] mt-1" style={{ color: dark ? "var(--pulse-lime)" : "var(--color-accent)" }}>
											SAVE ${(agents * plan.pricePerAgent.monthly * 12 - agents * plan.pricePerAgent.annual * 12).toLocaleString()} / YEAR
										</p>
									)}
								</div>

								{/* CTA */}
								<a
									href={plan.href}
									className={`group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden px-6 py-3.5 font-mono text-[11px] tracking-[0.15em] uppercase font-bold mb-8 transition-colors duration-300 ${
										dark ? "text-(--pulse-ink-deep)" : "border border-foreground/25 text-foreground hover:border-primary hover:text-primary"
									}`}
									style={dark ? { background: "var(--pulse-lime)" } : undefined}>
									{plan.cta}
									<ArrowRight className="size-3 group-hover/cta:translate-x-1 transition-transform" />
								</a>

								{/* features */}
								<ul className="space-y-2.5">
									{plan.features.map((f) => (
										<li key={f} className={`flex items-start gap-3 text-sm ${dark ? "text-white/80" : "text-foreground/85"}`}>
											<CheckCircle2 className="size-3.5 shrink-0 mt-0.5" style={{ color: dark ? "var(--pulse-lime)" : "var(--color-accent)" }} />
											{f}
										</li>
									))}
									{plan.missing.map((f) => (
										<li key={f} className={`flex items-start gap-3 text-sm ${dark ? "text-white/25" : "opacity-35"}`}>
											<X className="size-3.5 shrink-0 mt-0.5" />
											{f}
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>
			</div>

			{/* Enterprise callout — hairline row */}
			<div
				className={`flex flex-col md:flex-row md:items-center gap-4 px-6 md:px-12 py-6 border-b border-border transition-all duration-700 delay-300 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				<div className="flex-1">
					<p className="font-bold mb-0.5">Need 150+ agents or custom contracts?</p>
					<p className="text-sm text-muted-foreground">Volume discounts, custom SLAs, dedicated infrastructure, and white-glove onboarding.</p>
				</div>
				<CtaLink href="/contact" variant="outline">
					Talk to sales <ArrowRight className="size-3" />
				</CtaLink>
			</div>

			{/* Trust ticker row */}
			<div className="flex flex-wrap gap-x-8 gap-y-2 px-6 md:px-12 py-4 border-b border-border font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
				<span>
					<span className="text-accent mr-2">●</span>SOC 2 TYPE II
				</span>
				<span>
					<span className="text-accent mr-2">●</span>99.97% UPTIME SLA
				</span>
				<span>
					<span className="text-accent mr-2">●</span>1,200+ CUSTOMERS
				</span>
				<span>
					<span className="text-accent mr-2">●</span>4.9 / 5 AVG RATING
				</span>
			</div>
		</section>
	);
}

// ── Field reports ──
function FieldReports() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">02 — FIELD REPORTS</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					ONE PER PLAN
				</span>
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
				{TESTIMONIALS.map(({ quote, author, role, plan }, i) => (
					<div
						key={author}
						className={`flex flex-col px-6 md:px-10 py-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 120}ms` }}>
						<div className="flex items-center justify-between mb-6">
							<span className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold">LOG_0{i + 1}</span>
							<span className="font-mono text-[10px] tracking-widest border border-border px-2 py-1 text-muted-foreground">{plan}</span>
						</div>
						<p className="text-base font-medium leading-relaxed flex-1 mb-8">"{quote}"</p>
						<div className="font-mono text-[11px] tracking-wider text-muted-foreground border-t border-border pt-4">
							<span className="text-foreground font-bold">{author.toUpperCase()}</span>
							<span className="block mt-1">{role.toUpperCase()}</span>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

// ── Comparison matrix ──
function CompareSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="03" label="MATRIX" title="Compare plans side by side" right="FULL FEATURE BREAKDOWN" />
			<div className="h-10" />

			<div
				className={`relative border-t border-b border-border overflow-x-auto transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<div className="min-w-160">
					{/* header */}
					<div className="grid grid-cols-4 divide-x divide-border border-b border-border bg-muted/30">
						<div className="px-6 py-4 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">FEATURE</div>
						{(["STARTER", "CORE", "ENTERPRISE"] as const).map((p) => (
							<div
								key={p}
								className={`px-4 py-4 text-center font-mono text-[10px] tracking-[0.25em] font-bold ${p === "ENTERPRISE" ? "text-primary bg-accent/5" : "text-foreground"}`}>
								{p}
							</div>
						))}
					</div>
					{/* rows */}
					<div className="divide-y divide-border">
						{COMPARE_ROWS.map(({ feature, starter, core, enterprise }) => (
							<div key={feature} className="grid grid-cols-4 divide-x divide-border hover:bg-muted/30 transition-colors duration-150">
								<div className="px-6 py-3.5 text-sm text-muted-foreground font-medium">{feature}</div>
								{([starter, core, enterprise] as (string | boolean)[]).map((val, i) => (
									<div
										key={i}
										className={`px-4 py-3.5 text-center flex items-center justify-center ${i === 2 ? "bg-accent/5" : ""}`}>
										{typeof val === "boolean" ? (
											<span className={`font-mono text-sm ${val ? "text-accent font-bold" : "text-muted-foreground/30"}`}>
												{val ? "✓" : "—"}
											</span>
										) : (
											<span className={`text-sm ${i === 2 ? "font-bold text-primary" : ""}`}>{val}</span>
										)}
									</div>
								))}
							</div>
						))}
					</div>
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
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-y border-border mt-16">
				<MonoTag className="text-primary">04 — FAQ</MonoTag>
				<MonoTag className="hidden sm:block">{FAQ.length} ENTRIES</MonoTag>
			</div>

			<div className={`transition-all duration-700 ${inView ? "opacity-100" : "opacity-0"}`}>
				{FAQ.map(({ q, a }, i) => {
					const isOpen = openFaq === i;
					return (
						<div key={q} className="border-b border-border">
							<button
								onClick={() => setOpenFaq(isOpen ? null : i)}
								className={`w-full flex items-center gap-5 px-6 md:px-12 py-5 text-left transition-colors duration-200 ${isOpen ? "bg-accent/5" : "hover:bg-muted/40"}`}>
								<span className={`font-mono text-[10px] tracking-[0.25em] shrink-0 ${isOpen ? "text-accent font-bold" : "text-muted-foreground/60"}`}>
									Q_0{i + 1}
								</span>
								<span className="flex-1 text-sm md:text-base font-bold">{q}</span>
								<span
									className={`font-mono text-lg leading-none shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45 text-accent" : "text-muted-foreground"}`}>
									+
								</span>
							</button>
							<div className="overflow-hidden transition-all duration-400" style={{ maxHeight: isOpen ? "220px" : "0px" }}>
								<p className="px-6 md:px-12 pb-6 pl-16 md:pl-24 text-sm text-muted-foreground leading-relaxed max-w-3xl">{a}</p>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
