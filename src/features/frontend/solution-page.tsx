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
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";
import { SIGN_UP_HREF } from "@/features/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Segment configuration
//
// Structure only: icons, ordering, proper nouns, route path and meta key. All
// copy is looked up from `dict.solutions[segment]` by these same keys, so a
// translation can never reorder a section or repoint a link.
// ─────────────────────────────────────────────────────────────────────────────

type Segment = "supportTeams" | "agencies" | "solo";

type StatKey = keyof Dictionary["solutions"]["supportTeams"]["stats"];
type FeatureKey = keyof Dictionary["solutions"]["supportTeams"]["features"];
type StepKey = keyof Dictionary["solutions"]["supportTeams"]["steps"];

interface SegmentConfig {
	badgeIcon: React.ElementType;
	stats: { key: StatKey; icon: React.ElementType }[];
	features: { key: FeatureKey; icon: React.ElementType }[];
	steps: { key: StepKey; icon: React.ElementType }[];
	author: string;
	company: string;
	path: string;
	metaKey: keyof Dictionary["meta"];
}

const SEGMENTS: Record<Segment, SegmentConfig> = {
	supportTeams: {
		badgeIcon: Users,
		stats: [
			{ key: "resolution", icon: Clock },
			{ key: "volume", icon: Layers },
			{ key: "satisfaction", icon: Star },
		],
		features: [
			{ key: "triage", icon: Bot },
			{ key: "team", icon: Users },
			{ key: "sla", icon: Clock },
			{ key: "analytics", icon: BarChart3 },
		],
		steps: [
			{ key: "connect", icon: Layers },
			{ key: "rules", icon: Zap },
			{ key: "ai", icon: Bot },
		],
		author: "Sarah Chen",
		company: "Contoso Ltd.",
		path: "/solutions/support-teams",
		metaKey: "solutionSupportTeams",
	},
	agencies: {
		badgeIcon: Building2,
		stats: [
			{ key: "resolution", icon: Building2 },
			{ key: "volume", icon: TrendingUp },
			{ key: "satisfaction", icon: Shield },
		],
		features: [
			{ key: "triage", icon: Building2 },
			{ key: "team", icon: Globe },
			{ key: "sla", icon: BarChart3 },
			{ key: "analytics", icon: Lock },
		],
		steps: [
			{ key: "connect", icon: Building2 },
			{ key: "rules", icon: Inbox },
			{ key: "ai", icon: BarChart3 },
		],
		author: "James Okafor",
		company: "BrightSupport Agency",
		path: "/solutions/agencies",
		metaKey: "solutionAgencies",
	},
	solo: {
		badgeIcon: UserCheck,
		stats: [
			{ key: "resolution", icon: Zap },
			{ key: "volume", icon: Inbox },
			{ key: "satisfaction", icon: Users },
		],
		features: [
			{ key: "triage", icon: Inbox },
			{ key: "team", icon: Zap },
			{ key: "sla", icon: MessageSquare },
			{ key: "analytics", icon: Users },
		],
		steps: [
			{ key: "connect", icon: Zap },
			{ key: "rules", icon: Layers },
			{ key: "ai", icon: Bot },
		],
		author: "Mia Torres",
		company: "Torres Digital",
		path: "/solutions/solo-small-teams",
		metaKey: "solutionSolo",
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared page component
// ─────────────────────────────────────────────────────────────────────────────

export function SolutionPage({ segment }: { segment: Segment }) {
	const { dict, locale, path } = useI18n();
	const config = SEGMENTS[segment];
	const copy = dict.solutions[segment];
	const chrome = dict.solutions.chrome;

	useLocalizedSeo({ ...dict.meta[config.metaKey], path: config.path, locale });

	const visible = useMountVisible();
	const { ref: featuresRef, inView: featuresInView } = useInView();
	const { ref: stepsRef, inView: stepsInView } = useInView();
	const { ref: testimonialRef, inView: testimonialInView } = useInView();
	const { ref: ctaRef, inView: ctaInView } = useInView();

	const BadgeIcon = config.badgeIcon;

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
								{copy.code}
								<span className="blink-cursor text-accent">_</span>
							</MonoTag>
							<span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground border-l border-border pl-3">
								<BadgeIcon className="size-3 text-accent" />
								{copy.badge}
							</span>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							{copy.headline.lead}{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								{copy.headline.highlight}
							</span>
							{copy.headline.trail && <> {copy.headline.trail}</>}
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">{copy.description}</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href={SIGN_UP_HREF}>
								{chrome.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="/pricing" variant="outline">
								{chrome.ctaSecondary}
							</CtaLink>
						</div>
					</div>

					{/* stats — hairline telemetry row */}
					<div className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-3 divide-x divide-border">
							{config.stats.map(({ key }, i) => (
								<div
									key={key}
									className={`px-4 md:px-10 py-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
									style={{ transitionDelay: `${i * 100 + 300}ms` }}>
									<div className="text-3xl md:text-5xl font-black tracking-tighter mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>
										{copy.stats[key].value}
									</div>
									<div className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary font-semibold">
										{copy.stats[key].label}
									</div>
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
					<SectionRule
						index="01"
						label={chrome.capabilitiesLabel}
						title={copy.featuresHeadline}
						right={chrome.capabilitiesRight}
					/>
					<div className="h-10" />

					<div className="relative border-t border-border">
						<Cross className="-top-2 left-1/2 -translate-x-1/2 hidden sm:block" />
						<div className="grid sm:grid-cols-2 gap-px bg-border border-b border-border">
							{config.features.map(({ key, icon: Icon }, i) => (
								<div
									key={key}
									className={`group relative bg-background px-6 md:px-12 py-10 transition-all duration-700 ${featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
									style={{ transitionDelay: `${i * 100 + 100}ms` }}>
									{/* lime scan-line grows on hover */}
									<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />

									<div className="flex items-center justify-between mb-6">
										<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">0{i + 1}</span>
										<Icon className="size-5 text-accent" />
									</div>
									<h3 className="text-xl md:text-2xl font-black tracking-tight mb-2.5">{copy.features[key].title}</h3>
									<p className="text-sm md:text-base text-muted-foreground leading-relaxed">{copy.features[key].desc}</p>
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
							{chrome.processLabel}
						</span>
						<span className="hidden sm:block font-mono text-[11px] tracking-[0.25em] text-white/40">{chrome.processRight}</span>
					</div>

					<div className={`px-6 md:px-12 pt-14 pb-4 transition-all duration-700 ${stepsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance max-w-3xl">{copy.stepsHeadline}</h2>
					</div>

					{/* EKG connecting the steps */}
					<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
						<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
					</div>

					<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10">
						{config.steps.map(({ key, icon: Icon }, i) => (
							<div
								key={key}
								className={`px-6 md:px-12 py-12 transition-all duration-700 ${stepsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ transitionDelay: `${i * 150 + 150}ms` }}>
								<div className="flex items-center justify-between mb-8">
									<span className="font-mono text-5xl font-black text-white/15">/0{i + 1}</span>
									<Icon className="size-5" style={{ color: "var(--pulse-lime)" }} />
								</div>
								<h3 className="text-xl font-bold mb-3">{copy.steps[key].title}</h3>
								<p className="text-sm text-white/50 leading-relaxed">{copy.steps[key].desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* ── TESTIMONIAL ── */}
				<section ref={testimonialRef as React.RefObject<HTMLElement>} className="border-b border-border">
					<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
						<MonoTag className="text-primary">{chrome.transmissionLabel}</MonoTag>
						<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
							<span className="size-1.5 rounded-full bg-accent animate-pulse" />
							{chrome.verifiedCustomer}
						</span>
					</div>

					<div
						className={`px-6 md:px-12 py-14 md:py-20 transition-all duration-700 ${testimonialInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<MessageSquare className="size-6 text-accent mb-6" />
						<blockquote className="text-2xl md:text-[2rem] font-bold tracking-tight leading-snug text-balance mb-8 max-w-3xl">
							"{copy.testimonial.quote}"
						</blockquote>
						<div className="font-mono text-xs tracking-wider text-muted-foreground">
							<span className="text-foreground font-bold">{config.author.toUpperCase()}</span> ·{" "}
							{copy.testimonial.role.toUpperCase()} — {config.company.toUpperCase()}
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
						<MonoTag className="block mb-8 text-white/50">
							{chrome.deployLabel} · {copy.ctaBadge.toUpperCase()}
						</MonoTag>
						<h2 className="text-4xl md:text-6xl font-black tracking-tighter text-balance mb-6 max-w-4xl mx-auto">{copy.ctaHeadline}</h2>
						<p className="text-white/55 text-lg md:text-xl mb-12 max-w-xl mx-auto">{copy.ctaDesc}</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<CtaLink href={SIGN_UP_HREF} variant="lime">
								{chrome.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<a
								href={path("/pricing")}
								className="inline-flex items-center justify-center gap-2 border border-white/25 px-7 py-4 font-mono text-xs tracking-[0.15em] uppercase font-semibold text-white hover:border-(--pulse-lime) hover:text-(--pulse-lime) transition-colors duration-200">
								{chrome.ctaSecondary}
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
	return <SolutionPage segment="supportTeams" />;
}

export function AgenciesPage() {
	return <SolutionPage segment="agencies" />;
}

export function SoloSmallTeamsPage() {
	return <SolutionPage segment="solo" />;
}
