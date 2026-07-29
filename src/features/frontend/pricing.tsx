import { SiteLayout } from "./site-layout";
import { ArrowRight, CheckCircle2, X, Users, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useInView, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";
import { useI18n, useLocalizedSeo } from "@/i18n";

// ── Plan structure ──
// Prices and tier identity live in code; every string comes from the dictionary.
// Amounts are USD in all locales — only grouping and symbol placement localize.

const PLANS = [
	{
		key: "starter",
		name: "Pulse Starter",
		pricingType: "flat",
		priceFlat: { monthly: 9, annual: 7 },
		href: "/auth/signup",
		highlight: false,
	},
	{
		key: "core",
		name: "Pulse Core",
		pricingType: "per-agent",
		pricePerAgent: { monthly: 19, annual: 15 },
		href: "/auth/signup",
		highlight: false,
	},
	{
		key: "enterprise",
		name: "Pulse Enterprise",
		pricingType: "per-agent",
		pricePerAgent: { monthly: 39, annual: 31 },
		href: "/auth/signup",
		highlight: true,
	},
] as const;

const TESTIMONIALS = [
	{ key: "torres", author: "Mia Torres" },
	{ key: "bright", author: "James Okafor" },
	{ key: "retail", author: "Elena Rossi" },
] as const;

const FAQ_KEYS = ["howPricing", "changePlans", "whatIsAgent", "freeTrial", "nonProfit", "dataStored"] as const;

/**
 * Comparison matrix. `kind: "bool"` rows carry their values here rather than in
 * the dictionary — what a plan includes is a product fact, not a translation.
 */
const COMPARE_ROWS = [
	{ key: "agents", kind: "text" },
	{ key: "volume", kind: "text" },
	{ key: "channels", kind: "text" },
	{ key: "aiRouting", kind: "bool", starter: false, core: true, enterprise: true },
	{ key: "autoResolution", kind: "bool", starter: false, core: false, enterprise: true },
	{ key: "analytics", kind: "bool", starter: false, core: true, enterprise: true },
	{ key: "residency", kind: "bool", starter: false, core: false, enterprise: true },
	{ key: "architect", kind: "bool", starter: false, core: false, enterprise: true },
	{ key: "uptime", kind: "text" },
	{ key: "support", kind: "text" },
] as const;

// ── Agent counter — telemetry console ──
function AgentCounter({ agents, setAgents }: { agents: number; setAgents: (n: number) => void }) {
	const { dict, num } = useI18n();
	const c = dict.pricing.agentCounter;
	const MIN = 1;
	const MAX = 150;
	const pct = ((agents - MIN) / (MAX - MIN)) * 100;

	return (
		<div className="border border-border bg-background max-w-2xl">
			<div className="flex items-center justify-between px-5 py-3 border-b border-border">
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-primary">
					<Users className="size-3.5 text-accent" />
					{c.title}
				</span>
				<span className="font-mono text-[10px] tracking-widest text-muted-foreground/60">{c.scope}</span>
			</div>

			<div className="p-6">
				{/* Stepper + display */}
				<div className="flex items-center justify-between mb-6 gap-4">
					<button
						onClick={() => setAgents(Math.max(MIN, agents - 1))}
						className="size-10 border border-border flex items-center justify-center transition-colors duration-200 hover:border-primary hover:text-primary"
						aria-label={c.fewer}>
						<Minus className="size-4" />
					</button>

					<div className="text-center flex-1">
						<span className="text-5xl font-black tracking-tighter tabular-nums text-primary">{num(agents)}</span>
						<span className="ml-3 font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground">{c.agents}</span>
					</div>

					<button
						onClick={() => setAgents(Math.min(MAX, agents + 1))}
						className="size-10 border border-border flex items-center justify-center transition-colors duration-200 hover:border-primary hover:text-primary"
						aria-label={c.more}>
						<Plus className="size-4" />
					</button>
				</div>

				{/* Slider */}
				<input
					type="range"
					min={MIN}
					max={MAX}
					value={agents}
					onChange={(e) => setAgents(Number(e.target.value))}
					aria-label={c.title}
					className="w-full h-1.5 appearance-none cursor-pointer outline-none"
					style={{
						background: `linear-gradient(to right, var(--color-primary) ${pct}%, color-mix(in srgb, var(--color-primary) 15%, var(--color-border)) ${pct}%)`,
					}}
				/>
				<div className="flex justify-between font-mono text-[10px] text-muted-foreground mt-2">
					<span>1</span>
					<span>25</span>
					<span>50</span>
					<span>100</span>
					<span>150</span>
				</div>

				{/* Presets */}
				<div className="flex flex-wrap gap-2 mt-5">
					{[5, 10, 25, 50, 100, 150].map((n) => (
						<button
							key={n}
							onClick={() => setAgents(n)}
							className={`px-3 py-1.5 border font-mono text-[11px] font-semibold transition-colors duration-200 ${
								agents === n
									? "bg-primary text-primary-foreground border-primary"
									: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
							}`}>
							{n === 150 ? "150+" : n}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

// ── Main page ──
export default function PricingPage() {
	const { dict, locale } = useI18n();
	useLocalizedSeo({ ...dict.meta.pricing, path: "/pricing", locale });

	const hero = dict.pricing.hero;
	const [annual, setAnnual] = useState(false);
	const [agents, setAgents] = useState(10);
	const visible = useMountVisible();

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
							{hero.headline.trail && ` ${hero.headline.trail}`}
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">{hero.subhead}</p>

						{/* Billing toggle — segmented mono control */}
						<div className="inline-flex border border-border mb-10">
							<button
								onClick={() => setAnnual(false)}
								className={`px-5 py-3 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
									!annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
								}`}>
								{hero.monthly}
							</button>
							<button
								onClick={() => setAnnual(true)}
								className={`px-5 py-3 border-l border-border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
									annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
								}`}>
								{hero.annual} <span className={annual ? "text-(--pulse-lime)" : "text-accent"}>{hero.annualDiscount}</span>
							</button>
						</div>

						<AgentCounter agents={agents} setAgents={setAgents} />
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── PLANS ── */}
				<PlansSection annual={annual} agents={agents} />

				{/* ── FIELD REPORTS ── */}
				<FieldReports />

				{/* ── COMPARISON MATRIX ── */}
				<CompareSection />

				{/* ── FAQ ── */}
				<FaqSection />

				{/* ── FINAL CTA ── */}
				<DarkCta
					tag={dict.pricing.finalCta.tag}
					headline={
						<>
							{dict.pricing.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.pricing.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.pricing.finalCta.desc}
					primary={{ href: "/contact", label: dict.pricing.finalCta.primary }}
					secondary={{ href: "/auth/signup", label: dict.pricing.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

// ── Plans section ──
function PlansSection({ annual, agents }: { annual: boolean; agents: number }) {
	const { dict, t, num, usd, path } = useI18n();
	const p = dict.pricing.plans;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{p.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{p.sectionRight}</MonoTag>
			</div>

			<div className="relative">
				<Cross className="-bottom-2 -left-1.5" />
				<Cross className="-bottom-2 -right-1.5" />
				<div className="grid md:grid-cols-3 gap-px bg-border border-b border-border">
					{PLANS.map((plan, i) => {
						const copy = p[plan.key];
						const isFlat = plan.pricingType === "flat";
						const flatRate = isFlat && "priceFlat" in plan ? (annual ? plan.priceFlat.annual : plan.priceFlat.monthly) : 0;
						const perAgentRate = !isFlat && "pricePerAgent" in plan ? (annual ? plan.pricePerAgent.annual : plan.pricePerAgent.monthly) : 0;
						const total = isFlat ? flatRate : perAgentRate * agents;
						const dark = plan.highlight;

						return (
							<div
								key={plan.key}
								className={`group relative flex flex-col px-6 md:px-10 py-10 transition-all duration-700 ${dark ? "text-white" : "bg-background"} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ transitionDelay: `${i * 120}ms`, ...(dark ? { background: "var(--pulse-ink)" } : {}) }}>
								{!dark && <span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />}
								{dark && <span className="absolute top-0 left-0 h-0.5 w-full" style={{ background: "var(--pulse-lime)" }} />}

								{/* header */}
								<div className="flex items-center justify-between mb-2">
									<span className={`font-mono text-[10px] tracking-[0.25em] font-semibold ${dark ? "" : "text-primary"}`} style={dark ? { color: "var(--pulse-lime)" } : undefined}>
										{copy.tagline}
									</span>
									{dark && (
										<span className="font-mono text-[10px] tracking-widest px-2 py-1 font-bold" style={{ background: "var(--pulse-lime)", color: "var(--pulse-ink-deep)" }}>
											{p.mostSelected}
										</span>
									)}
								</div>
								<h3 className="text-2xl font-black tracking-tight mb-2">{plan.name}</h3>
								<p className={`text-sm leading-relaxed mb-8 ${dark ? "text-white/50" : "text-muted-foreground"}`}>{copy.description}</p>

								{/* price */}
								<div className="mb-8">
									<div className="flex items-baseline gap-2 mb-1.5">
										<span className="text-5xl font-black tracking-tighter tabular-nums">{usd(total)}</span>
										<span className={`font-mono text-[11px] tracking-widest ${dark ? "text-white/40" : "text-muted-foreground"}`}>{p.perMonth}</span>
									</div>
									<p className={`font-mono text-[10px] tracking-[0.15em] ${dark ? "text-white/45" : "text-muted-foreground"}`}>
										{isFlat ? p.flatRate : t(p.perAgentRate, { rate: usd(perAgentRate), count: num(agents) })}
										{annual && p.billedAnnually}
									</p>
									{annual && !isFlat && "pricePerAgent" in plan && (
										<p className="font-mono text-[10px] tracking-[0.15em] mt-1" style={{ color: dark ? "var(--pulse-lime)" : "var(--color-accent)" }}>
											{t(p.savePerYear, {
												amount: usd(agents * plan.pricePerAgent.monthly * 12 - agents * plan.pricePerAgent.annual * 12),
											})}
										</p>
									)}
								</div>

								{/* CTA */}
								<a
									href={path(plan.href)}
									className={`group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden px-6 py-3.5 font-mono text-[11px] tracking-[0.15em] uppercase font-bold mb-8 transition-colors duration-300 ${
										dark ? "text-(--pulse-ink-deep)" : "border border-foreground/25 text-foreground hover:border-primary hover:text-primary"
									}`}
									style={dark ? { background: "var(--pulse-lime)" } : undefined}>
									{p.cta}
									<ArrowRight className="size-3 group-hover/cta:translate-x-1 transition-transform" />
								</a>

								{/* features */}
								<ul className="space-y-2.5">
									{copy.features.map((f) => (
										<li key={f} className={`flex items-start gap-3 text-sm ${dark ? "text-white/80" : "text-foreground/85"}`}>
											<CheckCircle2 className="size-3.5 shrink-0 mt-0.5" style={{ color: dark ? "var(--pulse-lime)" : "var(--color-accent)" }} />
											{f}
										</li>
									))}
									{copy.missing.map((f) => (
										<li key={f} className={`flex items-start gap-3 text-sm ${dark ? "text-white/25" : "opacity-35"}`}>
											<X className="size-3.5 shrink-0 mt-0.5" />
											{f}
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>
			</div>

			{/* Enterprise callout — hairline row */}
			<div
				className={`flex flex-col md:flex-row md:items-center gap-4 px-6 md:px-12 py-6 border-b border-border transition-all duration-700 delay-300 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				<div className="flex-1">
					<p className="font-bold mb-0.5">{dict.pricing.enterpriseCallout.title}</p>
					<p className="text-sm text-muted-foreground">{dict.pricing.enterpriseCallout.desc}</p>
				</div>
				<CtaLink href="/contact" variant="outline">
					{dict.pricing.enterpriseCallout.cta} <ArrowRight className="size-3" />
				</CtaLink>
			</div>

			{/* Trust ticker row */}
			<div className="flex flex-wrap gap-x-8 gap-y-2 px-6 md:px-12 py-4 border-b border-border font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
				{[
					dict.pricing.trustRow.soc2,
					dict.pricing.trustRow.uptime,
					t(dict.pricing.trustRow.customers, { count: num(1200) }),
					dict.pricing.trustRow.rating,
				].map((item) => (
					<span key={item}>
						<span className="text-accent mr-2">●</span>
						{item}
					</span>
				))}
			</div>
		</section>
	);
}

// ── Field reports ──
function FieldReports() {
	const { dict } = useI18n();
	const section = dict.pricing.fieldReports;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{section.sectionLabel}</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					{section.sectionRight}
				</span>
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
				{TESTIMONIALS.map(({ key, author }, i) => {
					const copy = section.items[key];
					return (
						<div
							key={key}
							className={`flex flex-col px-6 md:px-10 py-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ transitionDelay: `${i * 120}ms` }}>
							<div className="flex items-center justify-between mb-6">
								<span className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold">
									{section.logPrefix}
									{i + 1}
								</span>
								<span className="font-mono text-[10px] tracking-widest border border-border px-2 py-1 text-muted-foreground">{copy.plan}</span>
							</div>
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

// ── Comparison matrix ──
function CompareSection() {
	const { dict } = useI18n();
	const c = dict.pricing.compare;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="03" label={c.sectionLabel} title={c.sectionTitle} right={c.sectionRight} />
			<div className="h-10" />

			<div
				className={`relative border-t border-b border-border overflow-x-auto transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<div className="min-w-160">
					{/* header */}
					<div className="grid grid-cols-4 divide-x divide-border border-b border-border bg-muted/30">
						<div className="px-6 py-4 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">{c.columnFeature}</div>
						{[c.columnStarter, c.columnCore, c.columnEnterprise].map((label, i) => (
							<div
								key={label}
								className={`px-4 py-4 text-center font-mono text-[10px] tracking-[0.25em] font-bold ${i === 2 ? "text-primary bg-accent/5" : "text-foreground"}`}>
								{label}
							</div>
						))}
					</div>
					{/* rows */}
					<div className="divide-y divide-border">
						{COMPARE_ROWS.map((row) => {
							const copy = c.rows[row.key];
							const values: (string | boolean)[] =
								row.kind === "bool"
									? [row.starter, row.core, row.enterprise]
									: [
											"starter" in copy ? copy.starter : "",
											"core" in copy ? copy.core : "",
											"enterprise" in copy ? copy.enterprise : "",
										];

							return (
								<div key={row.key} className="grid grid-cols-4 divide-x divide-border hover:bg-muted/30 transition-colors duration-150">
									<div className="px-6 py-3.5 text-sm text-muted-foreground font-medium">{copy.feature}</div>
									{values.map((val, i) => (
										<div key={i} className={`px-4 py-3.5 text-center flex items-center justify-center ${i === 2 ? "bg-accent/5" : ""}`}>
											{typeof val === "boolean" ? (
												<span className={`font-mono text-sm ${val ? "text-accent font-bold" : "text-muted-foreground/30"}`}>
													{val ? "✓" : "—"}
												</span>
											) : (
												<span className={`text-sm ${i === 2 ? "font-bold text-primary" : ""}`}>{val}</span>
											)}
										</div>
									))}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}

// ── FAQ ──
function FaqSection() {
	const { dict, t, num } = useI18n();
	const faq = dict.pricing.faq;
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-y border-border mt-16">
				<MonoTag className="text-primary">{faq.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{t(faq.entries, { count: num(FAQ_KEYS.length) })}</MonoTag>
			</div>

			<div className={`transition-all duration-700 ${inView ? "opacity-100" : "opacity-0"}`}>
				{FAQ_KEYS.map((key, i) => {
					const { q, a } = faq.items[key];
					const isOpen = openFaq === i;
					return (
						<div key={key} className="border-b border-border">
							<button
								onClick={() => setOpenFaq(isOpen ? null : i)}
								className={`w-full flex items-center gap-5 px-6 md:px-12 py-5 text-left transition-colors duration-200 ${isOpen ? "bg-accent/5" : "hover:bg-muted/40"}`}>
								<span className={`font-mono text-[10px] tracking-[0.25em] shrink-0 ${isOpen ? "text-accent font-bold" : "text-muted-foreground/60"}`}>
									Q_0{i + 1}
								</span>
								<span className="flex-1 text-sm md:text-base font-bold">{q}</span>
								<span
									className={`font-mono text-lg leading-none shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45 text-accent" : "text-muted-foreground"}`}>
									+
								</span>
							</button>
							<div className="overflow-hidden transition-all duration-400" style={{ maxHeight: isOpen ? "320px" : "0px" }}>
								<p className="px-6 md:px-12 pb-6 pl-16 md:pl-24 text-sm text-muted-foreground leading-relaxed max-w-3xl">{a}</p>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
