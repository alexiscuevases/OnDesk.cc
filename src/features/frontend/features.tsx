import { SiteLayout } from "./site-layout";
import { useState } from "react";
import {
	Bot,
	Zap,
	Shield,
	BarChart3,
	MessageSquare,
	CheckCircle2,
	ArrowRight,
	Sparkles,
} from "lucide-react";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";

const TABS = ["All", "Omnichannel", "AI Automation", "Marketplace", "Intelligence", "Security"];

const ALL_FEATURES = [
	{
		icon: Bot,
		title: "Autonomous Resolution",
		description: "Pulse AI resolves up to 80% of support volume without human intervention. Pulse handles the routine so your team focuses on what actually needs a human.",
		bullets: [
			"Intent & sentiment detection",
			"Zero-latency auto-resolution",
			"Seamless agent handoff",
			"Self-learning resolution engine",
		],
		tabs: ["All", "Omnichannel", "AI Automation"],
		stat: "80%",
		statLabel: "AUTONOMOUS RESOLUTION",
	},
	{
		icon: Zap,
		title: "Intelligent Routing",
		description: "Dynamic workload balancing that routes every ticket based on agent expertise, priority, and real-time operational capacity.",
		bullets: [
			"Skill-based matchmaking",
			"Predictive SLA enforcement",
			"Priority queue orchestration",
			"Capacity-aware distribution",
		],
		tabs: ["All", "AI Automation", "Intelligence"],
		stat: "< 30s",
		statLabel: "MAX ROUTING LATENCY",
	},
	{
		icon: MessageSquare,
		title: "Omnichannel Unification",
		description: "Converge WhatsApp, Email, Teams, and Voice into a single, unified thread. No silos, just fluid conversations.",
		bullets: [
			"Native WhatsApp & Teams",
			"Unified customer context",
			"Cross-channel history",
			"Instant channel switching",
		],
		tabs: ["All", "Omnichannel"],
		stat: "10+",
		statLabel: "CHANNELS UNIFIED",
	},
	{
		icon: Sparkles,
		title: "Pulse Marketplace",
		description: "Empower your agents with a deep ecosystem of integrations that bring business data directly into the support flow.",
		bullets: [
			"CRM & Billing deep-links",
			"Custom app development SDK",
			"One-click tool activation",
			"Automated workflow actions",
		],
		tabs: ["All", "Marketplace"],
		stat: "50+",
		statLabel: "INTEGRATIONS AVAILABLE",
	},
	{
		icon: BarChart3,
		title: "Predictive Intelligence",
		description: "Move beyond descriptive reports. Leverage AI to forecast volume trends and identify friction points before they escalate.",
		bullets: [
			"Volume forecasting models",
			"Automated friction analysis",
			"Agent performance scoring",
			"Business impact reporting",
		],
		tabs: ["All", "Intelligence"],
		stat: "4.9★",
		statLabel: "AVG. CSAT IMPACT",
	},
	{
		icon: Shield,
		title: "Security & Reliability",
		description: "SOC 2, GDPR, and 99.99% uptime — built for teams that can't afford downtime, at any scale.",
		bullets: [
			"SOC 2 Type II compliance",
			"Regional data residency",
			"Advanced RBAC & SSO",
			"End-to-end data encryption",
		],
		tabs: ["All", "Security"],
		stat: "99.99%",
		statLabel: "UPTIME GUARANTEE",
	},
];

const SOCIAL_PROOF = [
	{
		quote: "I switched from three different email inboxes to Pulse in a weekend. Now everything is in one place and I'm not dropping client requests.",
		author: "Mia Torres",
		role: "Independent Consultant, Torres Digital",
	},
	{
		quote: "Pulse Core gave our agency exactly what we needed — separate client workflows and real visibility into what's happening across all our accounts.",
		author: "James Okafor",
		role: "Operations Lead, BrightSupport Agency",
	},
	{
		quote: "Pulse transformed our support from a cost center into a CSAT driver. The autonomous routing paid back in week one.",
		author: "Marcus Chen",
		role: "Director of Ops, FinStream",
	},
];

