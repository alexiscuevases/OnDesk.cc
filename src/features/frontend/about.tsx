import { ArrowRight, Target, Users, Heart, MapPin, Linkedin, Twitter, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";
import { useI18n, useLocalizedSeo } from "@/i18n";

// ── Structure ──
// Icons, ordering, years, names and initials stay here; all copy is keyed.

const VALUE_KEYS = [
	{ key: "customer", icon: Target },
	{ key: "transparent", icon: Users },
	{ key: "lasting", icon: Heart },
] as const;

const TIMELINE_ENTRIES = [
	{ key: "founded", year: "2022" },
	{ key: "integrations", year: "2023" },
	{ key: "aiAgents", year: "2024" },
	{ key: "global", year: "2025" },
] as const;

const TEAM = [
	{ key: "elena", name: "Elena Torres", initials: "ET" },
	{ key: "daniel", name: "Daniel Park", initials: "DP" },
	{ key: "aisha", name: "Aisha Okafor", initials: "AO" },
	{ key: "ravi", name: "Ravi Menon", initials: "RM" },
	{ key: "sophie", name: "Sophie Laurent", initials: "SL" },
	{ key: "marcus", name: "Marcus Webb", initials: "MW" },
] as const;

const PRESS = [
	{ key: "techcrunch", source: "TechCrunch" },
	{ key: "verge", source: "The Verge" },
	{ key: "forbes", source: "Forbes" },
] as const;

const INVESTORS = ["Accel", "Sequoia", "Index Ventures", "Microsoft M12"];

// ── Page ──

export default function AboutPage() {
	const { dict, locale, num } = useI18n();
	useLocalizedSeo({ ...dict.meta.about, path: "/about", locale });

	const hero = dict.about.hero;
	const visible = useMountVisible();
	const { ref: statsRef, inView: statsInView } = useInView();
	const c2022 = useCounter(2022, 1200, statsInView);
	const c47 = useCounter(47, 900, statsInView);
	const c1200 = useCounter(1200, 1300, statsInView);
	const c40 = useCounter(40, 1000, statsInView);

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
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">{hero.subhead}</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/careers">
								{hero.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="/contact" variant="outline">
								{hero.ctaSecondary}
							</CtaLink>
						</div>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								// The founding year is a year, not a quantity — no digit grouping.
								{ value: String(c2022), label: hero.stats.founded },
								{ value: num(c47), label: hero.stats.team },
								{ value: `${num(c1200)}+`, label: hero.stats.customers },
								{ value: `${num(c40)}+`, label: hero.stats.countries },
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

				<MissionSection />
				<TimelineSection />
				<ValuesSection />
				<TeamSection />
				<PressSection />

				<DarkCta
					tag={dict.about.finalCta.tag}
					headline={
						<>
							{dict.about.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.about.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.about.finalCta.desc}
					primary={{ href: "/careers", label: dict.about.finalCta.primary }}
					secondary={{ href: "/contact", label: dict.about.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

// ── Sections ──

function MissionSection() {
	const { dict } = useI18n();
	const m = dict.about.mission;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{m.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{m.sectionRight}</MonoTag>
			</div>

			<div className="grid lg:grid-cols-12">
				<div
					className={`lg:col-span-7 px-6 md:px-12 py-12 lg:border-r border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<h2 className="text-3xl md:text-5xl font-black tracking-tight text-balance mb-6">{m.title}</h2>
					<p className="text-muted-foreground leading-relaxed mb-5">{m.body1}</p>
					<p className="text-muted-foreground leading-relaxed">{m.body2}</p>
				</div>

				<div
					className={`lg:col-span-5 px-6 md:px-12 py-12 transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<div className="border border-border">
						<div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
							<span className="font-mono text-[10px] tracking-[0.25em] text-primary">{m.commitmentsTitle}</span>
							<span className="size-1.5 rounded-full bg-accent animate-pulse" />
						</div>
						<div className="divide-y divide-border">
							{m.commitments.map((item) => (
								<div key={item} className="flex items-center gap-3 px-4 py-3.5 text-sm">
									<CheckCircle2 className="size-3.5 text-accent shrink-0" />
									<span className="text-foreground">{item}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function TimelineSection() {
	const { dict } = useI18n();
	const tl = dict.about.timeline;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="02" label={tl.sectionLabel} title={tl.sectionTitle} right={tl.sectionRight} />
			<div className="h-10" />

			<div className="border-t border-border">
				{TIMELINE_ENTRIES.map(({ key, year }, i) => (
					<div
						key={year}
						className={`grid md:grid-cols-12 border-b border-border transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
						style={{ transitionDelay: `${i * 120}ms` }}>
						<div className="md:col-span-3 px-6 md:px-12 pt-8 md:py-8 md:border-r border-border">
							<span className="text-3xl font-black tracking-tighter text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
								{year}
							</span>
						</div>
						<div className="md:col-span-9 px-6 md:px-12 py-8">
							<h3 className="font-bold text-lg mb-1.5">{tl.entries[key].title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{tl.entries[key].desc}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function ValuesSection() {
	const { dict } = useI18n();
	const v = dict.about.values;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{v.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{v.sectionRight}</MonoTag>
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border">
				{VALUE_KEYS.map(({ key, icon: Icon }, i) => (
					<div
						key={key}
						className={`group relative px-6 md:px-10 py-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 100}ms` }}>
						<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
						<div className="flex items-center justify-between mb-8">
							<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">0{i + 1}</span>
							<Icon className="size-5 text-accent" />
						</div>
						<h3 className="text-xl font-black tracking-tight mb-2.5">{v.items[key].title}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">{v.items[key].desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

function TeamSection() {
	const { dict, t, num } = useI18n();
	const team = dict.about.team;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule
				index="04"
				label={team.sectionLabel}
				title={team.sectionTitle}
				right={t(team.sectionRight, { count: num(TEAM.length) })}
			/>
			<p className="px-6 md:px-12 pb-10 text-lg text-muted-foreground max-w-2xl">{team.intro}</p>

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border">
					{TEAM.map(({ key, name, initials }, i) => {
						const member = team.members[key];
						return (
							<div
								key={key}
								className={`group relative bg-background px-6 md:px-8 py-8 flex flex-col transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ transitionDelay: `${i * 80}ms` }}>
								<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
								<div className="flex items-start gap-4 mb-5">
									<div className="size-12 shrink-0 flex items-center justify-center font-mono text-sm font-bold text-primary border border-primary/25 bg-primary/5">
										{initials}
									</div>
									<div className="min-w-0">
										<p className="font-bold">{name}</p>
										<p className="font-mono text-[10px] tracking-[0.15em] uppercase text-accent font-semibold mt-1">{member.role}</p>
									</div>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed flex-1">{member.bio}</p>
								<div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
									<span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
										<MapPin className="size-3 text-accent" />
										{member.location}
									</span>
									<div className="flex gap-3">
										<a href="#" aria-label={t(team.onLinkedin, { name })} className="text-muted-foreground hover:text-primary transition-colors">
											<Linkedin className="size-3.5" />
										</a>
										<a href="#" aria-label={t(team.onTwitter, { name })} className="text-muted-foreground hover:text-primary transition-colors">
											<Twitter className="size-3.5" />
										</a>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function PressSection() {
	const { dict } = useI18n();
	const press = dict.about.press;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{press.sectionLabel}</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					{press.sectionRight}
				</span>
			</div>

			<div className="grid lg:grid-cols-12">
				{/* press quotes */}
				<div className="lg:col-span-7 lg:border-r border-border divide-y divide-border">
					{PRESS.map(({ key, source }, i) => (
						<div
							key={source}
							className={`px-6 md:px-12 py-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
							style={{ transitionDelay: `${i * 100}ms` }}>
							<p className="text-base md:text-lg font-medium leading-relaxed mb-4">"{press.quotes[key]}"</p>
							<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold">— {source}</p>
						</div>
					))}
				</div>

				{/* investors */}
				<div className="lg:col-span-5 border-t lg:border-t-0 border-border">
					<div className="px-6 md:px-10 py-4 border-b border-border">
						<MonoTag>{press.backedBy}</MonoTag>
					</div>
					<div className="grid grid-cols-2 gap-px bg-border">
						{INVESTORS.map((name, i) => (
							<div
								key={name}
								className={`flex items-center justify-center h-28 bg-background transition-all duration-700 ${inView ? "opacity-100" : "opacity-0"}`}
								style={{ transitionDelay: `${200 + i * 80}ms` }}>
								<span className="font-bold text-sm tracking-wide text-muted-foreground">{name}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
