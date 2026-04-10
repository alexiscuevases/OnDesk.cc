import { SiteLayout } from "./site-layout";
import {
	SectionBadge,
	GradientText,
	CtaDecorations,
	useInView,
	useMountVisible,
	useMouseGlow,
	HeroBg,
} from "./shared";
import { Button } from "@/components/ui/button";
import {
	ArrowRight,
	CheckCircle2,
	Star,
	TrendingUp,
	Sparkles,
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

export const SUPPORT_TEAMS_DATA: SolutionData = {
	badgeIcon: Users,
	badge: "For Support Teams",
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

export const AGENCIES_DATA: SolutionData = {
	badgeIcon: Building2,
	badge: "For Agencies",
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

export const SOLO_SMALL_TEAMS_DATA: SolutionData = {
	badgeIcon: UserCheck,
	badge: "For Solo & Small Teams",
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
	const mousePos = useMouseGlow();
	const visible = useMountVisible();
	const featuresSection = useInView();
	const stepsSection = useInView();
	const testimonialSection = useInView();
	const ctaSection = useInView();

	const BadgeIcon = data.badgeIcon;

	return (
		<SiteLayout>
			{/* ── HERO ── */}
			<section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden">
				<HeroBg mousePos={mousePos} />

				<div className="container mx-auto px-4">
					<div
						className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
						{/* Segment badge */}
						<div className="flex justify-center mb-8">
							<span
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
								style={{
									background:
										"linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, transparent), color-mix(in srgb, var(--color-accent) 5%, transparent))",
									borderColor: "color-mix(in srgb, var(--color-primary) 25%, transparent)",
									color: "var(--color-primary)",
								}}>
								<BadgeIcon className="size-3.5" />
								{data.badge}
							</span>
						</div>

						{/* Headline */}
						<h1
							className={`text-5xl md:text-[4.5rem] font-black leading-[1.04] tracking-tight text-balance mb-6 transition-all duration-1000 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							{data.headline}{" "}
							<GradientText>{data.headlineGradient}</GradientText>
							{data.headlineAfter && (
								<>
									{" "}
									{data.headlineAfter}
								</>
							)}
						</h1>

						{/* Description */}
						<p
							className={`text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10 transition-all duration-1000 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							{data.description}
						</p>

						{/* CTAs */}
						<div
							className={`flex flex-col sm:flex-row justify-center gap-3 mb-16 transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							<Button size="xl" asChild className="group relative overflow-hidden">
								<a href="/auth/signup">
									<span className="relative z-10 flex items-center gap-2">
										Start free trial
										<ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-200" />
									</span>
								</a>
							</Button>
							<Button size="xl" variant="outline" asChild>
								<a href="/pricing">See pricing</a>
							</Button>
						</div>

						{/* Stats row */}
						<div
							className={`grid grid-cols-3 gap-4 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
							{data.stats.map(({ value, label, icon: Icon }) => (
								<div
									key={label}
									className="group flex flex-col items-center gap-1.5 p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default"
									style={{
										background: "var(--color-card)",
										borderColor: "var(--color-border)",
										boxShadow: "0 2px 12px -4px rgba(0,0,0,0.06)",
									}}>
									<div
										className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
										style={{
											background:
												"radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
										}}
									/>
									<Icon className="size-4 text-primary mb-0.5 relative z-10" />
									<span className="text-2xl md:text-3xl font-black relative z-10" style={{ fontVariantNumeric: "tabular-nums" }}>
										{value}
									</span>
									<span className="text-xs text-muted-foreground text-center leading-snug relative z-10">{label}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── FEATURES ── */}
			<section
				ref={featuresSection.ref as React.RefObject<HTMLElement>}
				className="container mx-auto px-4 py-20 md:py-28">
				<div
					className={`text-center mb-14 transition-all duration-700 ${featuresSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<SectionBadge icon={Sparkles} label="Features" />
					<h2 className="text-3xl md:text-5xl font-black mb-4 text-balance tracking-tight">{data.featuresHeadline}</h2>
				</div>

				<div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-5">
					{data.features.map(({ icon: Icon, title, desc }, i) => (
						<div
							key={title}
							className={`group relative flex gap-5 p-7 rounded-2xl border overflow-hidden transition-all duration-700 hover:-translate-y-1 hover:shadow-xl ${featuresSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{
								background: "var(--color-card)",
								borderColor: "var(--color-border)",
								boxShadow: "0 2px 16px -4px rgba(0,0,0,0.06)",
								transitionDelay: `${i * 80 + 150}ms`,
							}}>
							{/* Hover glow */}
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background:
										"radial-gradient(ellipse at 0% 0%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 65%)",
								}}
							/>
							{/* Hover border */}
							<div
								className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)" }}
							/>

							<div
								className="size-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 self-start mt-0.5"
								style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
								<Icon className="size-5 text-primary" />
							</div>
							<div className="relative z-10">
								<h3 className="font-bold text-lg mb-1.5">{title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ── HOW IT WORKS ── */}
			<section
				ref={stepsSection.ref as React.RefObject<HTMLElement>}
				className="border-y border-border py-24 md:py-32"
				style={{ background: "color-mix(in srgb, var(--color-muted) 15%, transparent)" }}>
				<div className="container mx-auto px-4">
					<div
						className={`text-center mb-16 transition-all duration-700 ${stepsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<SectionBadge icon={Zap} label="How it works" />
						<h2 className="text-3xl md:text-5xl font-black mb-4 text-balance tracking-tight">{data.stepsHeadline}</h2>
					</div>

					<div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
						{data.steps.map(({ icon: Icon, title, desc }, i) => (
							<div
								key={title}
								className={`relative group transition-all duration-700 ${stepsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
								style={{ transitionDelay: `${i * 120 + 200}ms` }}>
								{/* Connector */}
								{i < 2 && (
									<div
										className="hidden md:block absolute top-10 left-full h-px z-0"
										style={{
											width: "calc(100% - 1.5rem)",
											transform: "translateX(0.75rem)",
											background: "linear-gradient(to right, var(--color-border), transparent)",
										}}
									/>
								)}
								<div
									className="relative z-10 flex flex-col gap-4 p-7 rounded-2xl border overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl"
									style={{
										background: "var(--color-card)",
										borderColor: "var(--color-border)",
										boxShadow: "0 2px 16px -4px rgba(0,0,0,0.06)",
									}}>
									<div
										className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
										style={{
											background:
												"radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 70%)",
										}}
									/>
									<div className="flex items-center justify-between relative z-10">
										<div
											className="size-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
											style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
											<Icon className="size-6 text-primary" />
										</div>
										<span
											className="text-5xl font-black"
											style={{ color: "color-mix(in srgb, var(--color-muted-foreground) 15%, transparent)" }}>
											0{i + 1}
										</span>
									</div>
									<h3 className="text-lg font-bold relative z-10">{title}</h3>
									<p className="text-sm text-muted-foreground leading-relaxed relative z-10">{desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── TESTIMONIAL ── */}
			<section
				ref={testimonialSection.ref as React.RefObject<HTMLElement>}
				className="container mx-auto px-4 py-24 md:py-32">
				<div
					className={`max-w-3xl mx-auto transition-all duration-700 ${testimonialSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<SectionBadge icon={Star} label="What customers say" />

					<div
						className="relative rounded-3xl p-10 md:p-14 text-center overflow-hidden"
						style={{
							background: "var(--color-card)",
							border: "1px solid var(--color-border)",
							boxShadow: "0 20px 60px -12px rgba(0,0,0,0.08)",
						}}>
						{/* Ambient glow */}
						<div
							className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full blur-[100px] pointer-events-none"
							style={{ background: "color-mix(in srgb, var(--color-primary) 6%, transparent)" }}
						/>

						<div className="relative z-10">
							<div className="flex justify-center gap-1 mb-6">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star key={i} className="size-5 fill-primary text-primary" />
								))}
							</div>
							<blockquote className="text-xl md:text-2xl font-semibold text-foreground mb-8 text-balance leading-snug">
								"{data.testimonial.quote}"
							</blockquote>
							<div className="flex items-center justify-center gap-3">
								<div
									className="size-10 rounded-full flex items-center justify-center text-sm font-bold text-primary"
									style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
									{data.testimonial.author[0]}
								</div>
								<div className="text-left">
									<p className="font-bold text-sm text-foreground">{data.testimonial.author}</p>
									<p className="text-xs text-muted-foreground">
										{data.testimonial.role}, {data.testimonial.company}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── CTA ── */}
			<section ref={ctaSection.ref as React.RefObject<HTMLElement>} className="container mx-auto px-4 pb-24">
				<div
					className={`cta-gradient relative max-w-5xl mx-auto rounded-3xl overflow-hidden p-12 md:p-20 text-center transition-all duration-1000 ${ctaSection.inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
					<CtaDecorations />

					<div className="relative z-10">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-sm font-medium text-white mb-8">
							<TrendingUp className="size-3.5" />
							{data.ctaBadge}
						</div>
						<h2 className="text-4xl md:text-6xl font-black mb-5 text-white text-balance tracking-tight">{data.ctaHeadline}</h2>
						<p className="text-xl text-white/75 mb-10 max-w-2xl mx-auto text-pretty leading-relaxed">{data.ctaDesc}</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Button size="xl" asChild className="group bg-white hover:bg-white/90" style={{ color: "var(--color-primary)" }}>
								<a href="/auth/signup">
									Start free trial
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
							<Button size="xl" variant="outline" asChild className="text-white border-white/35 hover:bg-white/10 hover:border-white/60">
								<a href="/pricing">See pricing</a>
							</Button>
						</div>
					</div>
				</div>
			</section>
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
