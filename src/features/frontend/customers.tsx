import { SiteLayout } from "./site-layout";
import { ArrowRight, ArrowUpRight, Star, TrendingDown, Clock, Users, Zap, BarChart3, Shield, Globe } from "lucide-react";
import { useState } from "react";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

// ── Structure ──
// Company names, authors, logos, colours, plan names, industry ids and result
// icons live here. Every string comes from the dictionary, keyed to match.

type IndustryId = keyof Dictionary["customers"]["industries"];
type CaseKey = keyof Dictionary["customers"]["cases"];

const INDUSTRY_IDS: readonly IndustryId[] = ["all", "technology", "retail", "agency", "finance", "healthcare", "education"];

interface CaseConfig {
	key: CaseKey;
	company: string;
	industry: IndustryId;
	logo: string;
	color: string;
	author: string;
	plan: string;
	/** Icons pair by index with the dictionary's `results` array. */
	resultIcons: React.ElementType[];
	featured?: boolean;
}

const CASE_STUDIES: CaseConfig[] = [
	{
		key: "fabrikam",
		company: "Fabrikam Inc.",
		industry: "technology",
		logo: "FA",
		color: "bg-blue-500",
		author: "Marcus Rivera",
		plan: "ENTERPRISE",
		resultIcons: [Users, Clock, Star, TrendingDown],
		featured: true,
	},
	{
		key: "northwind",
		company: "Northwind Traders",
		industry: "retail",
		logo: "NT",
		color: "bg-emerald-500",
		author: "Priya Patel",
		plan: "PROFESSIONAL",
		resultIcons: [TrendingDown, Shield, Clock, Star],
	},
	{
		key: "brightsupport",
		company: "BrightSupport Agency",
		industry: "agency",
		logo: "BS",
		color: "bg-indigo-500",
		author: "James Okafor",
		plan: "CORE",
		resultIcons: [Users, Clock, Shield, BarChart3],
	},
	{
		key: "torres",
		company: "Torres Digital",
		industry: "technology",
		logo: "TD",
		color: "bg-teal-500",
		author: "Mia Torres",
		plan: "STARTER",
		resultIcons: [Zap, Users, Shield, Clock],
	},
	{
		key: "contoso",
		company: "Contoso Healthcare",
		industry: "healthcare",
		logo: "CH",
		color: "bg-red-500",
		author: "Dr. Sandra Lin",
		plan: "ENTERPRISE",
		resultIcons: [Shield, Globe, BarChart3, Star],
	},
	{
		key: "tailwind",
		company: "Tailwind Finance",
		industry: "finance",
		logo: "TF",
		color: "bg-amber-500",
		author: "James Okonkwo",
		plan: "PROFESSIONAL",
		resultIcons: [TrendingDown, Zap, Clock, BarChart3],
	},
	{
		key: "adventure",
		company: "Adventure Works",
		industry: "retail",
		logo: "AW",
		color: "bg-violet-500",
		author: "Lena Hoffmann",
		plan: "ENTERPRISE",
		resultIcons: [Users, Shield, TrendingDown, Star],
	},
	{
		key: "wingtip",
		company: "Wingtip University",
		industry: "education",
		logo: "WU",
		color: "bg-sky-500",
		author: "Prof. David Osei",
		plan: "PROFESSIONAL",
		resultIcons: [TrendingDown, Star, Clock, Users],
	},
];

