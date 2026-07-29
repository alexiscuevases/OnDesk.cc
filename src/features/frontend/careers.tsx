import { useState } from "react";
import { ArrowRight, ArrowUpRight, MapPin, Globe, Heart, Zap, TrendingUp, BookOpen, Monitor, Clock, Users, Star } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

// ── Structure ──
// Department ids drive the filter (never the translated name), and the tech tags
// on each role are proper nouns, so both live here.

type DeptKey = keyof Dictionary["careers"]["roles"]["departments"];
type LocationKey = keyof Dictionary["careers"]["roles"]["locations"];
type EmploymentType = keyof Dictionary["careers"]["roles"]["types"];

interface RoleConfig {
	key: string;
	location: LocationKey;
	type: EmploymentType;
	tags: string[];
}

interface DeptConfig {
	key: DeptKey;
	roles: RoleConfig[];
}

const DEPARTMENTS: DeptConfig[] = [
	{
		key: "engineering",
		roles: [
			{ key: "intelligence", location: "remoteEuUs", type: "fullTime", tags: ["Python", "LLMs", "Azure"] },
			{ key: "frontend", location: "remoteEuUs", type: "fullTime", tags: ["React", "TypeScript", "Tailwind"] },
			{ key: "infra", location: "remoteEuUs", type: "fullTime", tags: ["Kubernetes", "Terraform", "GCP"] },
			{ key: "ml", location: "remote", type: "fullTime", tags: ["NLP", "PyTorch", "Azure OpenAI"] },
		],
	},
	{
		key: "product",
		roles: [
			{ key: "pmCore", location: "remoteEuUs", type: "fullTime", tags: ["B2B SaaS", "Enterprise", "AI"] },
			{ key: "designer", location: "remote", type: "fullTime", tags: ["Figma", "Research", "Design Systems"] },
			{ key: "pmSmb", location: "remote", type: "fullTime", tags: ["SMB", "Self-serve", "Growth"] },
		],
	},
	{
		key: "success",
		roles: [
			{ key: "csmEnterprise", location: "londonOrRemote", type: "fullTime", tags: ["Enterprise", "EMEA", "SaaS"] },
			{ key: "onboarding", location: "remote", type: "fullTime", tags: ["Onboarding", "Technical", "SMB"] },
		],
	},
	{
		key: "sales",
		roles: [
			{ key: "aeMidMarket", location: "londonOrRemote", type: "fullTime", tags: ["Mid-Market", "EMEA", "SaaS"] },
			{ key: "salesEngineer", location: "remoteUs", type: "fullTime", tags: ["Pre-sales", "Technical", "Integrations"] },
			{ key: "aeSmb", location: "remoteUsLatam", type: "fullTime", tags: ["SMB", "Self-serve", "SaaS"] },
		],
	},
];

const PERK_KEYS = [
	{ key: "remote", icon: Globe },
	{ key: "equity", icon: TrendingUp },
	{ key: "health", icon: Heart },
	{ key: "learning", icon: BookOpen },
	{ key: "pto", icon: Clock },
	{ key: "office", icon: Monitor },
	{ key: "retreats", icon: Users },
	{ key: "growth", icon: Zap },
] as const;

const REPORT_KEYS = ["engineer", "designer", "csm"] as const;
const PROCESS_KEYS = [
	{ key: "apply", step: "01" },
	{ key: "intro", step: "02" },
	{ key: "technical", step: "03" },
	{ key: "final", step: "04" },
] as const;

const TOTAL_ROLES = DEPARTMENTS.reduce((acc, d) => acc + d.roles.length, 0);

// ── Page ──

