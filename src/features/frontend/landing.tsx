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
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

// ─── types ───────────────────────────────────────────────────────────────────

type Priority = "high" | "medium" | "low";
type TicketKey = keyof Dictionary["landing"]["console"]["tickets"];

interface LiveTicket {
	id: string;
	/** Dictionary key for the ticket subject. */
	key: TicketKey;
	priority: Priority;
	status: "open" | "ai-resolving" | "resolved";
	time: string;
	agent: "ai" | "unassigned";
}

// ─── structure ───────────────────────────────────────────────────────────────
// Icons, ids, ordering and hrefs stay in code; all copy is looked up by key.

const PERSONAS = [
	{ key: "supportTeams", icon: Users, href: "/solutions/support-teams" },
	{ key: "agencies", icon: Building2, href: "/solutions/agencies" },
	{ key: "solo", icon: UserCheck, href: "/solutions/solo-small-teams" },
] as const;

const FEATURES = [
	{ key: "unification", icon: Layers, index: "01" },
	{ key: "automation", icon: Bot, index: "02" },
	{ key: "marketplace", icon: Puzzle, index: "03" },
	{ key: "platform", icon: Users, index: "04" },
] as const;

/** Author and company are proper nouns — never translated. */
const TESTIMONIALS = [
	{ key: "contoso", author: "Sarah Chen", company: "Contoso Ltd." },
	{ key: "bright", author: "James Okafor", company: "BrightSupport Agency" },
	{ key: "torres", author: "Mia Torres", company: "Torres Digital" },
] as const;

const INITIAL_TICKETS: LiveTicket[] = [
	{ id: "#4821", key: "invoice", priority: "high", status: "ai-resolving", time: "0s", agent: "ai" },
	{ id: "#4820", key: "onboarding", priority: "medium", status: "resolved", time: "42s", agent: "ai" },
	{ id: "#4819", key: "darkMode", priority: "low", status: "resolved", time: "1m", agent: "ai" },
	{ id: "#4818", key: "dashboard", priority: "high", status: "open", time: "2m", agent: "unassigned" },
];

const NEW_TICKETS: LiveTicket[] = [
	{ id: "#4825", key: "refund", priority: "medium", status: "ai-resolving", time: "", agent: "ai" },
	{ id: "#4824", key: "passwordReset", priority: "low", status: "ai-resolving", time: "", agent: "ai" },
	{ id: "#4823", key: "siteDown", priority: "high", status: "open", time: "", agent: "unassigned" },
];

const PRIORITY_ON_DARK: Record<Priority, string> = {
	high: "text-red-400",
	medium: "text-amber-300",
	low: "text-(--pulse-lime)",
};

