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
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";
import { SIGN_UP_HREF } from "@/features/auth";

// Filter tabs are matched by these stable ids, never by their labels — so
// translating a tab can't break the filter.
type TabId = keyof Dictionary["features"]["tabs"];

const TABS: readonly TabId[] = ["all", "omnichannel", "aiAutomation", "marketplace", "intelligence", "security"];

/**
 * Module structure. `stat` values are numeric so they can be formatted per
 * locale (99.99% in English, 99,99% in Spanish).
 */
const MODULES = [
	{ key: "resolution", icon: Bot, stat: { value: 80, suffix: "%" }, tabs: ["all", "omnichannel", "aiAutomation"] },
	{ key: "routing", icon: Zap, stat: { value: 30, prefix: "< ", suffix: "s" }, tabs: ["all", "aiAutomation", "intelligence"] },
	{ key: "omnichannel", icon: MessageSquare, stat: { value: 10, suffix: "+" }, tabs: ["all", "omnichannel"] },
	{ key: "marketplace", icon: Sparkles, stat: { value: 50, suffix: "+" }, tabs: ["all", "marketplace"] },
	{ key: "intelligence", icon: BarChart3, stat: { value: 4.9, suffix: "★", decimals: 1 }, tabs: ["all", "intelligence"] },
	{ key: "security", icon: Shield, stat: { value: 99.99, suffix: "%", decimals: 2 }, tabs: ["all", "security"] },
] as const;

const SOCIAL_PROOF = [
	{ key: "torres", author: "Mia Torres" },
	{ key: "bright", author: "James Okafor" },
	{ key: "finstream", author: "Marcus Chen" },
] as const;

export default function FeaturesPage() {
	const { dict, locale, t, num } = useI18n();
	useLocalizedSeo({ ...dict.meta.features, path: "/features", locale });

	const hero = dict.features.hero;
	const [activeTab, setActiveTab] = useState<TabId>("all");
	const visible = useMountVisible();

	const { ref: statsRef, inView: statsInView } = useInView();
	const c80 = useCounter(80, 1100, statsInView);
	const c30 = useCounter(30, 1200, statsInView);
	const c999 = useCounter(999, 1300, statsInView);

	const filtered = MODULES.filter((m) => (m.tabs as readonly string[]).includes(activeTab));

	const decimal = (value: number, decimals: number) =>
		num(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

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
								{hero.eyebrow}
								<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							{hero.headline.lead}{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								{hero.headline.highlight}
							</span>{" "}
							{hero.headline.trail}
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">{hero.subhead}</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href={SIGN_UP_HREF}>
								{hero.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="/pricing" variant="outline">
								{hero.ctaSecondary}
							</CtaLink>
						</div>
					</div>

					{/* stats — hairline telemetry row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${num(c80)}%`, label: dict.features.stats.autoResolved },
								{ value: `<${num(c30)}s`, label: dict.features.stats.routingLatency },
								{ value: `${decimal(c999 / 10, 2)}%`, label: dict.features.stats.uptimeSla },
								{ value: `${decimal(4.9, 1)}★`, label: dict.features.stats.businessImpact },
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
					<SectionRule
						index="01"
						label={dict.features.index.sectionLabel}
						title={dict.features.index.sectionTitle}
						right={t(dict.features.index.sectionRight, { count: num(MODULES.length) })}
					/>
					<p className="px-6 md:px-12 pb-8 text-lg text-muted-foreground max-w-2xl">{dict.features.index.intro}</p>

					{/* mono filter tabs */}
					<div className="flex flex-wrap gap-2 px-6 md:px-12 pb-10">
						{TABS.map((tab) => {
							const isActive = activeTab === tab;
							return (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									aria-pressed={isActive}
									className={`px-4 py-2 border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
										isActive
											? "bg-primary text-primary-foreground border-primary"
											: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
									}`}>
									{dict.features.tabs[tab]}
								</button>
							);
						})}
					</div>

					<div className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div key={activeTab} className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border animate-in fade-in duration-300">
							{filtered.map(({ key, icon: Icon, stat }, i) => {
								const copy = dict.features.modules[key];
								const decimals = "decimals" in stat ? stat.decimals : 0;
								const prefix = "prefix" in stat ? stat.prefix : "";
								return (
									<div key={key} className="group relative bg-background px-6 md:px-10 py-10 flex flex-col">
										<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />

										<div className="flex items-center justify-between mb-8">
											<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">0{i + 1}</span>
											<Icon className="size-5 text-accent" />
										</div>

										<div className="mb-6">
											<div className="text-3xl font-black tracking-tighter text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
												{prefix}
												{decimal(stat.value, decimals)}
												{stat.suffix}
											</div>
											<div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mt-1">{copy.statLabel}</div>
										</div>

										<h3 className="text-xl font-black tracking-tight mb-2.5">{copy.title}</h3>
										<p className="text-sm text-muted-foreground leading-relaxed mb-6">{copy.description}</p>

										<ul className="space-y-2.5 mt-auto">
											{copy.bullets.map((b) => (
												<li key={b} className="flex items-center gap-3 text-sm text-muted-foreground">
													<CheckCircle2 className="size-3.5 text-accent shrink-0" />
													{b}
												</li>
											))}
										</ul>
									</div>
								);
							})}
						</div>
					</div>
				</section>

				{/* ── FIELD REPORTS ── */}
				<FieldReports />

				{/* ── CTA ── */}
				<DarkCta
					tag={dict.features.finalCta.tag}
					headline={
						<>
							{dict.features.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.features.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.features.finalCta.desc}
					primary={{ href: SIGN_UP_HREF, label: dict.features.finalCta.primary }}
					secondary={{ href: "/contact", label: dict.features.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

function FieldReports() {
	const { dict } = useI18n();
	const section = dict.features.fieldReports;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-y border-border">
				<MonoTag className="text-primary">{section.sectionLabel}</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					{section.sectionRight}
				</span>
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
				{SOCIAL_PROOF.map(({ key, author }, i) => {
					const copy = section.items[key];
					return (
						<div
							key={key}
							className={`flex flex-col px-6 md:px-10 py-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ transitionDelay: `${i * 120}ms` }}>
							<span className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold mb-6">
								{section.logPrefix}
								{i + 1}
							</span>
							<p className="text-base font-medium leading-relaxed flex-1 mb-8">"{copy.quote}"</p>
							<div className="font-mono text-[11px] tracking-wider text-muted-foreground border-t border-border pt-4">
								<span className="text-foreground font-bold">{author.toUpperCase()}</span>
								<span className="block mt-1">{copy.role.toUpperCase()}</span>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
