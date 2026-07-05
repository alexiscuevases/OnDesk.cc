import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink } from "./shared";
import {
	ArrowRight,
	ArrowUpRight,
	Bot,
	Zap,
	Users,
	MessageSquare,
	CheckCircle2,
	Ticket,
	Sparkles,
	Shield,
	Globe,
	Puzzle,
	Layers,
	UserCheck,
	Building2,
} from "lucide-react";
import { useState, useEffect } from "react";

// ─── types ───────────────────────────────────────────────────────────────────

interface LiveTicket {
	id: string;
	title: string;
	priority: "high" | "medium" | "low";
	status: "open" | "ai-resolving" | "resolved";
	time: string;
	agent: string;
}

// ─── data ────────────────────────────────────────────────────────────────────

const PERSONAS = [
	{
		icon: Users,
		label: "Support Teams",
		href: "/solutions/support-teams",
		desc: "Manage high-volume queues with automation, routing, and real-time analytics.",
	},
	{
		icon: Building2,
		label: "Agencies",
		href: "/solutions/agencies",
		desc: "Run support for multiple clients from a single, organized workspace.",
	},
	{
		icon: UserCheck,
		label: "Solo & Small Teams",
		href: "/solutions/solo-small-teams",
		desc: "Keep every request organized without the complexity. Set up in minutes.",
	},
];

const FEATURES = [
	{
		id: "unification",
		icon: Layers,
		index: "01",
		label: "Unification",
		title: "All your channels, one place",
		description: "Email, chat, web widgets — everything lands in a single inbox. No more tab-switching, no more missed messages.",
		bullets: ["Unified inbox for every channel", "Multi-source sync", "Consistent experience everywhere"],
	},
	{
		id: "automation",
		icon: Bot,
		index: "02",
		label: "Automation",
		title: "Classify, route, and resolve automatically",
		description: "AI triages incoming tickets, routes them to the right place, and resolves the common ones — instantly.",
		bullets: ["Smart AI classification", "Dynamic routing rules", "End-to-end auto-resolution"],
	},
	{
		id: "marketplace",
		icon: Puzzle,
		index: "03",
		label: "Marketplace",
		title: "Extend with the tools you already use",
		description: "Connect your CRM, billing system, or any tool you rely on. A growing ecosystem of integrations.",
		bullets: ["One-click integrations", "Custom app ecosystem", "Extensible API"],
	},
	{
		id: "platform",
		icon: Users,
		index: "04",
		label: "Platform",
		title: "Manage people, queues, and workflows",
		description: "Whether it's one person or a hundred, Pulse gives you the controls to stay organized and balance load.",
		bullets: ["Team & workload balancing", "Advanced workflow builder", "Performance analytics"],
	},
];

const TESTIMONIALS = [
	{
		quote: "Unifying our channels through Pulse reduced resolution time by 70%. Our team finally has breathing room.",
		author: "Sarah Chen",
		role: "Head of Customer Success",
		company: "Contoso Ltd.",
		segment: "SUPPORT TEAMS",
	},
	{
		quote: "Managing 8 clients used to mean 8 different tools. Pulse collapsed it into one. Our clients are happier and we win new business because of how we report on it.",
		author: "James Okafor",
		role: "Operations Lead",
		company: "BrightSupport Agency",
		segment: "AGENCIES",
	},
	{
		quote: "I run support solo for three SaaS products. Pulse is the first tool that didn't feel like it was built for a 50-person team. Setup took 10 minutes.",
		author: "Mia Torres",
		role: "Independent Consultant",
		company: "Torres Digital",
		segment: "SOLO & SMALL TEAMS",
	},
];

const TICKER_ITEMS = [
	"CONTOSO ▲ 70% FASTER RESOLUTION",
	"FABRIKAM ▲ 8 CLIENTS · ONE INBOX",
	"NORTHWIND ▲ 12K TICKETS / MO",
	"TAILWIND ▲ 96% CSAT",
	"LITWARE ▲ SETUP IN 5 MIN",
	"WINGTIP ▲ 99.99% UPTIME",
	"PROSEWARE ▲ 41% AUTO-RESOLVED",
	"ADVENTURE WORKS ▲ 24/7 COVERAGE",
];