// ─── page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
	const { dict, locale } = useI18n();
	useLocalizedSeo({ ...dict.meta.home, path: "/", locale });

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
	const { dict, path } = useI18n();
	const t = dict.landing.hero;
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
							{t.eyebrow}
							<span className="blink-cursor text-accent">_</span>
						</MonoTag>
					</div>

					<h1 className="text-[13vw] sm:text-6xl md:text-7xl xl:text-[5.2rem] font-black leading-[0.98] tracking-tighter mb-10">
						{/* The trailing space is invisible next to the <br>, but keeps the
						    heading's text content readable for crawlers and screen readers. */}
						{t.headline.lead}{" "}
						<br />
						<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
							{t.headline.highlight}
						</span>{" "}
						{t.headline.trail}
					</h1>

					{/* persona index — numbered editorial list */}
					<div className="border-t border-border mb-10">
						{PERSONAS.map(({ key, href }, i) => {
							const persona = dict.landing.personas[key];
							const isActive = activePersona === i;
							return (
								<button
									key={key}
									onClick={() => setActivePersona(i)}
									className={`w-full text-left border-b border-border transition-colors duration-200 ${isActive ? "" : "hover:bg-muted/50"}`}
									style={isActive ? { background: "color-mix(in srgb, var(--color-accent) 7%, transparent)" } : undefined}>
									<div className="flex items-baseline gap-4 px-1 py-3.5">
										<span className={`font-mono text-xs ${isActive ? "text-accent font-bold" : "text-muted-foreground/60"}`}>
											{String(i + 1).padStart(2, "0")}
										</span>
										<span className={`text-base md:text-lg font-bold tracking-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
											{persona.label}
										</span>
										{isActive && <ArrowUpRight className="size-4 text-accent ml-auto shrink-0 self-center" />}
									</div>
									{isActive && (
										<div className="px-1 pb-4 pl-11 animate-in fade-in slide-in-from-top-1 duration-300">
											<p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-2">{persona.desc}</p>
											<a
												href={path(href)}
												onClick={(e) => e.stopPropagation()}
												className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.15em] uppercase text-primary hover:text-accent transition-colors">
												{t.seeHow} <ArrowRight className="size-3" />
											</a>
										</div>
									)}
								</button>
							);
						})}
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<CtaLink href="/auth/signup">
							{t.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
						</CtaLink>
						<CtaLink href="/pricing" variant="outline">
							{t.ctaSecondary}
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
	const { dict } = useI18n();
	const c = dict.landing.console;
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
					{c.feed}
					<span className="blink-cursor text-(--pulse-lime)">▌</span>
				</span>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-(--pulse-lime)">
					<span className="size-1.5 rounded-full animate-pulse" style={{ background: "var(--pulse-lime)" }} />
					{c.rec}
				</span>
			</div>

			{/* mini EKG trace */}
			<div className="border-b border-white/10 px-5 py-3" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-8 block" strokeWidth={1.2} />
			</div>

			{/* ticket rows */}
			<div className="flex-1 divide-y divide-white/8">
				{tickets.map((ticket, i) => (
					<div
						key={ticket.id + i}
						className={`px-5 py-4 ${i === 0 ? "animate-in fade-in slide-in-from-top-2 duration-500 bg-white/4" : ""}`}>
						<div className="flex items-center gap-3 font-mono text-[11px] mb-1.5">
							<span className="text-(--pulse-lime)">{ticket.id}</span>
							<span className={`uppercase tracking-wider ${PRIORITY_ON_DARK[ticket.priority]}`}>
								[{c.priority[ticket.priority]}]
							</span>
							<span className="ml-auto text-white/35">{ticket.time || c.time.now}</span>
						</div>
						<div className="flex items-center gap-3">
							<Ticket className="size-3.5 shrink-0 text-white/30" />
							<span className="flex-1 truncate text-sm text-white/85">{c.tickets[ticket.key]}</span>
							<span className="font-mono text-[10px] tracking-wider shrink-0 uppercase" style={{ color: ticket.status === "open" ? "rgba(255,255,255,0.4)" : "var(--pulse-lime)" }}>
								{ticket.status === "ai-resolving" ? c.statusResolving : ticket.status === "resolved" ? c.statusResolved : c.statusOpen}
							</span>
						</div>
					</div>
				))}
			</div>

			{/* console footer telemetry */}
			<div className="px-5 py-3.5 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] tracking-widest text-white/45">
				<span>{c.latency}</span>
				<span style={{ color: "var(--pulse-lime)" }}>{c.aiResolved}</span>
				<span>{c.uptime}</span>
			</div>
		</div>
	);
}

// ─── ticker ──────────────────────────────────────────────────────────────────

function Ticker() {
	const { dict } = useI18n();
	const items = dict.landing.ticker;
	return (
		<div className="relative overflow-hidden border-b border-border py-3.5 bg-muted/30">
			<div className="flex gap-12 animate-ticker whitespace-nowrap">
				{[...items, ...items].map((item, i) => (
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
	const { dict, num } = useI18n();
	const s = dict.landing.stats;
	const { ref, inView } = useInView();
	const c80 = useCounter(80, 1200, inView);
	const c50 = useCounter(50, 1400, inView);
	const c95 = useCounter(95, 1300, inView);

	const stats = [
		{ display: `${num(c80)}%`, ...s.fasterResolution },
		{ display: `${num(c50)}K+`, ...s.ticketsPerMonth },
		{ display: `${num(c95)}%`, ...s.satisfaction },
		{ display: "1→∞", ...s.scale },
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
	const { dict } = useI18n();
	const b = dict.landing.bento;
	const { ref, inView } = useInView();

	return (
		<section id="features" ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="02" label={b.sectionLabel} title={b.sectionTitle} right={b.sectionRight} />
			<p className="px-6 md:px-12 pb-10 text-lg text-muted-foreground max-w-2xl">{b.intro}</p>

			<div className="relative border-t border-border">
				<Cross className="-top-2 left-1/2 -translate-x-1/2 hidden md:block" />
				<div className="grid md:grid-cols-2 gap-px bg-border border-b border-border">
					{FEATURES.map(({ key, icon: Icon, index }, i) => {
						const f = b[key];
						return (
							<div
								key={key}
								className={`group relative bg-background px-6 md:px-12 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ transitionDelay: `${i * 120}ms` }}>
								{/* lime scan-line grows on hover */}
								<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: "var(--color-accent)" }} />

								<div className="flex items-center justify-between mb-8">
									<MonoTag className="text-primary">
										{index} / {f.label}
									</MonoTag>
									<Icon className="size-5 text-accent" />
								</div>

								<h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-balance">{f.title}</h3>
								<p className="text-muted-foreground leading-relaxed mb-6">{f.description}</p>

								<ul className="space-y-2.5 mb-8">
									{f.bullets.map((bullet) => (
										<li key={bullet} className="flex items-center gap-3 text-sm text-muted-foreground">
											<CheckCircle2 className="size-3.5 text-accent shrink-0" />
											{bullet}
										</li>
									))}
								</ul>

								<div className="border border-border p-5 bg-muted/20">
									{key === "unification" && <WidgetVisual />}
									{key === "automation" && <AIAgentVisual />}
									{key === "marketplace" && <MarketplaceVisual />}
									{key === "platform" && <TeamsVisual />}
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

const PROCESS_STEPS = [
	{ key: "connect", step: "01", icon: Layers },
	{ key: "sort", step: "02", icon: Bot },
	{ key: "resolve", step: "03", icon: Sparkles },
] as const;

function HowItWorks() {
	const { dict } = useI18n();
	const p = dict.landing.process;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white border-b border-border" style={{ background: "var(--pulse-ink)" }}>
			{/* header */}
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
				<span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: "var(--pulse-lime)" }}>
					{p.sectionLabel}
				</span>
				<span className="hidden sm:block font-mono text-[11px] tracking-[0.25em] text-white/40">{p.sectionRight}</span>
			</div>

			<div className={`px-6 md:px-12 pt-14 pb-4 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance max-w-3xl mb-3">
					{p.headline.lead} <span style={{ color: "var(--pulse-lime)" }}>{p.headline.highlight}</span>
				</h2>
				<p className="text-white/50 text-lg">{p.subhead}</p>
			</div>

			{/* EKG connecting the steps */}
			<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10">
				{PROCESS_STEPS.map(({ key, step, icon: Icon }, i) => (
					<div
						key={step}
						className={`px-6 md:px-12 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 150 + 150}ms` }}>
						<div className="flex items-center justify-between mb-8">
							<span className="font-mono text-5xl font-black text-white/15">/{step}</span>
							<Icon className="size-5" style={{ color: "var(--pulse-lime)" }} />
						</div>
						<h3 className="text-xl font-bold mb-3">{p.steps[key].title}</h3>
						<p className="text-sm text-white/50 leading-relaxed">{p.steps[key].desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

// ─── testimonials ────────────────────────────────────────────────────────────

function Testimonials() {
	const { dict } = useI18n();
	const section = dict.landing.testimonials;
	const { ref, inView } = useInView();
	const [active, setActive] = useState(0);

	useEffect(() => {
		const iv = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5500);
		return () => clearInterval(iv);
	}, []);

	const current = TESTIMONIALS[active];
	const copy = section.items[current.key];

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{section.sectionLabel}</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					{section.incoming}
				</span>
			</div>

			<div className={`grid lg:grid-cols-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				{/* index rail */}
				<div className="lg:col-span-3 lg:border-r border-b lg:border-b-0 border-border flex lg:flex-col">
					{TESTIMONIALS.map((item, i) => (
						<button
							key={item.key}
							onClick={() => setActive(i)}
							className={`flex-1 lg:flex-none text-left px-6 md:px-8 py-5 border-r lg:border-r-0 lg:border-b border-border last:border-r-0 transition-colors duration-200 ${i === active ? "" : "hover:bg-muted/40"}`}
							style={i === active ? { background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" } : undefined}>
							<span className={`block font-mono text-[10px] tracking-[0.2em] mb-1 ${i === active ? "text-accent font-bold" : "text-muted-foreground/60"}`}>
								{section.logPrefix}
								{String(i + 1).padStart(2, "0")}
							</span>
							<span className={`hidden sm:block text-xs font-semibold tracking-wide ${i === active ? "text-foreground" : "text-muted-foreground"}`}>
								{section.items[item.key].segment}
							</span>
						</button>
					))}
				</div>

				{/* quote */}
				<div className="lg:col-span-9 px-6 md:px-12 py-12 md:py-16 relative min-h-72 flex flex-col justify-center" key={active}>
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
						<MessageSquare className="size-6 text-accent mb-6" />
						<blockquote className="text-2xl md:text-[2rem] font-bold tracking-tight leading-snug text-balance mb-8 max-w-3xl">
							"{copy.quote}"
						</blockquote>
						<div className="font-mono text-xs tracking-wider text-muted-foreground">
							<span className="text-foreground font-bold">{current.author.toUpperCase()}</span> · {copy.role.toUpperCase()} —{" "}
							{current.company.toUpperCase()}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// ─── trust strip ─────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
	{ key: "setup", icon: Zap },
	{ key: "compliance", icon: Shield },
	{ key: "uptime", icon: Globe },
	{ key: "seats", icon: UserCheck },
] as const;

function TrustStrip() {
	const { dict } = useI18n();
	const trust = dict.landing.trust;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
				{TRUST_ITEMS.map(({ key, icon: Icon }, i) => (
					<div
						key={key}
						className={`flex flex-col gap-2 px-6 md:px-8 py-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
						style={{ transitionDelay: `${i * 80}ms` }}>
						<Icon className="size-4 text-accent mb-1" />
						<p className="font-mono text-[11px] tracking-[0.15em] font-bold">{trust[key].title}</p>
						<p className="text-xs text-muted-foreground">{trust[key].desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

// ─── final CTA ───────────────────────────────────────────────────────────────

function FinalCta() {
	const { dict, path } = useI18n();
	const cta = dict.landing.finalCta;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white overflow-hidden" style={{ background: "var(--pulse-ink-deep)" }}>
			{/* giant background EKG */}
			<div className="absolute inset-0 flex items-center opacity-30 pointer-events-none" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-40" strokeWidth={0.8} />
			</div>

			<div className={`relative px-6 md:px-12 py-24 md:py-32 text-center transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
				<MonoTag className="block mb-8 text-white/50">{cta.eyebrow}</MonoTag>
				<h2 className="text-5xl md:text-7xl font-black tracking-tighter text-balance mb-6 max-w-4xl mx-auto">
					{cta.headline.lead} <span style={{ color: "var(--pulse-lime)" }}>{cta.headline.highlight}</span>
				</h2>
				<p className="text-white/55 text-lg md:text-xl mb-12 max-w-xl mx-auto">{cta.subhead}</p>
				<div className="flex flex-col sm:flex-row justify-center gap-4">
					<CtaLink href="/auth/signup" variant="lime">
						{cta.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
					</CtaLink>
					<a
						href={path("/pricing")}
						className="inline-flex items-center justify-center gap-2 border border-white/25 px-7 py-4 font-mono text-xs tracking-[0.15em] uppercase font-semibold text-white hover:border-(--pulse-lime) hover:text-(--pulse-lime) transition-colors duration-200">
						{cta.ctaSecondary}
					</a>
				</div>
			</div>
		</section>
	);
}

// ─── feature visuals ─────────────────────────────────────────────────────────

const AI_STEPS = ["received", "classifying", "knowledge", "sent"] as const;

function AIAgentVisual() {
	const { dict } = useI18n();
	const visual = dict.landing.visuals.aiAgent;
	const [step, setStep] = useState(0);

	useEffect(() => {
		const iv = setInterval(() => setStep((s) => (s + 1) % AI_STEPS.length), 1800);
		return () => clearInterval(iv);
	}, []);

	return (
		<div className="space-y-2.5">
			<div className="flex items-center gap-2 mb-4">
				<Bot className="size-4 text-accent" />
				<p className="font-mono text-[11px] tracking-wider text-muted-foreground">{visual.header}</p>
				<span className="ml-auto size-1.5 rounded-full bg-accent animate-pulse" />
			</div>
			{AI_STEPS.map((key, i) => (
				<div
					key={key}
					className={`flex items-start gap-3 p-2.5 border transition-all duration-300 ${i === step ? "border-accent/50 bg-accent/5" : i < step ? "opacity-45 border-border" : "opacity-25 border-border"}`}>
					<div className={`mt-0.5 size-4 border flex items-center justify-center shrink-0 ${i < step ? "border-accent bg-accent/15" : i === step ? "border-accent" : "border-muted-foreground/30"}`}>
						{i < step && <CheckCircle2 className="size-3 text-accent" />}
						{i === step && <span className="size-1.5 bg-accent animate-pulse block" />}
					</div>
					<div>
						<p className={`text-xs font-semibold ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{visual.steps[key].label}</p>
						<p className="text-xs text-muted-foreground mt-0.5">{visual.steps[key].detail}</p>
					</div>
				</div>
			))}
		</div>
	);
}

function WidgetVisual() {
	const { dict } = useI18n();
	return (
		<div className="relative h-64 w-full border border-dashed border-primary/25 flex items-center justify-center overflow-hidden bg-background">
			<div className="absolute top-4 left-4 right-4 flex items-center gap-2 py-2 px-3 border border-border bg-card">
				<Globe className="size-3 text-muted-foreground" />
				<div className="h-1.5 w-24 bg-muted rounded-full" />
				<span className="ml-auto font-mono text-[9px] text-muted-foreground/60">{dict.landing.visuals.widget.embed}</span>
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
	const { dict, num } = useI18n();
	const visual = dict.landing.visuals.teams;

	// Agent names are proper nouns; the AI row is a product label, so it's localized.
	const agents = [
		{ name: "Lena M.", tickets: 12, status: "online" },
		{ name: "Carlos R.", tickets: 9, status: "online" },
		{ name: "Priya S.", tickets: 7, status: "busy" },
		{ name: visual.agentAi, tickets: 41, status: "online" },
	];

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between mb-3">
				<p className="font-mono text-[11px] tracking-wider text-muted-foreground">{visual.header}</p>
				<span className="font-mono text-[10px] text-accent">{visual.active}</span>
			</div>
			{agents.map((a) => (
				<div key={a.name} className="flex items-center gap-3 p-2.5 border border-border bg-card hover:bg-muted/30 transition-colors">
					<div className="relative size-8 bg-primary/12 flex items-center justify-center text-xs font-bold text-primary shrink-0">
						{a.name[0]}
						<span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card ${a.status === "online" ? "bg-accent" : "bg-amber-400"}`} />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium">{a.name}</p>
						<p className="font-mono text-[10px] text-muted-foreground">
							{num(a.tickets)} {visual.ticketsLabel}
						</p>
					</div>
					<div className="h-1 w-20 bg-muted overflow-hidden">
						<div className="h-full bg-accent" style={{ width: `${Math.min(100, (a.tickets / 50) * 100)}%` }} />
					</div>
				</div>
			))}
		</div>
	);
}
