import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
	Bot,
	Zap,
	Shield,
	BarChart3,
	MessageSquare,
	CheckCircle2,
	ArrowRight,
	Headset,
	Play,
	TrendingUp,
	Clock,
	Star,
	Sparkles,
} from "lucide-react";
import { useInView, useCounter, SectionBadge } from "./shared";

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
		statLabel: "autonomous resolution",
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
		statLabel: "max routing latency",
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
		statLabel: "channels unified",
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
		statLabel: "integrations available",
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
		statLabel: "avg. CSAT impact",
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
		statLabel: "uptime guarantee",
	},
];

const SOCIAL_PROOF = [
	{
		quote: "I switched from three different email inboxes to Pulse in a weekend. Now everything is in one place and I'm not dropping client requests.",
		author: "Mia Torres",
		role: "Independent Consultant, Torres Digital",
		rating: 5,
	},
	{
		quote: "Pulse Core gave our agency exactly what we needed — separate client workflows and real visibility into what's happening across all our accounts.",
		author: "James Okafor",
		role: "Operations Lead, BrightSupport Agency",
		rating: 5,
	},
	{
		quote: "Pulse transformed our support from a cost center into a CSAT driver. The autonomous routing paid back in week one.",
		author: "Marcus Chen",
		role: "Director of Ops, FinStream",
		rating: 5,
	},
];

