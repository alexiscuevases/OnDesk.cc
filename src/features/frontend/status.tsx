import { SiteLayout } from "./site-layout";
import { CheckCircle2, AlertCircle, XCircle, Clock, ArrowRight, Bell } from "lucide-react";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, Cross, CtaLink, DarkCta } from "./shared";
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

type ServiceStatus = keyof Dictionary["status"]["statusLabels"];
type ServiceKey = keyof Dictionary["status"]["services"]["items"];
type IncidentKey = keyof Dictionary["status"]["incidents"]["items"];
type Severity = keyof Dictionary["status"]["incidents"]["severities"];
type IncidentState = keyof Dictionary["status"]["incidents"]["states"];

// ── Structure ──
// Service ids and their live status, incident ids, severities and colour classes
// are operational facts, so they stay here. Names, descriptions and dates come
// from the dictionary.

const SERVICES: { key: ServiceKey; status: ServiceStatus }[] = [
	{ key: "ingestion", status: "operational" },
	{ key: "ai", status: "operational" },
	{ key: "integrations", status: "operational" },
	{ key: "dashboard", status: "operational" },
	{ key: "analytics", status: "operational" },
	{ key: "mobile", status: "operational" },
	{ key: "api", status: "operational" },
	{ key: "notifications", status: "operational" },
];

const INCIDENTS: { key: IncidentKey; severity: Severity; state: IncidentState }[] = [
	{ key: "inc-024", severity: "minor", state: "resolved" },
	{ key: "inc-023", severity: "minor", state: "resolved" },
	{ key: "inc-022", severity: "minor", state: "resolved" },
];

const UPTIME_DAYS = Array.from({ length: 90 }, (_, i) => ([12, 43, 71].includes(i) ? "degraded" : "operational")) as (
	| "operational"
	| "degraded"
	| "outage"
)[];

const STATUS_ICONS: Record<ServiceStatus, typeof CheckCircle2> = {
	operational: CheckCircle2,
	degraded: AlertCircle,
	outage: XCircle,
	maintenance: Clock,
};

const STATUS_CLASSES: Record<ServiceStatus, string> = {
	operational: "text-success",
	degraded: "text-warning",
	outage: "text-destructive",
	maintenance: "text-primary",
};

const SEVERITY_STYLES: Record<Severity, string> = {
	critical: "text-destructive border-destructive/40",
	major: "text-warning border-warning/40",
	minor: "text-muted-foreground border-border",
};

const STATE_CLASSES: Record<IncidentState, string> = {
	resolved: "text-success",
	monitoring: "text-warning",
	investigating: "text-destructive",
};

const overallStatus: ServiceStatus = SERVICES.every((s) => s.status === "operational") ? "operational" : "degraded";