export default function CareersPage() {
	const { dict, locale, t, num } = useI18n();
	useLocalizedSeo({ ...dict.meta.careers, path: "/careers", locale });

	const hero = dict.careers.hero;
	const visible = useMountVisible();
	const [activeDept, setActiveDept] = useState<DeptKey | "all">("all");
	const { ref: statsRef, inView: statsInView } = useInView();
	const c47 = useCounter(47, 900, statsInView);
	const c14 = useCounter(14, 800, statsInView);
	const c49 = useCounter(49, 1200, statsInView);
	const c94 = useCounter(94, 1100, statsInView);

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
								{t(hero.eyebrow, { count: num(TOTAL_ROLES) })}
								<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							{hero.headline.lead}{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								{hero.headline.highlight}
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">{hero.subhead}</p>

						<div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-10">
							{[hero.facts.countries, hero.facts.remote, hero.facts.glassdoor].map((fact) => (
								<span key={fact}>
									<span className="text-accent mr-2">●</span>
									{fact}
								</span>
							))}
						</div>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="#roles">
								{hero.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="/about" variant="outline">
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
								{ value: num(c47), label: hero.stats.team },
								{ value: num(c14), label: hero.stats.countries },
								{ value: `${num(c49 / 10, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/5`, label: hero.stats.rating },
								{ value: `${num(c94)}%`, label: hero.stats.recommend },
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

				<PerksSection />
				<ReportsSection />
				<OpenRolesSection activeDept={activeDept} setActiveDept={setActiveDept} />
				<ProcessBand />

				<DarkCta
					tag={dict.careers.finalCta.tag}
					headline={
						<>
							{dict.careers.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.careers.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.careers.finalCta.desc}
					primary={{ href: "/contact", label: dict.careers.finalCta.primary }}
					secondary={{ href: "/about", label: dict.careers.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

// ── Sections ──

function PerksSection() {
	const { dict } = useI18n();
	const p = dict.careers.perks;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="01" label={p.sectionLabel} title={p.sectionTitle} right={p.sectionRight} />
			<p className="px-6 md:px-12 pb-10 text-lg text-muted-foreground max-w-2xl">{p.intro}</p>

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border-b border-border">
					{PERK_KEYS.map(({ key, icon: Icon }, i) => (
						<div
							key={key}
							className={`group relative bg-background px-6 py-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ transitionDelay: `${i * 60}ms` }}>
							<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
							<div className="flex items-center justify-between mb-6">
								<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">0{i + 1}</span>
								<Icon className="size-4 text-accent" />
							</div>
							<h3 className="font-bold text-sm mb-2">{p.items[key].title}</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">{p.items[key].desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function ReportsSection() {
	const { dict } = useI18n();
	const r = dict.careers.reports;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{r.sectionLabel}</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<Star className="size-3 fill-accent text-accent" />
					{r.sectionRight}
				</span>
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
				{REPORT_KEYS.map((key, i) => (
					<div
						key={key}
						className={`flex flex-col px-6 md:px-10 py-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 100}ms` }}>
						<span className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold mb-6">LOG_0{i + 1}</span>
						<p className="text-base font-medium leading-relaxed flex-1 mb-8">"{r.items[key].quote}"</p>
						<div className="font-mono text-[11px] tracking-wider text-muted-foreground border-t border-border pt-4">
							{r.items[key].role.toUpperCase()} — {r.verifiedEmployee}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function OpenRolesSection({
	activeDept,
	setActiveDept,
}: {
	activeDept: DeptKey | "all";
	setActiveDept: (d: DeptKey | "all") => void;
}) {
	const { dict, t, num, path } = useI18n();
	const r = dict.careers.roles;
	const { ref, inView } = useInView();

	const filters: (DeptKey | "all")[] = ["all", ...DEPARTMENTS.map((d) => d.key)];
	const filtered = activeDept === "all" ? DEPARTMENTS : DEPARTMENTS.filter((d) => d.key === activeDept);

	return (
		<section id="roles" ref={ref as React.RefObject<HTMLElement>} className="scroll-mt-16">
			<SectionRule
				index="03"
				label={r.sectionLabel}
				title={r.sectionTitle}
				right={t(r.sectionRight, { roles: num(TOTAL_ROLES), departments: num(DEPARTMENTS.length) })}
			/>
			<div className="h-6" />

			{/* mono filter buttons */}
			<div className="flex flex-wrap gap-2 px-6 md:px-12 pb-10">
				{filters.map((id) => {
					const isActive = activeDept === id;
					return (
						<button
							key={id}
							onClick={() => setActiveDept(id)}
							aria-pressed={isActive}
							className={`px-4 py-2 border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
								isActive
									? "bg-primary text-primary-foreground border-primary"
									: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
							}`}>
							{id === "all" ? r.allFilter : r.departments[id].name}
						</button>
					);
				})}
			</div>

			<div key={activeDept} className={`animate-in fade-in duration-300 ${inView ? "" : "opacity-0"}`}>
				{filtered.map((dept, di) => {
					const deptCopy = r.departments[dept.key];
					const deptRoles = deptCopy.roles as Record<string, string>;
					const deptIndex = DEPARTMENTS.findIndex((d) => d.key === dept.key) + 1;
					return (
						<div key={dept.key}>
							{/* department header row */}
							<div className="flex items-center gap-4 px-6 md:px-12 py-4 border-t border-border">
								<span className="font-mono text-[11px] tracking-[0.25em] text-primary font-semibold uppercase">
									DEPT_0{deptIndex} / {deptCopy.name}
								</span>
								<span className="ml-auto font-mono text-[10px] tracking-widest text-accent shrink-0">
									{t(r.openCount, { count: num(dept.roles.length) })}
								</span>
							</div>

							{/* role rows */}
							<div className="border-t border-border divide-y divide-border">
								{dept.roles.map((role, i) => (
									<a
										key={role.key}
										href={path("/contact")}
										className={`group grid sm:grid-cols-12 gap-3 sm:gap-4 items-center px-6 md:px-12 py-5 transition-colors duration-200 hover:bg-accent/5 ${inView ? "opacity-100" : "opacity-0"}`}
										style={{ transitionDelay: `${di * 60 + i * 40}ms` }}>
										<div className="sm:col-span-6 min-w-0">
											<p className="font-bold group-hover:text-primary transition-colors">{deptRoles[role.key]}</p>
											<div className="flex flex-wrap gap-1.5 mt-2">
												{role.tags.map((tag) => (
													<span key={tag} className="font-mono text-[9px] tracking-[0.15em] uppercase border border-border px-1.5 py-0.5 text-muted-foreground">
														{tag}
													</span>
												))}
											</div>
										</div>
										<div className="sm:col-span-3 flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
											<MapPin className="size-3 text-accent shrink-0" />
											{r.locations[role.location]}
										</div>
										<div className="sm:col-span-2 font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
											{r.types[role.type]}
										</div>
										<div className="sm:col-span-1 flex sm:justify-end">
											<span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.15em] uppercase font-bold text-primary group-hover:text-accent transition-colors">
												{r.apply} <ArrowUpRight className="size-3" />
											</span>
										</div>
									</a>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function ProcessBand() {
	const { dict } = useI18n();
	const p = dict.careers.process;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white border-y border-border" style={{ background: "var(--pulse-ink)" }}>
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

			<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
			</div>

			<div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10">
				{PROCESS_KEYS.map(({ key, step }, i) => (
					<div
						key={step}
						className={`px-6 md:px-10 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 120 + 150}ms` }}>
						<span className="font-mono text-5xl font-black text-white/15 block mb-8">/{step}</span>
						<h3 className="text-lg font-bold mb-3">{p.steps[key].title}</h3>
						<p className="text-sm text-white/50 leading-relaxed">{p.steps[key].desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}
