import { SiteLayout } from "./site-layout";
import { CheckCircle2, AlertCircle, XCircle, Clock, ArrowRight, Bell } from "lucide-react";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, Cross, CtaLink, DarkCta } from "./shared";

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

interface Service {
	name: string;
	description: string;
	status: ServiceStatus;
	uptime: string;
}

interface Incident {
	id: string;
	title: string;
	severity: "critical" | "major" | "minor";
	status: "resolved" | "monitoring" | "investigating";
	date: string;
	updates: { time: string; message: string }[];
}

const SERVICES: Service[] = [
	{ name: "Ticket Ingestion", description: "Email, Teams, and API ticket creation", status: "operational", uptime: "100.00%" },
	{ name: "AI Engine", description: "AI classification, routing, and automated resolution", status: "operational", uptime: "99.98%" },
	{ name: "Third-party Integrations", description: "Microsoft 365, Google Workspace, and external app integrations", status: "operational", uptime: "99.97%" },
	{ name: "Dashboard & Web App", description: "Agent and admin UI", status: "operational", uptime: "100.00%" },
	{ name: "Analytics & Reports", description: "Real-time dashboards and exports", status: "operational", uptime: "99.99%" },
	{ name: "Pulse Mobile", description: "iOS and Android native orchestration apps", status: "operational", uptime: "99.96%" },
	{ name: "API", description: "Public REST and webhook APIs", status: "operational", uptime: "100.00%" },
	{ name: "Notifications", description: "Email, Teams, and push alerts", status: "operational", uptime: "99.95%" },
];

const PAST_INCIDENTS: Incident[] = [
	{
		id: "inc-024",
		title: "Elevated AI response latency",
		severity: "minor",
		status: "resolved",
		date: "FEB 19, 2025",
		updates: [
			{
				time: "14:32 UTC",
				message: "Resolved. Root cause analysis identified a saturated auto-scaling cluster. Median Pulse AI response time is restored to baseline (<800 ms).",
			},
			{ time: "13:58 UTC", message: "Investigating elevated p99 latency on AI Agent Engine. Ticket creation and delivery are unaffected." },
		],
	},
	{
		id: "inc-023",
		title: "Notification delivery delay",
		severity: "minor",
		status: "resolved",
		date: "FEB 7, 2025",
		updates: [
			{ time: "09:14 UTC", message: "Integration API throttling resolved. All queued notifications delivered." },
			{ time: "08:41 UTC", message: "Third-party integration API experiencing throttling. Some notifications delayed up to 15 minutes. No tickets lost." },
		],
	},
	{
		id: "inc-022",
		title: "Scheduled maintenance — database upgrade",
		severity: "minor",
		status: "resolved",
		date: "JAN 25, 2025",
		updates: [
			{ time: "03:00 UTC", message: "Maintenance complete. All services fully operational." },
			{ time: "01:00 UTC", message: "Scheduled maintenance window started. Read-only mode active for analytics exports." },
		],
	},
];

const UPTIME_DAYS = Array.from({ length: 90 }, (_, i) => {
	const blips = [12, 43, 71];
	if (blips.includes(i)) return "degraded";
	return "operational";
}) as ("operational" | "degraded" | "outage")[];

const STATUS_CONFIG: Record<ServiceStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
	operational: { label: "OPERATIONAL", icon: CheckCircle2, className: "text-success" },
	degraded: { label: "DEGRADED", icon: AlertCircle, className: "text-warning" },
	outage: { label: "OUTAGE", icon: XCircle, className: "text-destructive" },
	maintenance: { label: "MAINTENANCE", icon: Clock, className: "text-primary" },
};

const SEVERITY_STYLES: Record<Incident["severity"], string> = {
	critical: "text-destructive border-destructive/40",
	major: "text-warning border-warning/40",
	minor: "text-muted-foreground border-border",
};

const STATUS_INCIDENT: Record<Incident["status"], string> = {
	resolved: "text-success",
	monitoring: "text-warning",
	investigating: "text-destructive",
};

const overallStatus: ServiceStatus = SERVICES.every((s) => s.status === "operational") ? "operational" : "degraded";