const INITIAL_TICKETS: LiveTicket[] = [
	{ id: "#4821", title: "Invoice not received after payment", priority: "high", status: "ai-resolving", time: "0s", agent: "AI Agent" },
	{ id: "#4820", title: "Onboarding support — Acme Inc.", priority: "medium", status: "resolved", time: "42s", agent: "AI Agent" },
	{ id: "#4819", title: "Feature request: dark mode toggle", priority: "low", status: "resolved", time: "1m", agent: "AI Agent" },
	{ id: "#4818", title: "Can't access my account dashboard", priority: "high", status: "open", time: "2m", agent: "Unassigned" },
];

const NEW_TICKETS: LiveTicket[] = [
	{ id: "#4825", title: "Refund request — order #8812", priority: "medium", status: "ai-resolving", time: "now", agent: "AI Agent" },
	{ id: "#4824", title: "Password reset email not arriving", priority: "low", status: "ai-resolving", time: "now", agent: "AI Agent" },
	{ id: "#4823", title: "Urgent: client site unreachable", priority: "high", status: "open", time: "now", agent: "Unassigned" },
];

const PRIORITY_ON_DARK = {
	high: "text-red-400",
	medium: "text-amber-300",
	low: "text-(--pulse-lime)",
};

// ─── primitives ──────────────────────────────────────────────────────────────

// ─── page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
	return (
		<SiteLayout>
			{/* Editorial rails: the whole page lives inside two hairline verticals */}
			<div className="mx-auto max-w-350 border-x border-border">
				<Hero />
				<Ticker />
				<Stats />
				<FeaturesBento />
				<HowItWorks />
				<Testimonials />
				<TrustStrip />
				<FinalCta />
			</div>
		</SiteLayout>
	);
}

// ─── hero ────────────────────────────────────────────────────────────────────