export default function FeaturesPage() {
	const [activeTab, setActiveTab] = useState("All");
	const [visible, setVisible] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

	// Stats in-view
	const statsRef = useInView();
	const c80 = useCounter(80, 1100, statsRef.inView);
	const c30 = useCounter(30, 1200, statsRef.inView);
	const c999 = useCounter(999, 1300, statsRef.inView);

	useEffect(() => {
		const id = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);

	useEffect(() => {
		const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, []);

	const filtered = ALL_FEATURES.filter((f) => f.tabs.includes(activeTab));

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
						className="absolute top-16 right-[12%] size-72 rounded-full blur-[80px] animate-pulse"
						style={{ animationDuration: "7s", background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}
					/>
					<div
						className="absolute inset-0 opacity-[0.025]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
					/>
				</div>

				<div className="container mx-auto px-4 text-center relative">
					<div className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<SectionBadge icon={Headset} label="Everything you need to support your customers" />
						<h1 className="text-5xl md:text-[5rem] font-black mb-5 text-balance tracking-tight leading-[1.02]" style={{ lineHeight: 1.04 }}>
							Built for the{" "}
							<span
								style={{
									background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}>
								next era
							</span>
							{" "}of support
						</h1>
						<p
							className={`text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 text-pretty transition-all duration-1000 delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							From unified inbox to AI automation — everything you need to deliver great support, whether you're a solo consultant or a global team.
						</p>

						<div
							className={`flex flex-col sm:flex-row justify-center gap-3 mb-14 transition-all duration-1000 delay-250 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							<Button
								size="xl"
								asChild
								className="group">
								<a href="/auth/signup">
									Start free trial
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
							<Button
								size="xl"
								variant="outline"
								asChild
								className="gap-2">
								<a href="#demo">
									<Play className="size-4 group-hover:scale-110 transition-transform" />
									Watch demo
								</a>
							</Button>
						</div>
					</div>

					{/* Stat strip */}
					<div
						ref={statsRef.ref as React.RefObject<HTMLDivElement>}
						className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						{[
							{ icon: TrendingUp, value: `${c80}%`, label: "Auto-resolved" },
							{ icon: Clock, value: `<${c30}s`, label: "Routing Latency" },
							{ icon: Shield, value: `${(c999 / 10).toFixed(2)}%`, label: "Uptime SLA" },
							{ icon: Star, value: "4.9★", label: "Business Impact", static: true },
						].map(({ icon: Icon, value, label }) => (
							<div
								key={label}
								className="group relative flex flex-col items-center gap-1.5 py-6 px-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden cursor-default"
								style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
								<div
									className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
									style={{
										background:
											"radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
									}}
								/>
								<Icon className="size-4 text-primary mb-0.5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
								<span className="text-2xl font-black relative z-10" style={{ fontVariantNumeric: "tabular-nums" }}>
									{value}
								</span>
								<span className="text-xs text-muted-foreground relative z-10">{label}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── FEATURE GRID ── */}
			<FeatureGridSection activeTab={activeTab} setActiveTab={setActiveTab} filtered={filtered} />

			{/* ── SOCIAL PROOF ── */}
			<SocialProofSection />

			{/* ── CTA ── */}
			<FeaturesCtaSection />
		</SiteLayout>
	);
}

// ── Feature grid with tabs ──
function FeatureGridSection({ activeTab, setActiveTab, filtered }: { activeTab: string; setActiveTab: (t: string) => void; filtered: typeof ALL_FEATURES }) {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-20 md:py-28">
			<div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<SectionBadge icon={Sparkles} label="Core capabilities" />
				<h2 className="text-3xl md:text-5xl font-black mb-4 text-balance tracking-tight">The Pulse Ecosystem</h2>
				<p className="text-xl text-muted-foreground max-w-xl mx-auto">Discover the pillars of the most advanced support orchestration platform.</p>
			</div>

			{/* Tabs */}
			<div
				className={`flex flex-wrap justify-center gap-2 mb-12 transition-all duration-700 delay-100 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				{TABS.map((tab) => {
					const isActive = activeTab === tab;
					return (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`relative px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-300 overflow-hidden ${isActive
								? "text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105"
								: "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:scale-105"
								}`}
							style={isActive ? { background: "var(--color-primary)" } : {}}>
							{isActive && (
								<span
									className="absolute inset-0 rounded-full animate-pulse"
									style={{ background: "color-mix(in srgb, var(--color-primary) 25%, transparent)" }}
								/>
							)}
							<span className="relative z-10">{tab}</span>
						</button>
					);
				})}
			</div>

			{/* Cards grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
				{filtered.map(({ icon: Icon, title, description, bullets, stat, statLabel }, i) => (
					<div
						key={title}
						className={`group relative flex flex-col gap-5 p-7 rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
						style={{
							background: "var(--color-card)",
							borderColor: "var(--color-border)",
							boxShadow: "0 2px 16px -4px rgba(0,0,0,0.06)",
							transitionDelay: `${i * 60}ms`,
						}}>
						{/* Hover glow */}
						<div
							className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
							style={{
								background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 65%)",
							}}
						/>
						{/* Hover border glow */}
						<div
							className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
							style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)" }}
						/>

						{/* Header row */}
						<div className="flex items-start justify-between relative z-10">
							<div
								className="size-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
								style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
								<Icon className="size-5 text-primary" />
							</div>
							<div className="text-right">
								<div className="text-2xl font-black" style={{ color: "var(--color-primary)" }}>
									{stat}
								</div>
								<div className="text-xs text-muted-foreground">{statLabel}</div>
							</div>
						</div>

						{/* Content */}
						<div className="relative z-10">
							<h3 className="text-lg font-bold mb-2">{title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
						</div>

						{/* Bullets */}
						<ul className="space-y-2 mt-auto relative z-10">
							{bullets.map((b) => (
								<li key={b} className="flex items-start gap-2.5 text-sm group/bullet">
									<div
										className="size-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 group-hover/bullet:scale-110"
										style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
										<CheckCircle2 className="size-3 text-primary" />
									</div>
									<span className="text-muted-foreground group-hover/bullet:text-foreground transition-colors duration-200">{b}</span>
								</li>
							))}
						</ul>
					</div>
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
			<div className="container mx-auto px-4 max-w-5xl relative">
				<div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<SectionBadge icon={Star} label="Global impact" />
					<h2 className="text-3xl md:text-4xl font-black text-balance tracking-tight">Trusted by engineering-led support teams</h2>
				</div>
				<div className="grid md:grid-cols-3 gap-5">
					{SOCIAL_PROOF.map(({ quote, author, role, rating }, i) => (
						<div
							key={author}
							className={`group relative flex flex-col gap-4 p-7 rounded-2xl border overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{
								background: "var(--color-card)",
								borderColor: "var(--color-border)",
								transitionDelay: `${i * 100}ms`,
							}}>
							{/* Hover glow */}
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 70%)",
								}}
							/>
							{/* Inset border on hover */}
							<div
								className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)" }}
							/>

							<div className="flex gap-0.5 relative z-10">
								{Array.from({ length: rating }).map((_, idx) => (
									<Star key={idx} className="size-4 fill-primary text-primary" />
								))}
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed flex-1 relative z-10">"{quote}"</p>
							<div className="border-t border-border pt-4 relative z-10">
								<div className="text-sm font-bold">{author}</div>
								<div className="text-xs text-muted-foreground mt-0.5">{role}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ── Bottom CTA ──
function FeaturesCtaSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-24">
			<div
				className={`relative max-w-5xl mx-auto rounded-3xl overflow-hidden p-12 md:p-20 text-center transition-all duration-1000 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
				style={{
					background: "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 75%, var(--color-accent)) 100%)",
					boxShadow: "0 40px 100px -20px color-mix(in srgb, var(--color-primary) 40%, transparent)",
				}}>
				{/* Grid overlay */}
				<div
					className="absolute inset-0 opacity-[0.07] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
				/>
				{/* Glow blobs */}
				<div className="absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

				<div className="relative z-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-sm font-medium text-white mb-8">
						<Sparkles className="size-3.5" /> High-performance support starts here
					</div>
					<h2 className="text-4xl md:text-6xl font-black mb-5 text-white text-balance tracking-tight">Deploy Pulse in minutes</h2>
					<p className="text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
						Experience the power of autonomous support. 14-day full access trial, no commitment required.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Button
							size="xl"
							asChild
							className="group bg-white hover:bg-white/90"
							style={{ color: "var(--color-primary)" }}>
							<a href="/auth/signup">
								Start free trial
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button
							size="xl"
							variant="outline"
							asChild
							className="text-white border-white/35 hover:bg-white/10 hover:border-white/60">
							<a href="/contact">Talk to sales</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