export default function StatusPage() {
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
								SYS.STATUS — {overallStatus === "operational" ? "ALL SYSTEMS OPERATIONAL" : "DEGRADED PERFORMANCE"}
								<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Every system,{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								on the record
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-4">
							Real-time status and performance history for all Pulse global services.
						</p>
						<p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-10">
							LAST UPDATED: FEB 27, 2026 · 08:00 UTC
						</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/contact">
								Subscribe to updates <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="/help" variant="outline">
								View SLA docs
							</CtaLink>
						</div>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${(c9997 / 100).toFixed(2)}%`, label: "OVERALL UPTIME (90D)" },
								{ value: "0", label: "ACTIVE INCIDENTS" },
								{ value: `${c3}`, label: "INCIDENTS (90D)" },
								{ value: `< ${c15} MIN`, label: "AVG RESOLUTION TIME" },
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

				{/* ── SERVICES ── */}
				<ServicesSection />

				{/* ── UPTIME ── */}
				<UptimeSection />

				{/* ── INCIDENT LOG ── */}
				<IncidentsSection />

				{/* ── CTA ── */}
				<DarkCta
					tag="04 — SUBSCRIBE · EMAIL / SMS / WEBHOOK"
					headline={
						<>
							Never miss an <span style={{ color: "var(--pulse-lime)" }}>incident.</span>
						</>
					}
					desc="Subscribe to status updates by email, SMS, or webhook. Get notified the moment something changes."
					primary={{ href: "/contact", label: "Subscribe to updates" }}
					secondary={{ href: "/help", label: "View SLA docs" }}
				/>
			</div>
		</SiteLayout>
	);
}

function ServicesSection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">01 — SERVICES</MonoTag>
				<MonoTag className="hidden sm:block">{SERVICES.length} MONITORED ENDPOINTS</MonoTag>
			</div>

			{/* table header */}
			<div className="hidden md:grid grid-cols-12 gap-4 px-6 md:px-12 py-3 border-b border-border bg-muted/30 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
				<span className="col-span-7">SERVICE</span>
				<span className="col-span-2 text-right">UPTIME (90D)</span>
				<span className="col-span-3 text-right">STATUS</span>
			</div>

			<div className="divide-y divide-border border-b border-border">
				{SERVICES.map((service, i) => {
					const cfg = STATUS_CONFIG[service.status];
					const Icon = cfg.icon;
					return (
						<div
							key={service.name}
							className={`grid md:grid-cols-12 items-center gap-2 md:gap-4 px-6 md:px-12 py-4 hover:bg-muted/30 transition-all duration-500 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
							style={{ transitionDelay: `${i * 50}ms` }}>
							<div className="md:col-span-7 min-w-0">
								<p className="text-sm font-bold">{service.name}</p>
								<p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
							</div>
							<div className="md:col-span-2 font-mono text-xs text-muted-foreground md:text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
								{service.uptime}
							</div>
							<div className={`md:col-span-3 flex items-center md:justify-end gap-2 font-mono text-[10px] tracking-[0.2em] font-bold ${cfg.className}`}>
								<Icon className="size-3.5" />
								{cfg.label}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function UptimeSection() {
	const { ref, inView } = useInView({ threshold: 0.1 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">02 — UPTIME_HISTORY</MonoTag>
				<span className="font-mono text-[11px] tracking-[0.2em] font-bold text-success">99.97%</span>
			</div>

			<div className="px-6 md:px-12 py-10 border-b border-border">
				<p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-6">
					90 DAYS · EACH BAR = ONE DAY · HOVER FOR DETAIL
				</p>
				<div className="flex gap-px items-end h-12">
					{UPTIME_DAYS.map((day, i) => (
						<div
							key={i}
							title={`Day ${i + 1}: ${day === "operational" ? "Operational" : "Degraded"}`}
							className={`flex-1 cursor-default transition-all duration-500 hover:scale-y-125 origin-bottom ${day === "operational" ? "bg-success/60" : day === "degraded" ? "bg-warning/70" : "bg-destructive/70"} ${inView ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"}`}
							style={{ transitionDelay: `${i * 6}ms`, transformOrigin: "bottom" }}
						/>
					))}
				</div>
				<div className="flex justify-between mt-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
					<span>−90D</span>
					<span>TODAY</span>
				</div>
				<div className="flex items-center gap-6 mt-5 font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
					<span className="flex items-center gap-2">
						<span className="size-2.5 bg-success/60 inline-block" /> OPERATIONAL
					</span>
					<span className="flex items-center gap-2">
						<span className="size-2.5 bg-warning/70 inline-block" /> DEGRADED
					</span>
					<span className="flex items-center gap-2">
						<span className="size-2.5 bg-destructive/70 inline-block" /> OUTAGE
					</span>
				</div>
			</div>
		</section>
	);
}

function IncidentsSection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">03 — INCIDENT_LOG</MonoTag>
				<MonoTag className="hidden sm:block">LAST 90 DAYS</MonoTag>
			</div>

			{PAST_INCIDENTS.map((incident, i) => (
				<article
					key={incident.id}
					className={`border-b border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
					style={{ transitionDelay: `${i * 100}ms` }}>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 md:px-12 py-4 bg-muted/30 border-b border-border">
						<span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase">{incident.id}</span>
						<span className="text-sm font-bold">{incident.title}</span>
						<span className={`font-mono text-[9px] tracking-[0.2em] border px-2 py-1 font-bold uppercase ${SEVERITY_STYLES[incident.severity]}`}>
							{incident.severity}
						</span>
						<span className={`font-mono text-[10px] tracking-[0.2em] font-bold uppercase ${STATUS_INCIDENT[incident.status]}`}>
							✓ {incident.status}
						</span>
						<span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{incident.date}</span>
					</div>
					<ul className="divide-y divide-border">
						{incident.updates.map((u, j) => (
							<li key={j} className="flex gap-5 px-6 md:px-12 py-3.5 text-sm">
								<span className="font-mono text-[11px] text-accent shrink-0 mt-0.5 w-20 font-semibold">{u.time}</span>
								<span className="text-muted-foreground leading-relaxed max-w-3xl">{u.message}</span>
							</li>
						))}
					</ul>
				</article>
			))}

			{/* upcoming maintenance strip */}
			<div
				className={`flex flex-col md:flex-row md:items-center gap-4 px-6 md:px-12 py-6 border-b border-border transition-all duration-700 delay-300 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				<Clock className="size-5 text-accent shrink-0" />
				<div className="flex-1">
					<p className="font-bold text-sm mb-1">
						Upcoming maintenance <span className="font-mono text-[10px] tracking-[0.2em] text-accent ml-2">MAR 8, 2026 · 01:00–03:00 UTC</span>
					</p>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Scheduled infrastructure upgrade. Analytics exports will be in read-only mode. All other services remain fully operational.
					</p>
				</div>
				<a
					href="/contact"
					className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-primary hover:text-accent transition-colors shrink-0">
					<Bell className="size-3" /> Subscribe
				</a>
			</div>
		</section>
	);
}
