import { SiteLayout } from "./site-layout";
import { useInView, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink } from "./shared";
import {
	ArrowRight,
	Star,
	Zap,
	Users,
	Bot,
	BarChart3,
	Clock,
	Shield,
	Layers,
	Building2,
	Globe,
	Lock,
	Inbox,
	MessageSquare,
	TrendingUp,
	UserCheck,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Feature {
	icon: React.ElementType;
	title: string;
	desc: string;
}

interface Step {
	icon: React.ElementType;
	title: string;
	desc: string;
}

interface Stat {
	value: string;
	label: string;
	icon: React.ElementType;
}

interface Testimonial {
	quote: string;
	author: string;
	role: string;
	company: string;
}

interface SolutionData {
	badgeIcon: React.ElementType;
	badge: string;
	/** Mono telemetry code shown in the hero eyebrow, e.g. `SEG_01 / SUPPORT_TEAMS` */
	code: string;
	headline: string;
	headlineGradient: string;
	headlineAfter?: string;
	description: string;
	stats: Stat[];
	featuresHeadline: string;
	features: Feature[];
	stepsHeadline: string;
	steps: Step[];
	testimonial: Testimonial;
	ctaBadge: string;
	ctaHeadline: string;
	ctaDesc: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Segment data
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORT_TEAMS_DATA: SolutionData = {
	badgeIcon: Users,
	badge: "For Support Teams",
	code: "SEG_01 / SUPPORT_TEAMS",
	headline: "Handle more tickets",
	headlineGradient: "without growing",
	headlineAfter: "your team",
	description:
		"Pulse brings every channel, agent, and workflow into a single command center. Stop context-switching. Start resolving.",
	stats: [
		{ value: "80%", label: "Faster resolution", icon: Clock },
		{ value: "50K+", label: "Tickets/month handled", icon: Layers },
		{ value: "95%", label: "Customer satisfaction", icon: Star },
	],
	featuresHeadline: "Everything your support team needs",
	features: [
		{
			icon: Bot,
			title: "AI-powered triage",
			desc: "Auto-classify, prioritize, and route every ticket the moment it arrives. No manual sorting, no missed requests.",
		},
		{
			icon: Users,
			title: "Team & workload management",
			desc: "See your entire team's queue at a glance. Balance loads automatically and prevent agent burnout.",
		},
		{
			icon: Clock,
			title: "SLA tracking",
			desc: "Define SLAs per channel or priority. Get alerts before deadlines slip — never miss a commitment again.",
		},
		{
			icon: BarChart3,
			title: "Performance analytics",
			desc: "Measure resolution times, CSAT scores, and agent output from one unified dashboard.",
		},
	],
	stepsHeadline: "From chaos to resolved — in minutes",
	steps: [
		{
			icon: Layers,
			title: "Connect your channels",
			desc: "Bring email, chat, and social into one inbox. Takes minutes, not days.",
		},
		{
			icon: Zap,
			title: "Define your rules",
			desc: "Set SLAs, routing logic, and automation flows once. Pulse handles the rest.",
		},
		{
			icon: Bot,
			title: "Let AI handle the volume",
			desc: "Pulse classifies and routes every ticket while your team focuses on what actually needs a human.",
		},
	],
	testimonial: {
		quote:
			"Unifying our channels through Pulse reduced resolution time by 70%. The AI classification acts with surgical precision — our team finally has breathing room.",
		author: "Sarah Chen",
		role: "Head of Customer Success",
		company: "Contoso Ltd.",
	},
	ctaBadge: "Support Teams",
	ctaHeadline: "Ready to put your queue on autopilot?",
	ctaDesc: "14-day free trial. No credit card. Unified support and automation from day one.",
};

const AGENCIES_DATA: SolutionData = {
	badgeIcon: Building2,
	badge: "For Agencies",
	code: "SEG_02 / AGENCIES",
	headline: "Manage every client's support",
	headlineGradient: "from one place",
	description:
		"One platform. Multiple clients. Full visibility. Stop juggling tabs and tools — Pulse gives your agency a professional support operation at scale.",
	stats: [
		{ value: "8+", label: "Clients per workspace", icon: Building2 },
		{ value: "60%", label: "Less operational overhead", icon: TrendingUp },
		{ value: "100%", label: "Client data isolation", icon: Shield },
	],
	featuresHeadline: "Built for agencies that run support for others",
	features: [
		{
			icon: Building2,
			title: "Multi-client workspaces",
			desc: "Every client gets a fully isolated environment with their own channels, agents, and data. No cross-contamination.",
		},
		{
			icon: Globe,
			title: "Branded client inboxes",
			desc: "Set up custom-branded inboxes for each client. Your agency delivers a polished, professional experience.",
		},
		{
			icon: BarChart3,
			title: "Cross-client reporting",
			desc: "Aggregate or per-client reports in one click. Show your clients exactly what your team is delivering.",
		},
		{
			icon: Lock,
			title: "Role-based access",
			desc: "Control exactly who sees what. Assign agents to specific clients only — no accidental data exposure.",
		},
	],
	stepsHeadline: "Onboard a new client in under an hour",
	steps: [
		{
			icon: Building2,
			title: "Create a client workspace",
			desc: "Each client gets their own isolated space in minutes. No technical setup required.",
		},
		{
			icon: Inbox,
			title: "Connect their channels",
			desc: "Plug in their email, chat widget, and social accounts. Pulse unifies them immediately.",
		},
		{
			icon: BarChart3,
			title: "Report and retain",
			desc: "Generate per-client performance reports that prove your agency's value — and help you win renewals.",
		},
	],
	testimonial: {
		quote:
			"Managing 8 clients used to mean 8 different tools. Pulse collapsed it into one. Our team is faster, our clients are happier, and we win new business because of how we report on it.",
		author: "James Okafor",
		role: "Operations Lead",
		company: "BrightSupport Agency",
	},
	ctaBadge: "Agencies",
	ctaHeadline: "Your clients deserve better support. Start delivering it.",
	ctaDesc: "14-day free trial. Set up your first client workspace in under an hour.",
};

const SOLO_SMALL_TEAMS_DATA: SolutionData = {
	badgeIcon: UserCheck,
	badge: "For Solo & Small Teams",
	code: "SEG_03 / SOLO_SMALL_TEAMS",
	headline: "Stay on top of every request",
	headlineGradient: "without the complexity",
	description:
		"Built for one person or a small crew. Pulse keeps your requests organized, your responses fast, and your clients happy — without enterprise overhead.",
	stats: [
		{ value: "< 5 min", label: "To your first ticket", icon: Zap },
		{ value: "All", label: "Channels in one place", icon: Inbox },
		{ value: "1 → 50", label: "Scales with your team", icon: Users },
	],
	featuresHeadline: "Simple by design. Powerful when you need it.",
	features: [
		{
			icon: Inbox,
			title: "Unified inbox",
			desc: "Every email, chat, and form submission in one place. Stop switching tabs to find what needs a reply.",
		},
		{
			icon: Zap,
			title: "No-code automations",
			desc: "Set up auto-replies, routing, and tags in minutes. No engineers. No complexity. Just results.",
		},
		{
			icon: MessageSquare,
			title: "Canned replies",
			desc: "Save your best responses and reuse them with one click. Handle common questions in seconds.",
		},
		{
			icon: Users,
			title: "Grows with you",
			desc: "Start solo. Add a teammate when you're ready. Pricing that makes sense at every stage — no sudden jumps.",
		},
	],
	stepsHeadline: "Up and running in an afternoon",
	steps: [
		{
			icon: Zap,
			title: "Connect in 5 minutes",
			desc: "Plug in your email or chat widget. No IT department required — just a few clicks.",
		},
		{
			icon: Layers,
			title: "Organize once",
			desc: "Set up simple tags, priorities, and routing. One afternoon of setup, months of payoff.",
		},
		{
			icon: Bot,
			title: "Respond faster",
			desc: "AI suggestions and canned replies help you close tickets before coffee gets cold.",
		},
	],
	testimonial: {
		quote:
			"I run support solo for three SaaS products. Pulse is the first tool that didn't feel like it was built for a 50-person team. Setup took 10 minutes. Now I actually enjoy answering tickets.",
		author: "Mia Torres",
		role: "Independent Consultant",
		company: "Torres Digital",
	},
	ctaBadge: "Solo & Small Teams",
	ctaHeadline: "Keep it simple. Keep it fast. Keep every client happy.",
	ctaDesc: "Free for 14 days. No credit card. No enterprise contract. Just great support.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared page component
// ─────────────────────────────────────────────────────────────────────────────

export function SolutionPage({ data }: { data: SolutionData }) {
	const visible = useMountVisible();
	const { ref: featuresRef, inView: featuresInView } = useInView();
	const { ref: stepsRef, inView: stepsInView } = useInView();
	const { ref: testimonialRef, inView: testimonialInView } = useInView();
	const { ref: ctaRef, inView: ctaInView } = useInView();

	const BadgeIcon = data.badgeIcon;

	return (
		<SiteLayout>
			<div className="mx-auto max-w-350 border-x border-border">
				{/* ── HERO ── */}
				<section className="relative border-b border-border overflow-hidden">
					{/* faint dot grid, top-right */}
					<div
						className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
					/>

					<div
						className={`relative px-6 md:px-12 pt-16 md:pt-24 pb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						{/* telemetry eyebrow */}
						<div className="flex items-center gap-3 mb-10">
							<span className="relative flex size-2">
								<span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
								<span className="relative inline-flex size-2 rounded-full bg-accent" />
							</span>
							<MonoTag className="text-foreground/70">
								{data.code}
								<span className="blink-cursor text-accent">_</span>
							</MonoTag>
							<span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground border-l border-border pl-3">
								<BadgeIcon className="size-3 text-accent" />
								{data.badge}
							</span>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							{data.headline}{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								{data.headlineGradient}
							</span>
							{data.headlineAfter && <> {data.headlineAfter}</>}
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">{data.description}</p>

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
					<div className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-3 divide-x divide-border">
							{data.stats.map(({ value, label }, i) => (
								<div
									key={label}
									className={`px-4 md:px-10 py-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
									style={{ transitionDelay: `${i * 100 + 300}ms` }}>
									<div className="text-3xl md:text-5xl font-black tracking-tighter mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>
										{value}
									</div>
									<div className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary font-semibold">{label}</div>
								</div>
							))}
						</div>
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── FEATURES ── */}
				<section ref={featuresRef as React.RefObject<HTMLElement>}>
					<SectionRule index="01" label="CAPABILITIES" title={data.featuresHeadline} right="BUILT-IN / NO ADD-ONS" />
					<div className="h-10" />

					<div className="relative border-t border-border">
						<Cross className="-top-2 left-1/2 -translate-x-1/2 hidden sm:block" />
						<div className="grid sm:grid-cols-2 gap-px bg-border border-b border-border">
							{data.features.map(({ icon: Icon, title, desc }, i) => (
								<div
									key={title}
									className={`group relative bg-background px-6 md:px-12 py-10 transition-all duration-700 ${featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
									style={{ transitionDelay: `${i * 100 + 100}ms` }}>
									{/* lime scan-line grows on hover */}
									<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />

									<div className="flex items-center justify-between mb-6">
										<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">0{i + 1}</span>
										<Icon className="size-5 text-accent" />
									</div>
									<h3 className="text-xl md:text-2xl font-black tracking-tight mb-2.5">{title}</h3>
									<p className="text-sm md:text-base text-muted-foreground leading-relaxed">{desc}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ── HOW IT WORKS — dark band ── */}
				<section
					ref={stepsRef as React.RefObject<HTMLElement>}
					className="relative text-white border-b border-border"
					style={{ background: "var(--pulse-ink)" }}>
					<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
						<span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: "var(--pulse-lime)" }}>
							02 — PROCESS
						</span>
						<span className="hidden sm:block font-mono text-[11px] tracking-[0.25em] text-white/40">REQUEST → RESOLVED</span>
					</div>

					<div className={`px-6 md:px-12 pt-14 pb-4 transition-all duration-700 ${stepsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance max-w-3xl">{data.stepsHeadline}</h2>
					</div>

					{/* EKG connecting the steps */}
					<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
						<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
					</div>

					<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10">
						{data.steps.map(({ icon: Icon, title, desc }, i) => (
							<div
								key={title}
								className={`px-6 md:px-12 py-12 transition-all duration-700 ${stepsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ transitionDelay: `${i * 150 + 150}ms` }}>
								<div className="flex items-center justify-between mb-8">
									<span className="font-mono text-5xl font-black text-white/15">/0{i + 1}</span>
									<Icon className="size-5" style={{ color: "var(--pulse-lime)" }} />
								</div>
								<h3 className="text-xl font-bold mb-3">{title}</h3>
								<p className="text-sm text-white/50 leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* ── TESTIMONIAL ── */}
				<section ref={testimonialRef as React.RefObject<HTMLElement>} className="border-b border-border">
					<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
						<MonoTag className="text-primary">03 — TRANSMISSION</MonoTag>
						<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
							<span className="size-1.5 rounded-full bg-accent animate-pulse" />
							VERIFIED CUSTOMER
						</span>
					</div>

					<div
						className={`px-6 md:px-12 py-14 md:py-20 transition-all duration-700 ${testimonialInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<MessageSquare className="size-6 text-accent mb-6" />
						<blockquote className="text-2xl md:text-[2rem] font-bold tracking-tight leading-snug text-balance mb-8 max-w-3xl">
							"{data.testimonial.quote}"
						</blockquote>
						<div className="font-mono text-xs tracking-wider text-muted-foreground">
							<span className="text-foreground font-bold">{data.testimonial.author.toUpperCase()}</span> ·{" "}
							{data.testimonial.role.toUpperCase()} — {data.testimonial.company.toUpperCase()}
						</div>
					</div>
				</section>

				{/* ── CTA — dark deep band ── */}
				<section
					ref={ctaRef as React.RefObject<HTMLElement>}
					className="relative text-white overflow-hidden"
					style={{ background: "var(--pulse-ink-deep)" }}>
					{/* giant background EKG */}
					<div className="absolute inset-0 flex items-center opacity-30 pointer-events-none" style={{ color: "var(--pulse-lime)" }}>
						<PulseLine className="w-full h-40" strokeWidth={0.8} />
					</div>

					<div
						className={`relative px-6 md:px-12 py-24 md:py-32 text-center transition-all duration-1000 ${ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<MonoTag className="block mb-8 text-white/50">04 — DEPLOY · {data.ctaBadge.toUpperCase()}</MonoTag>
						<h2 className="text-4xl md:text-6xl font-black tracking-tighter text-balance mb-6 max-w-4xl mx-auto">{data.ctaHeadline}</h2>
						<p className="text-white/55 text-lg md:text-xl mb-12 max-w-xl mx-auto">{data.ctaDesc}</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<CtaLink href="/auth/signup" variant="lime">
								Start free trial <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<a
								href="/pricing"
								className="inline-flex items-center justify-center gap-2 border border-white/25 px-7 py-4 font-mono text-xs tracking-[0.15em] uppercase font-semibold text-white hover:border-(--pulse-lime) hover:text-(--pulse-lime) transition-colors duration-200">
								See pricing
							</a>
						</div>
					</div>
				</section>
			</div>
		</SiteLayout>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported page components (one per route)
// ─────────────────────────────────────────────────────────────────────────────

export function SupportTeamsPage() {
	return <SolutionPage data={SUPPORT_TEAMS_DATA} />;
}

export function AgenciesPage() {
	return <SolutionPage data={AGENCIES_DATA} />;
}

export function SoloSmallTeamsPage() {
	return <SolutionPage data={SOLO_SMALL_TEAMS_DATA} />;
}