export default function StatusPage() {
	const { dict, locale, t, num } = useI18n();
	useLocalizedSeo({ ...dict.meta.status, path: "/status", locale });

	const hero = dict.status.hero;
	const visible = useMountVisible();
	const { ref: statsRef, inView: statsInView } = useInView();
	const c9997 = useCounter(9997, 1400, statsInView);
	const c3 = useCounter(3, 900, statsInView);
	const c15 = useCounter(15, 1000, statsInView);

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
								<span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${overallStatus === "operational" ? "bg-success" : "bg-warning"}`} />
								<span className={`relative inline-flex size-2 rounded-full ${overallStatus === "operational" ? "bg-success" : "bg-warning"}`} />
							</span>
							<MonoTag className="text-foreground/70">
								{hero.eyebrowPrefix} — {overallStatus === "operational" ? hero.allOperational : hero.degraded}
								<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							{hero.headline.lead}{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								{hero.headline.highlight}
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-4">{hero.subhead}</p>
						<p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-10">{hero.lastUpdated}</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/contact">
								{hero.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="/help" variant="outline">
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
								{
									value: `${num(c9997 / 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
									label: hero.stats.uptime,
								},
								{ value: num(0), label: hero.stats.active },
								{ value: num(c3), label: hero.stats.incidents },
								{ value: t(hero.stats.resolutionValue, { count: num(c15) }), label: hero.stats.resolution },
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

				<ServicesSection />
				<UptimeSection />
				<IncidentsSection />

				<DarkCta
					tag={dict.status.finalCta.tag}
					headline={
						<>
							{dict.status.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.status.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.status.finalCta.desc}
					primary={{ href: "/contact", label: dict.status.finalCta.primary }}
					secondary={{ href: "/help", label: dict.status.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

function ServicesSection() {
	const { dict, t, num } = useI18n();
	const s = dict.status.services;
	const { ref, inView } = useInView({ threshold: 0.04 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{s.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{t(s.sectionRight, { count: num(SERVICES.length) })}</MonoTag>
			</div>

			{/* table header */}
			<div className="hidden md:grid grid-cols-12 gap-4 px-6 md:px-12 py-3 border-b border-border bg-muted/30 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
				<span className="col-span-7">{s.columnService}</span>
				<span className="col-span-2 text-right">{s.columnUptime}</span>
				<span className="col-span-3 text-right">{s.columnStatus}</span>
			</div>

			<div className="divide-y divide-border border-b border-border">
				{SERVICES.map((service, i) => {
					const copy = s.items[service.key];
					const Icon = STATUS_ICONS[service.status];
					return (
						<div
							key={service.key}
							className={`grid md:grid-cols-12 items-center gap-2 md:gap-4 px-6 md:px-12 py-4 hover:bg-muted/30 transition-all duration-500 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
							style={{ transitionDelay: `${i * 50}ms` }}>
							<div className="md:col-span-7 min-w-0">
								<p className="text-sm font-bold">{copy.name}</p>
								<p className="text-xs text-muted-foreground mt-0.5">{copy.description}</p>
							</div>
							<div className="md:col-span-2 font-mono text-xs text-muted-foreground md:text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
								{copy.uptime}
							</div>
							<div
								className={`md:col-span-3 flex items-center md:justify-end gap-2 font-mono text-[10px] tracking-[0.2em] font-bold ${STATUS_CLASSES[service.status]}`}>
								<Icon className="size-3.5" />
								{dict.status.statusLabels[service.status]}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function UptimeSection() {
	const { dict, t, num } = useI18n();
	const u = dict.status.uptime;
	const { ref, inView } = useInView({ threshold: 0.1 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{u.sectionLabel}</MonoTag>
				<span className="font-mono text-[11px] tracking-[0.2em] font-bold text-success">{u.overall}</span>
			</div>

			<div className="px-6 md:px-12 py-10 border-b border-border">
				<p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-6">{u.caption}</p>
				<div className="flex gap-px items-end h-12">
					{UPTIME_DAYS.map((day, i) => (
						<div
							key={i}
							title={t(u.dayTooltip, {
								day: num(i + 1),
								state: day === "operational" ? dict.status.statusLabels.operational : dict.status.statusLabels.degraded,
							})}
							className={`flex-1 cursor-default transition-all duration-500 hover:scale-y-125 origin-bottom ${day === "operational" ? "bg-success/60" : day === "degraded" ? "bg-warning/70" : "bg-destructive/70"} ${inView ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"}`}
							style={{ transitionDelay: `${i * 6}ms`, transformOrigin: "bottom" }}
						/>
					))}
				</div>
				<div className="flex justify-between mt-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
					<span>{u.rangeStart}</span>
					<span>{u.rangeEnd}</span>
				</div>
				<div className="flex items-center gap-6 mt-5 font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
					<span className="flex items-center gap-2">
						<span className="size-2.5 bg-success/60 inline-block" /> {u.legendOperational}
					</span>
					<span className="flex items-center gap-2">
						<span className="size-2.5 bg-warning/70 inline-block" /> {u.legendDegraded}
					</span>
					<span className="flex items-center gap-2">
						<span className="size-2.5 bg-destructive/70 inline-block" /> {u.legendOutage}
					</span>
				</div>
			</div>
		</section>
	);
}

function IncidentsSection() {
	const { dict, path } = useI18n();
	const inc = dict.status.incidents;
	const { ref, inView } = useInView({ threshold: 0.04 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{inc.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{inc.sectionRight}</MonoTag>
			</div>

			{INCIDENTS.map((incident, i) => {
				const copy = inc.items[incident.key];
				return (
					<article
						key={incident.key}
						className={`border-b border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
						style={{ transitionDelay: `${i * 100}ms` }}>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 md:px-12 py-4 bg-muted/30 border-b border-border">
							<span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase">{incident.key}</span>
							<span className="text-sm font-bold">{copy.title}</span>
							<span className={`font-mono text-[9px] tracking-[0.2em] border px-2 py-1 font-bold uppercase ${SEVERITY_STYLES[incident.severity]}`}>
								{inc.severities[incident.severity]}
							</span>
							<span className={`font-mono text-[10px] tracking-[0.2em] font-bold uppercase ${STATE_CLASSES[incident.state]}`}>
								✓ {inc.states[incident.state]}
							</span>
							<span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{copy.date}</span>
						</div>
						<ul className="divide-y divide-border">
							{copy.updates.map((update, j) => (
								<li key={j} className="flex gap-5 px-6 md:px-12 py-3.5 text-sm">
									<span className="font-mono text-[11px] text-accent shrink-0 mt-0.5 w-20 font-semibold">{update.time}</span>
									<span className="text-muted-foreground leading-relaxed max-w-3xl">{update.message}</span>
								</li>
							))}
						</ul>
					</article>
				);
			})}

			{/* upcoming maintenance strip */}
			<div
				className={`flex flex-col md:flex-row md:items-center gap-4 px-6 md:px-12 py-6 border-b border-border transition-all duration-700 delay-300 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				<Clock className="size-5 text-accent shrink-0" />
				<div className="flex-1">
					<p className="font-bold text-sm mb-1">
						{inc.upcoming.title} <span className="font-mono text-[10px] tracking-[0.2em] text-accent ml-2">{inc.upcoming.window}</span>
					</p>
					<p className="text-sm text-muted-foreground leading-relaxed">{inc.upcoming.desc}</p>
				</div>
				<a
					href={path("/contact")}
					className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-primary hover:text-accent transition-colors shrink-0">
					<Bell className="size-3" /> {inc.upcoming.cta}
				</a>
			</div>
		</section>
	);
}