function Hero() {
	const visible = useMountVisible();
	const [activePersona, setActivePersona] = useState(0);

	return (
		<section className="relative border-b border-border overflow-hidden">
			{/* faint dot grid, top-right only */}
			<div
				className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none"
				style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
			/>

			<div className="grid lg:grid-cols-12 relative">
				{/* ── Left: editorial headline ── */}
				<div className={`lg:col-span-7 px-6 md:px-12 pt-16 md:pt-24 pb-12 lg:border-r border-border transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					{/* telemetry eyebrow */}
					<div className="flex items-center gap-3 mb-10">
						<span className="relative flex size-2">
							<span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
							<span className="relative inline-flex size-2 rounded-full bg-accent" />
						</span>
						<MonoTag className="text-foreground/70">
							LIVE — AI SUPPORT OPERATING SYSTEM<span className="blink-cursor text-accent">_</span>
						</MonoTag>
					</div>

					<h1 className="text-[13vw] sm:text-6xl md:text-7xl xl:text-[5.2rem] font-black leading-[0.98] tracking-tighter mb-10">
						Support that
						<br />
						never{" "}
						<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
							skips
						</span>{" "}
						a beat.
					</h1>

					{/* persona index — numbered editorial list */}
					<div className="border-t border-border mb-10">
						{PERSONAS.map(({ label, href, desc }, i) => {
							const isActive = activePersona === i;
							return (
								<button
									key={label}
									onClick={() => setActivePersona(i)}
									className={`w-full text-left border-b border-border transition-colors duration-200 ${isActive ? "" : "hover:bg-muted/50"}`}
									style={isActive ? { background: "color-mix(in srgb, var(--color-accent) 7%, transparent)" } : undefined}>
									<div className="flex items-baseline gap-4 px-1 py-3.5">
										<span className={`font-mono text-xs ${isActive ? "text-accent font-bold" : "text-muted-foreground/60"}`}>
											{String(i + 1).padStart(2, "0")}
										</span>
										<span className={`text-base md:text-lg font-bold tracking-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
											{label}
										</span>
										{isActive && <ArrowUpRight className="size-4 text-accent ml-auto shrink-0 self-center" />}
									</div>
									{isActive && (
										<div className="px-1 pb-4 pl-11 animate-in fade-in slide-in-from-top-1 duration-300">
											<p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-2">{desc}</p>
											<a
												href={href}
												onClick={(e) => e.stopPropagation()}
												className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.15em] uppercase text-primary hover:text-accent transition-colors">
												See how it works <ArrowRight className="size-3" />
											</a>
										</div>
									)}
								</button>
							);
						})}
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<CtaLink href="/auth/signup">
							Start free — 14 days <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
						</CtaLink>
						<CtaLink href="/pricing" variant="outline">
							See pricing
						</CtaLink>
					</div>
				</div>

				{/* ── Right: live console ── */}
				<div className={`lg:col-span-5 flex flex-col transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<LiveConsole />
				</div>
			</div>

			{/* full-width EKG divider */}
			<div className="border-t border-border text-accent">
				<PulseLine className="w-full h-10 block" />
			</div>
		</section>
	);
}

function LiveConsole() {
	const [tickets, setTickets] = useState<LiveTicket[]>(INITIAL_TICKETS);
	const [ticketIdx, setTicketIdx] = useState(0);

	useEffect(() => {
		const iv = setInterval(() => {
			if (ticketIdx < NEW_TICKETS.length) {
				setTickets((prev) => [NEW_TICKETS[ticketIdx], ...prev.slice(0, 3)]);
				setTicketIdx((i) => i + 1);
			}
		}, 3200);
		return () => clearInterval(iv);
	}, [ticketIdx]);

	return (
		<div className="flex-1 flex flex-col text-white" style={{ background: "var(--pulse-ink)" }}>
			{/* console header */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
				<span className="font-mono text-[11px] tracking-[0.2em] text-white/60">
					PULSE://LIVE_FEED<span className="blink-cursor text-(--pulse-lime)">▌</span>
				</span>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-(--pulse-lime)">
					<span className="size-1.5 rounded-full animate-pulse" style={{ background: "var(--pulse-lime)" }} />
					REC
				</span>
			</div>

			{/* mini EKG trace */}
			<div className="border-b border-white/10 px-5 py-3" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-8 block" strokeWidth={1.2} />
			</div>

			{/* ticket rows */}
			<div className="flex-1 divide-y divide-white/8">
				{tickets.map((t, i) => (
					<div
						key={t.id + i}
						className={`px-5 py-4 ${i === 0 ? "animate-in fade-in slide-in-from-top-2 duration-500 bg-white/4" : ""}`}>
						<div className="flex items-center gap-3 font-mono text-[11px] mb-1.5">
							<span className="text-(--pulse-lime)">{t.id}</span>
							<span className={`uppercase tracking-wider ${PRIORITY_ON_DARK[t.priority]}`}>[{t.priority}]</span>
							<span className="ml-auto text-white/35">{t.time}</span>
						</div>
						<div className="flex items-center gap-3">
							<Ticket className="size-3.5 shrink-0 text-white/30" />
							<span className="flex-1 truncate text-sm text-white/85">{t.title}</span>
							<span className="font-mono text-[10px] tracking-wider shrink-0 uppercase" style={{ color: t.status === "open" ? "rgba(255,255,255,0.4)" : "var(--pulse-lime)" }}>
								{t.status === "ai-resolving" ? "⚡ AI RESOLVING" : t.status === "resolved" ? "✓ RESOLVED" : "○ OPEN"}
							</span>
						</div>
					</div>
				))}
			</div>

			{/* console footer telemetry */}
			<div className="px-5 py-3.5 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] tracking-widest text-white/45">
				<span>LATENCY 0.3S</span>
				<span style={{ color: "var(--pulse-lime)" }}>AI-RESOLVED 68%</span>
				<span>UPTIME 99.99%</span>
			</div>
		</div>
	);
}

// ─── ticker ──────────────────────────────────────────────────────────────────

function Ticker() {
	return (
		<div className="relative overflow-hidden border-b border-border py-3.5 bg-muted/30">
			<div className="flex gap-12 animate-ticker whitespace-nowrap">
				{[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
					<span key={i} className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground shrink-0 select-none">
						<span className="text-accent mr-2">●</span>
						{item}
					</span>
				))}
			</div>
			<div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-background to-transparent pointer-events-none" />
			<div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-background to-transparent pointer-events-none" />
		</div>
	);
}

// ─── stats ───────────────────────────────────────────────────────────────────

function Stats() {
	const { ref, inView } = useInView();
	const c80 = useCounter(80, 1200, inView);
	const c50 = useCounter(50, 1400, inView);
	const c95 = useCounter(95, 1300, inView);

	const stats = [
		{ display: `${c80}%`, label: "FASTER RESOLUTION", sub: "vs. traditional helpdesks" },
		{ display: `${c50}K+`, label: "TICKETS / MONTH", sub: "handled across workspaces" },
		{ display: `${c95}%`, label: "CUSTOMER SATISFACTION", sub: "average CSAT score" },
		{ display: "1→∞", label: "SOLO TO ENTERPRISE", sub: "scales with your team" },
	];

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative border-b border-border">
			<Cross className="-top-2 -left-1.5" />
			<Cross className="-top-2 -right-1.5" />
			<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
				{stats.map(({ display, label, sub }, i) => (
					<div
						key={label}
						className={`px-6 md:px-10 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
						style={{ transitionDelay: `${i * 100}ms` }}>
						<div className="text-5xl md:text-6xl font-black tracking-tighter mb-4" style={{ fontVariantNumeric: "tabular-nums" }}>
							{display}
						</div>
						<div className="font-mono text-[10px] tracking-[0.2em] text-primary font-semibold mb-1">{label}</div>
						<div className="text-xs text-muted-foreground">{sub}</div>
					</div>
				))}
			</div>
		</section>
	);
}