export default function CustomersPage() {
	const { dict, locale, num } = useI18n();
	useLocalizedSeo({ ...dict.meta.customers, path: "/customers", locale });

	const hero = dict.customers.hero;
	const visible = useMountVisible();
	const [activeIndustry, setActiveIndustry] = useState<IndustryId>("all");
	const { ref: statsRef, inView: statsInView } = useInView();
	const c1200 = useCounter(1200, 1200, statsInView);
	const c40 = useCounter(40, 900, statsInView);
	const c73 = useCounter(73, 1100, statsInView);
	const c49 = useCounter(49, 1300, statsInView);

	const filtered = activeIndustry === "all" ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.industry === activeIndustry);
	const featured = CASE_STUDIES.find((c) => c.featured)!;
	const rest = filtered.filter((c) => !c.featured || activeIndustry !== "all");

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

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">{hero.subhead}</p>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${num(c1200)}+`, label: hero.stats.customers },
								{ value: `${num(c40)}+`, label: hero.stats.countries },
								{ value: `${num(c73)}%`, label: hero.stats.deflection },
								{
									value: `${num(c49 / 10, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/5`,
									label: hero.stats.csat,
								},
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

				{activeIndustry === "all" && <FeaturedCase config={featured} />}

				<CasesIndex rest={rest} activeIndustry={activeIndustry} setActiveIndustry={setActiveIndustry} />

				<DarkCta
					tag={dict.customers.finalCta.tag}
					headline={
						<>
							{dict.customers.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.customers.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.customers.finalCta.desc}
					primary={{ href: "/auth/signup", label: dict.customers.finalCta.primary }}
					secondary={{ href: "/contact", label: dict.customers.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

function FeaturedCase({ config }: { config: CaseConfig }) {
	const { dict } = useI18n();
	const f = dict.customers.featured;
	const copy = dict.customers.cases[config.key];
	const { ref, inView } = useInView({ threshold: 0.05 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{f.sectionLabel}</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					{f.caseTag} / {config.company.toUpperCase()}
				</span>
			</div>

			<div className={`grid lg:grid-cols-12 border-b border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				{/* story */}
				<div className="lg:col-span-7 px-6 md:px-12 py-12 lg:border-r border-border flex flex-col">
					<div className="flex items-center gap-4 mb-8">
						<div className={`size-12 ${config.color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
							{config.logo}
						</div>
						<div>
							<p className="font-bold">{config.company}</p>
							<p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground mt-0.5">
								{dict.customers.industries[config.industry]} · {config.plan} {f.planSuffix}
							</p>
						</div>
					</div>

					<h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance mb-8">{copy.tagline}</h2>

					<div className="mb-6">
						<p className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold mb-2">{f.challengeLabel}</p>
						<p className="text-sm text-muted-foreground leading-relaxed">{copy.challenge}</p>
					</div>
					<div className="mb-8">
						<p className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold mb-2">{f.solutionLabel}</p>
						<p className="text-sm text-muted-foreground leading-relaxed">{copy.solution}</p>
					</div>

					<div className="mt-auto border-t border-border pt-6">
						<blockquote className="text-base md:text-lg font-medium leading-relaxed mb-4">"{copy.quote}"</blockquote>
						<p className="font-mono text-xs tracking-wider text-muted-foreground">
							<span className="text-foreground font-bold">{config.author.toUpperCase()}</span> · {copy.role.toUpperCase()} —{" "}
							{config.company.toUpperCase()}
						</p>
					</div>
				</div>

				{/* metrics */}
				<div className="lg:col-span-5 border-t lg:border-t-0 border-border flex flex-col">
					<div className="px-6 md:px-10 py-3 border-b border-border">
						<MonoTag className="text-primary">{f.resultsLabel}</MonoTag>
					</div>
					<div className="grid grid-cols-2 gap-px bg-border flex-1">
						{copy.results.map(({ metric, label }, i) => {
							const Icon = config.resultIcons[i];
							return (
								<div key={label} className="bg-background px-6 py-8 flex flex-col justify-center">
									{Icon && <Icon className="size-4 text-accent mb-3" />}
									<p className="text-3xl md:text-4xl font-black tracking-tighter mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>
										{metric}
									</p>
									<p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground leading-relaxed">{label}</p>
								</div>
							);
						})}
					</div>
					<div className="border-t border-border p-6">
						<CtaLink href="/contact">
							{f.cta} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
						</CtaLink>
					</div>
				</div>
			</div>
		</section>
	);
}

function CasesIndex({
	rest,
	activeIndustry,
	setActiveIndustry,
}: {
	rest: CaseConfig[];
	activeIndustry: IndustryId;
	setActiveIndustry: (v: IndustryId) => void;
}) {
	const { dict, t, num } = useI18n();
	const idx = dict.customers.index;
	const { ref, inView } = useInView({ threshold: 0.04 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule
				index="02"
				label={idx.sectionLabel}
				title={idx.sectionTitle}
				right={t(idx.sectionRight, { count: num(CASE_STUDIES.length) })}
			/>
			<div className="h-6" />

			{/* mono filter buttons */}
			<div className="flex flex-wrap gap-2 px-6 md:px-12 pb-10">
				{INDUSTRY_IDS.map((id) => (
					<button
						key={id}
						onClick={() => setActiveIndustry(id)}
						aria-pressed={activeIndustry === id}
						className={`px-4 py-2 border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
							activeIndustry === id
								? "bg-primary text-primary-foreground border-primary"
								: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
						}`}>
						{dict.customers.industries[id]}
					</button>
				))}
			</div>

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div key={activeIndustry} className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border animate-in fade-in duration-300">
					{rest.map((config, i) => {
						const copy = dict.customers.cases[config.key];
						return (
							<div
								key={config.key}
								className={`group relative bg-background px-6 md:px-8 py-8 flex flex-col transition-all duration-500 ${inView ? "opacity-100" : "opacity-0"}`}
								style={{ transitionDelay: `${i * 60}ms` }}>
								<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />

								{/* header */}
								<div className="flex items-center gap-3 mb-6">
									<div className={`size-10 ${config.color} flex items-center justify-center text-white font-black text-xs shrink-0`}>
										{config.logo}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-bold text-sm truncate">{config.company}</p>
										<p className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-foreground mt-0.5">
											{dict.customers.industries[config.industry]}
										</p>
									</div>
									<span className="font-mono text-[9px] tracking-[0.15em] border border-border px-1.5 py-0.5 text-muted-foreground shrink-0">
										{config.plan}
									</span>
								</div>

								<h3 className="text-lg font-black tracking-tight leading-snug mb-6 group-hover:text-primary transition-colors duration-200">
									{copy.tagline}
								</h3>

								{/* top 2 metrics */}
								<div className="grid grid-cols-2 border-y border-border divide-x divide-border mb-6">
									{copy.results.slice(0, 2).map(({ metric, label }) => (
										<div key={label} className="py-4 pr-3 first:pl-0 pl-4">
											<p className="text-2xl font-black tracking-tighter text-primary mb-1" style={{ fontVariantNumeric: "tabular-nums" }}>
												{metric}
											</p>
											<p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground leading-relaxed">{label}</p>
										</div>
									))}
								</div>

								<blockquote className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">"{copy.quote}"</blockquote>

								<div className="flex items-center justify-between pt-4 border-t border-border">
									<div className="font-mono text-[10px] tracking-wider text-muted-foreground min-w-0">
										<span className="text-foreground font-bold">{config.author.toUpperCase()}</span>
										<span className="block mt-0.5 truncate">{copy.role.toUpperCase()}</span>
									</div>
									<ArrowUpRight className="size-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