export default function FeaturesPage() {
	const [activeTab, setActiveTab] = useState("All");
	const visible = useMountVisible();

	const { ref: statsRef, inView: statsInView } = useInView();
	const c80 = useCounter(80, 1100, statsInView);
	const c30 = useCounter(30, 1200, statsInView);
	const c999 = useCounter(999, 1300, statsInView);

	const filtered = ALL_FEATURES.filter((f) => f.tabs.includes(activeTab));

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
								SYS.MODULES — FULL CAPABILITY INDEX<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Built for the{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								next era
							</span>{" "}
							of support
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
							From unified inbox to AI automation — everything you need to deliver great support, whether you're a solo consultant or a
							global team.
						</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/auth/signup">
								Start free trial <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="/pricing" variant="outline">
								See pricing
							</CtaLink>
						</div>
					</div>

					{/* stats — hairline telemetry row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${c80}%`, label: "AUTO-RESOLVED" },
								{ value: `<${c30}s`, label: "ROUTING LATENCY" },
								{ value: `${(c999 / 10).toFixed(2)}%`, label: "UPTIME SLA" },
								{ value: "4.9★", label: "BUSINESS IMPACT" },
							].map(({ value, label }, i) => (
								<div
									key={label}
									className={`px-4 md:px-10 py-8 transition-all duration-700 ${statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
									style={{ transitionDelay: `${i * 100}ms` }}>
									<div className="text-3xl md:text-4xl font-black tracking-tighter mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>
										{value}
									</div>
									<div className="font-mono text-[10px] tracking-[0.2em] text-primary font-semibold">{label}</div>
								</div>
							))}
						</div>
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── CAPABILITY INDEX ── */}
				<section>
					<SectionRule index="01" label="CAPABILITY INDEX" title="The Pulse ecosystem" right={`${ALL_FEATURES.length} MODULES REGISTERED`} />
					<p className="px-6 md:px-12 pb-8 text-lg text-muted-foreground max-w-2xl">
						The pillars of the most advanced support orchestration platform. Filter by domain.
					</p>

					{/* mono filter tabs */}
					<div className="flex flex-wrap gap-2 px-6 md:px-12 pb-10">
						{TABS.map((tab) => {
							const isActive = activeTab === tab;
							return (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`px-4 py-2 border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
										isActive
											? "bg-primary text-primary-foreground border-primary"
											: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
									}`}>
									{tab}
								</button>
							);
						})}
					</div>

					<div className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div key={activeTab} className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border animate-in fade-in duration-300">
							{filtered.map(({ icon: Icon, title, description, bullets, stat, statLabel }, i) => (
								<div key={title} className="group relative bg-background px-6 md:px-10 py-10 flex flex-col">
									<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />

									<div className="flex items-center justify-between mb-8">
										<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">0{i + 1}</span>
										<Icon className="size-5 text-accent" />
									</div>

									<div className="mb-6">
										<div className="text-3xl font-black tracking-tighter text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
											{stat}
										</div>
										<div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mt-1">{statLabel}</div>
									</div>

									<h3 className="text-xl font-black tracking-tight mb-2.5">{title}</h3>
									<p className="text-sm text-muted-foreground leading-relaxed mb-6">{description}</p>

									<ul className="space-y-2.5 mt-auto">
										{bullets.map((b) => (
											<li key={b} className="flex items-center gap-3 text-sm text-muted-foreground">
												<CheckCircle2 className="size-3.5 text-accent shrink-0" />
												{b}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ── FIELD REPORTS ── */}
				<FieldReports />

				{/* ── CTA ── */}
				<DarkCta
					tag="03 — DEPLOY · 14-DAY TRIAL · NO COMMITMENT"
					headline={
						<>
							Deploy Pulse in <span style={{ color: "var(--pulse-lime)" }}>minutes.</span>
						</>
					}
					desc="Experience the power of autonomous support. Full access trial, no commitment required."
					primary={{ href: "/auth/signup", label: "Start free trial" }}
					secondary={{ href: "/contact", label: "Talk to sales" }}
				/>
			</div>
		</SiteLayout>
	);
}

function FieldReports() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-y border-border">
				<MonoTag className="text-primary">02 — FIELD REPORTS</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					VERIFIED CUSTOMERS
				</span>
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
				{SOCIAL_PROOF.map(({ quote, author, role }, i) => (
					<div
						key={author}
						className={`flex flex-col px-6 md:px-10 py-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 120}ms` }}>
						<span className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold mb-6">LOG_0{i + 1}</span>
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