// ─── features bento ──────────────────────────────────────────────────────────

function FeaturesBento() {
	const { ref, inView } = useInView();
	return (
		<section id="features" ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="02" label="PLATFORM" title="Built for how you actually work" right="4 MODULES / 1 SYSTEM" />
			<p className="px-6 md:px-12 pb-10 text-lg text-muted-foreground max-w-2xl">
				Four modules, one heartbeat. Everything your support operation needs — nothing it doesn't.
			</p>

			<div className="relative border-t border-border">
				<Cross className="-top-2 left-1/2 -translate-x-1/2 hidden md:block" />
				<div className="grid md:grid-cols-2 gap-px bg-border border-b border-border">
					{FEATURES.map((f, i) => {
						const Icon = f.icon;
						return (
							<div
								key={f.id}
								className={`group relative bg-background px-6 md:px-12 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ transitionDelay: `${i * 120}ms` }}>
								{/* lime scan-line grows on hover */}
								<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: "var(--color-accent)" }} />

								<div className="flex items-center justify-between mb-8">
									<MonoTag className="text-primary">
										{f.index} / {f.label}
									</MonoTag>
									<Icon className="size-5 text-accent" />
								</div>

								<h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-balance">{f.title}</h3>
								<p className="text-muted-foreground leading-relaxed mb-6">{f.description}</p>

								<ul className="space-y-2.5 mb-8">
									{f.bullets.map((b) => (
										<li key={b} className="flex items-center gap-3 text-sm text-muted-foreground">
											<CheckCircle2 className="size-3.5 text-accent shrink-0" />
											{b}
										</li>
									))}
								</ul>

								<div className="border border-border p-5 bg-muted/20">
									{f.id === "unification" && <WidgetVisual />}
									{f.id === "automation" && <AIAgentVisual />}
									{f.id === "marketplace" && <MarketplaceVisual />}
									{f.id === "platform" && <TeamsVisual />}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

// ─── how it works — dark band ────────────────────────────────────────────────

function HowItWorks() {
	const { ref, inView } = useInView();
	const steps = [
		{ step: "01", title: "Connect your channels", desc: "Bring every conversation into one place — email, chat, forms. Takes minutes, not days.", icon: Layers },
		{ step: "02", title: "Let AI do the sorting", desc: "Pulse classifies, prioritizes, and routes every request automatically. No manual triage.", icon: Bot },
		{ step: "03", title: "Resolve faster", desc: "Your team focuses on what actually needs a human. Everything else gets handled.", icon: Sparkles },
	];
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white border-b border-border" style={{ background: "var(--pulse-ink)" }}>
			{/* header */}
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
				<span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: "var(--pulse-lime)" }}>
					03 — PROCESS
				</span>
				<span className="hidden sm:block font-mono text-[11px] tracking-[0.25em] text-white/40">REQUEST → RESOLVED</span>
			</div>

			<div className={`px-6 md:px-12 pt-14 pb-4 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance max-w-3xl mb-3">
					From request to resolved — <span style={{ color: "var(--pulse-lime)" }}>in seconds.</span>
				</h2>
				<p className="text-white/50 text-lg">Three steps. Works for any size.</p>
			</div>

			{/* EKG connecting the steps */}
			<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10">
				{steps.map(({ step, title, desc, icon: Icon }, i) => (
					<div
						key={step}
						className={`px-6 md:px-12 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 150 + 150}ms` }}>
						<div className="flex items-center justify-between mb-8">
							<span className="font-mono text-5xl font-black text-white/15">/{step}</span>
							<Icon className="size-5" style={{ color: "var(--pulse-lime)" }} />
						</div>
						<h3 className="text-xl font-bold mb-3">{title}</h3>
						<p className="text-sm text-white/50 leading-relaxed">{desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

// ─── testimonials ────────────────────────────────────────────────────────────

function Testimonials() {
	const { ref, inView } = useInView();
	const [active, setActive] = useState(0);

	useEffect(() => {
		const iv = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5500);
		return () => clearInterval(iv);
	}, []);

	const t = TESTIMONIALS[active];

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">04 — TRANSMISSIONS</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					INCOMING
				</span>
			</div>

			<div className={`grid lg:grid-cols-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				{/* index rail */}
				<div className="lg:col-span-3 lg:border-r border-b lg:border-b-0 border-border flex lg:flex-col">
					{TESTIMONIALS.map((item, i) => (
						<button
							key={i}
							onClick={() => setActive(i)}
							className={`flex-1 lg:flex-none text-left px-6 md:px-8 py-5 border-r lg:border-r-0 lg:border-b border-border last:border-r-0 transition-colors duration-200 ${i === active ? "" : "hover:bg-muted/40"}`}
							style={i === active ? { background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" } : undefined}>
							<span className={`block font-mono text-[10px] tracking-[0.2em] mb-1 ${i === active ? "text-accent font-bold" : "text-muted-foreground/60"}`}>
								LOG_{String(i + 1).padStart(2, "0")}
							</span>
							<span className={`hidden sm:block text-xs font-semibold tracking-wide ${i === active ? "text-foreground" : "text-muted-foreground"}`}>
								{item.segment}
							</span>
						</button>
					))}
				</div>

				{/* quote */}
				<div className="lg:col-span-9 px-6 md:px-12 py-12 md:py-16 relative min-h-72 flex flex-col justify-center" key={active}>
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
						<MessageSquare className="size-6 text-accent mb-6" />
						<blockquote className="text-2xl md:text-[2rem] font-bold tracking-tight leading-snug text-balance mb-8 max-w-3xl">
							"{t.quote}"
						</blockquote>
						<div className="font-mono text-xs tracking-wider text-muted-foreground">
							<span className="text-foreground font-bold">{t.author.toUpperCase()}</span> · {t.role.toUpperCase()} — {t.company.toUpperCase()}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// ─── trust strip ─────────────────────────────────────────────────────────────

function TrustStrip() {
	const { ref, inView } = useInView();
	const items = [
		{ icon: Zap, title: "SETUP IN 5 MIN", desc: "No IT team required" },
		{ icon: Shield, title: "SOC 2 & GDPR", desc: "Enterprise-grade security" },
		{ icon: Globe, title: "99.9% UPTIME SLA", desc: "Reliable at any scale" },
		{ icon: UserCheck, title: "1 OR 1,000 SEATS", desc: "Freelancer to global org" },
	];
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
				{items.map(({ icon: Icon, title, desc }, i) => (
					<div
						key={title}
						className={`flex flex-col gap-2 px-6 md:px-8 py-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
						style={{ transitionDelay: `${i * 80}ms` }}>
						<Icon className="size-4 text-accent mb-1" />
						<p className="font-mono text-[11px] tracking-[0.15em] font-bold">{title}</p>
						<p className="text-xs text-muted-foreground">{desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

// ─── final CTA ───────────────────────────────────────────────────────────────

function FinalCta() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white overflow-hidden" style={{ background: "var(--pulse-ink-deep)" }}>
			{/* giant background EKG */}
			<div className="absolute inset-0 flex items-center opacity-30 pointer-events-none" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-40" strokeWidth={0.8} />
			</div>

			<div className={`relative px-6 md:px-12 py-24 md:py-32 text-center transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
				<MonoTag className="block mb-8 text-white/50">05 — DEPLOY · NO CREDIT CARD · 14-DAY TRIAL</MonoTag>
				<h2 className="text-5xl md:text-7xl font-black tracking-tighter text-balance mb-6 max-w-4xl mx-auto">
					Put support on <span style={{ color: "var(--pulse-lime)" }}>autopilot.</span>
				</h2>
				<p className="text-white/55 text-lg md:text-xl mb-12 max-w-xl mx-auto">
					Works for freelancers, agencies, and growing teams. Live in five minutes.
				</p>
				<div className="flex flex-col sm:flex-row justify-center gap-4">
					<CtaLink href="/auth/signup" variant="lime">
						Start free trial <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
					</CtaLink>
					<a
						href="/pricing"
						className="inline-flex items-center justify-center gap-2 border border-white/25 px-7 py-4 font-mono text-xs tracking-[0.15em] uppercase font-semibold text-white hover:border-(--pulse-lime) hover:text-(--pulse-lime) transition-colors duration-200">
						View pricing
					</a>
				</div>
			</div>
		</section>
	);
}

// ─── feature visuals ─────────────────────────────────────────────────────────

function AIAgentVisual() {
	const [step, setStep] = useState(0);
	const steps = [
		{ label: "Ticket received", detail: '"Invoice not received after payment"' },
		{ label: "AI classifying…", detail: "Category: Billing · Priority: High" },
		{ label: "Knowledge base search", detail: "Found 2 relevant articles in 0.3s" },
		{ label: "Response sent", detail: "Resolution delivered. CSAT request queued." },
	];
	useEffect(() => {
		const iv = setInterval(() => setStep((s) => (s + 1) % steps.length), 1800);
		return () => clearInterval(iv);
	}, []);
	return (
		<div className="space-y-2.5">
			<div className="flex items-center gap-2 mb-4">
				<Bot className="size-4 text-accent" />
				<p className="font-mono text-[11px] tracking-wider text-muted-foreground">AI_AGENT // AVG_RESOLVE 18S</p>
				<span className="ml-auto size-1.5 rounded-full bg-accent animate-pulse" />
			</div>
			{steps.map((s, i) => (
				<div
					key={i}
					className={`flex items-start gap-3 p-2.5 border transition-all duration-300 ${i === step ? "border-accent/50 bg-accent/5" : i < step ? "opacity-45 border-border" : "opacity-25 border-border"}`}>
					<div className={`mt-0.5 size-4 border flex items-center justify-center shrink-0 ${i < step ? "border-accent bg-accent/15" : i === step ? "border-accent" : "border-muted-foreground/30"}`}>
						{i < step && <CheckCircle2 className="size-3 text-accent" />}
						{i === step && <span className="size-1.5 bg-accent animate-pulse block" />}
					</div>
					<div>
						<p className={`text-xs font-semibold ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
						<p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
					</div>
				</div>
			))}
		</div>
	);
}

function WidgetVisual() {
	return (
		<div className="relative h-64 w-full border border-dashed border-primary/25 flex items-center justify-center overflow-hidden bg-background">
			<div className="absolute top-4 left-4 right-4 flex items-center gap-2 py-2 px-3 border border-border bg-card">
				<Globe className="size-3 text-muted-foreground" />
				<div className="h-1.5 w-24 bg-muted rounded-full" />
				<span className="ml-auto font-mono text-[9px] text-muted-foreground/60">WIDGET.EMBED</span>
			</div>
			<div className="absolute bottom-6 right-6 size-12 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center animate-bounce" style={{ animationDuration: "3s" }}>
				<MessageSquare className="size-5 text-white" />
			</div>
			<div className="absolute bottom-20 right-6 w-40 p-3 border border-border bg-card shadow-xl animate-in fade-in slide-in-from-bottom-4">
				<div className="flex items-center gap-2 mb-2">
					<div className="size-4 rounded-full bg-accent/25" />
					<div className="h-2 w-16 bg-muted rounded-full" />
				</div>
				<div className="space-y-1.5">
					<div className="h-1.5 w-full bg-muted rounded-full" />
					<div className="h-1.5 w-4/5 bg-muted rounded-full" />
				</div>
			</div>
		</div>
	);
}

function MarketplaceVisual() {
	return (
		<div className="grid grid-cols-3 gap-px bg-border border border-border">
			{[1, 2, 3, 4, 5, 6].map((i) => (
				<div key={i} className="aspect-square bg-card p-3 flex flex-col items-center justify-center gap-2 hover:bg-accent/5 transition-colors">
					<div
						className="size-8 flex items-center justify-center"
						style={{ background: `color-mix(in srgb, var(--color-accent) ${i * 5 + 5}%, transparent)` }}>
						<Puzzle className="size-4 text-primary" />
					</div>
					<div className="h-1.5 w-10 bg-muted rounded-full" />
				</div>
			))}
		</div>
	);
}

function TeamsVisual() {
	const agents = [
		{ name: "Lena M.", tickets: 12, status: "online" },
		{ name: "Carlos R.", tickets: 9, status: "online" },
		{ name: "Priya S.", tickets: 7, status: "busy" },
		{ name: "AI Agent", tickets: 41, status: "online" },
	];
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between mb-3">
				<p className="font-mono text-[11px] tracking-wider text-muted-foreground">QUEUE_OVERVIEW</p>
				<span className="font-mono text-[10px] text-accent">4 ACTIVE</span>
			</div>
			{agents.map((a) => (
				<div key={a.name} className="flex items-center gap-3 p-2.5 border border-border bg-card hover:bg-muted/30 transition-colors">
					<div className="relative size-8 bg-primary/12 flex items-center justify-center text-xs font-bold text-primary shrink-0">
						{a.name[0]}
						<span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card ${a.status === "online" ? "bg-accent" : "bg-amber-400"}`} />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium">{a.name}</p>
						<p className="font-mono text-[10px] text-muted-foreground">{a.tickets} TICKETS</p>
					</div>
					<div className="h-1 w-20 bg-muted overflow-hidden">
						<div className="h-full bg-accent" style={{ width: `${Math.min(100, (a.tickets / 50) * 100)}%` }} />
					</div>
				</div>
			))}
		</div>
	);
}
