import { SiteLayout } from "./site-layout";
import { CheckCircle2, AlertCircle, XCircle, Clock, Activity, Bell, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useInView, useCounter, SectionBadge } from "./shared";

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
		date: "Feb 19, 2025",
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
		date: "Feb 7, 2025",
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
		date: "Jan 25, 2025",
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

const STATUS_CONFIG: Record<ServiceStatus, { label: string; icon: typeof CheckCircle2; className: string; dot: string; bg: string }> = {
	operational: { label: "Operational", icon: CheckCircle2, className: "text-success", dot: "bg-success", bg: "bg-success/10 text-success border-success/25" },
	degraded: { label: "Degraded", icon: AlertCircle, className: "text-warning", dot: "bg-warning", bg: "bg-warning/10 text-warning border-warning/25" },
	outage: {
		label: "Outage",
		icon: XCircle,
		className: "text-destructive",
		dot: "bg-destructive",
		bg: "bg-destructive/10 text-destructive border-destructive/25",
	},
	maintenance: { label: "Maintenance", icon: Clock, className: "text-primary", dot: "bg-primary", bg: "bg-primary/10 text-primary border-primary/25" },
};

const SEVERITY_STYLES: Record<Incident["severity"], string> = {
	critical: "bg-destructive/10 text-destructive border-destructive/25",
	major: "bg-warning/10 text-warning border-warning/25",
	minor: "bg-muted text-muted-foreground border-border",
};

const STATUS_INCIDENT: Record<Incident["status"], string> = {
	resolved: "text-success",
	monitoring: "text-warning",
	investigating: "text-destructive",
};

const overallStatus: ServiceStatus = SERVICES.every((s) => s.status === "operational") ? "operational" : "degraded";
const OverallIcon = STATUS_CONFIG[overallStatus].icon;

export default function StatusPage() {
	const [heroVisible, setHeroVisible] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
	useEffect(() => {
		const id = requestAnimationFrame(() => setHeroVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);
	useEffect(() => {
		const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
		window.addEventListener("mousemove", handler);
		return () => window.removeEventListener("mousemove", handler);
	}, []);
	const statsRef = useInView();
	const c9997 = useCounter(9997, 1400, statsRef.inView); // → 99.97%
	const c0 = useCounter(0, 800, statsRef.inView);
	const c3 = useCounter(3, 900, statsRef.inView);
	const c15 = useCounter(15, 1000, statsRef.inView);

	return (
		<SiteLayout>
			{/* ── HERO ── */}
			<section className="relative pt-16 pb-20 md:pt-28 md:pb-24 border-b border-border overflow-hidden">
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
					<div
						className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
						style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
					/>
					<div
						className="absolute inset-0 opacity-[0.025]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
					/>
				</div>
				<div className="container mx-auto px-4 max-w-3xl text-center relative">
					<div className={`transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<SectionBadge icon={OverallIcon} label={overallStatus === "operational" ? "All systems operational" : "Some systems degraded"} />
						<h1 className="text-5xl md:text-[5rem] font-black mb-5 text-balance tracking-tight" style={{ lineHeight: 1.04 }}>
							System{" "}
							<span
								style={{
									background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}>
								Status
							</span>
						</h1>
						<p
							className={`text-xl text-muted-foreground text-pretty mb-3 leading-relaxed transition-all duration-1000 delay-150 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							Real-time status and sovereign performance history for all Pulse global services.
						</p>
						<p className="text-xs text-muted-foreground mb-8">Last updated: Feb 27, 2026 at 08:00 UTC</p>
						<div
							className={`flex flex-col sm:flex-row justify-center gap-3 transition-all duration-1000 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
							<Button size="xl" asChild className="group">
								<a href="/contact">
									<Bell className="mr-2 size-4" />
									Subscribe to updates
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
							<Button size="xl" variant="outline" asChild className="gap-2">
								<a href="/help">
									<RefreshCw className="size-4" />
									View SLA docs
								</a>
							</Button>
						</div>
					</div>

					{/* Stat strip */}
					<div
						ref={statsRef.ref as React.RefObject<HTMLDivElement>}
						className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 transition-all duration-1000 delay-400 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						{[
							{ icon: Activity, displayValue: `${(c9997 / 100).toFixed(2)}%`, label: "Overall uptime (90d)" },
							{ icon: CheckCircle2, displayValue: `${c0}`, label: "Active incidents" },
							{ icon: AlertCircle, displayValue: `${c3}`, label: "Incidents (90d)" },
							{ icon: Clock, displayValue: `< ${c15} min`, label: "Avg. resolution time" },
						].map(({ icon: Icon, displayValue, label }, i) => (
							<div
								key={label}
								className={`group relative flex flex-col items-center gap-1.5 py-6 px-4 rounded-2xl border transition-all duration-700 hover:-translate-y-1 hover:shadow-lg overflow-hidden cursor-default ${statsRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ background: "var(--color-card)", borderColor: "var(--color-border)", transitionDelay: `${i * 80}ms` }}>
								<div
									className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
									style={{
										background:
											"radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
									}}
								/>
								<Icon className="size-4 text-primary mb-0.5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
								<span
									className="text-2xl font-black relative z-10"
									style={{ color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>
									{displayValue}
								</span>
								<span className="text-xs text-muted-foreground relative z-10">{label}</span>
							</div>
						))}
					</div>
				</div>
			</section>
			<ServicesSection />
			<UptimeChartSection />
			<IncidentsSection />
			<StatusCtaSection />
		</SiteLayout>
	);
}

function ServicesSection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref} className="container mx-auto px-4 py-14 max-w-4xl">
			<h2
				className={`text-xl font-bold mb-6 flex items-center gap-2 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				<Activity className="size-5" style={{ color: "var(--color-primary)" }} />
				Services
			</h2>
			<div className="rounded-2xl border border-border overflow-hidden divide-y divide-border" style={{ background: "var(--color-card)" }}>
				<div
					className="hidden md:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground"
					style={{ background: "color-mix(in srgb, var(--color-muted) 40%, transparent)" }}>
					<span>Service</span>
					<span className="text-right pr-8">90-day uptime</span>
					<span className="text-right w-28">Status</span>
				</div>
				{SERVICES.map((service, i) => {
					const cfg = STATUS_CONFIG[service.status];
					const Icon = cfg.icon;
					return (
						<div
							key={service.name}
							className={`grid md:grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 transition-all duration-500 hover:bg-primary/4 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
							style={{ transitionDelay: `${i * 50 + 100}ms` }}>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-foreground">{service.name}</p>
								<p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
							</div>
							<div className="hidden md:block text-sm font-mono text-muted-foreground text-right pr-8">{service.uptime}</div>
							<div className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 md:w-28 md:justify-end ${cfg.className}`}>
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

function UptimeChartSection() {
	const { ref, inView } = useInView({ threshold: 0.1 });
	return (
		<section ref={ref} className="container mx-auto px-4 pb-14 max-w-4xl">
			<div className="rounded-2xl border border-border p-6 transition-all duration-700" style={{ background: "var(--color-card)" }}>
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-lg font-bold">90-day uptime history</h2>
					<span className="text-sm font-black text-success">99.97%</span>
				</div>
				<p className="text-xs text-muted-foreground mb-5">Each bar represents one day. Hover for details.</p>
				<div className="flex gap-px items-end h-10">
					{UPTIME_DAYS.map((day, i) => (
						<div
							key={i}
							title={`Day ${i + 1}: ${day === "operational" ? "Operational" : "Degraded"}`}
							className={`flex-1 rounded-sm cursor-default transition-all duration-500 hover:opacity-100 hover:scale-y-125 origin-bottom ${day === "operational" ? "bg-success/60" : day === "degraded" ? "bg-warning/70" : "bg-destructive/70"} ${inView ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"}`}
							style={{ transitionDelay: `${i * 6}ms`, transformOrigin: "bottom" }}
						/>
					))}
				</div>
				<div className="flex justify-between mt-2 text-xs text-muted-foreground">
					<span>90 days ago</span>
					<span>Today</span>
				</div>
				<div className="flex items-center gap-5 mt-4 text-xs text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-sm bg-success/60 inline-block" /> Operational
					</span>
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-sm bg-warning/70 inline-block" /> Degraded
					</span>
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-sm bg-destructive/70 inline-block" /> Outage
					</span>
				</div>
			</div>
		</section>
	);
}

function IncidentsSection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref} className="border-t border-border py-14" style={{ background: "color-mix(in srgb, var(--color-muted) 10%, transparent)" }}>
			<div className="container mx-auto px-4 max-w-4xl">
				<div
					className={`flex items-center justify-between mb-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
					<h2 className="text-xl font-bold">Past incidents</h2>
					<span className="text-sm text-muted-foreground">Last 90 days</span>
				</div>
				<div className="space-y-4">
					{PAST_INCIDENTS.map((incident, i) => (
						<div
							key={incident.id}
							className={`rounded-xl border border-border overflow-hidden transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ background: "var(--color-card)", transitionDelay: `${i * 100 + 100}ms` }}>
							<div
								className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-border"
								style={{ background: "color-mix(in srgb, var(--color-muted) 25%, transparent)" }}>
								<span className="text-sm font-bold text-foreground">{incident.title}</span>
								<span
									className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${SEVERITY_STYLES[incident.severity]}`}>
									{incident.severity}
								</span>
								<span className={`text-xs font-semibold capitalize ${STATUS_INCIDENT[incident.status]}`}>{incident.status}</span>
								<span className="ml-auto text-xs text-muted-foreground">{incident.date}</span>
							</div>
							<ul className="divide-y divide-border">
								{incident.updates.map((u, j) => (
									<li key={j} className="flex gap-4 px-6 py-3.5 text-sm">
										<span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5 w-20">{u.time}</span>
										<span className="text-muted-foreground leading-relaxed">{u.message}</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<div
					className={`relative mt-8 rounded-3xl border overflow-hidden p-7 flex flex-col md:flex-row items-start md:items-center gap-6 transition-all duration-700 delay-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
					style={{
						background: "linear-gradient(120deg, color-mix(in srgb, var(--color-primary) 6%, var(--color-card)), var(--color-card))",
						borderColor: "color-mix(in srgb, var(--color-primary) 25%, transparent)",
						boxShadow: "0 4px 30px -6px color-mix(in srgb, var(--color-primary) 10%, transparent)",
					}}>
					<div
						className="absolute inset-0 opacity-[0.03] pointer-events-none"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "30px 30px" }}
					/>
					<div
						className="size-14 rounded-2xl flex items-center justify-center shrink-0 relative z-10"
						style={{
							background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
							boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)",
						}}>
						<Clock className="size-7 text-primary" />
					</div>
					<div className="flex-1 relative z-10">
						<h3 className="font-bold text-lg mb-1">Upcoming maintenance</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Scheduled infrastructure upgrade on <strong className="text-foreground">Mar 8, 2026 01:00 – 03:00 UTC</strong>. Analytics exports
							will be in read-only mode. All other services remain fully operational.
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="shrink-0 relative z-10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
						<Bell className="size-3.5" />
						Subscribe to updates
					</Button>
				</div>
			</div>
		</section>
	);
}

function StatusCtaSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-20">
			<div
				className={`relative max-w-4xl mx-auto rounded-3xl overflow-hidden p-12 md:p-20 text-center transition-all duration-1000 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
				style={{
					background: "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 75%, var(--color-accent)) 100%)",
					boxShadow: "0 40px 100px -20px color-mix(in srgb, var(--color-primary) 40%, transparent)",
				}}>
				<div
					className="absolute inset-0 opacity-[0.07] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
				/>
				<div className="absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
				<div className="relative z-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-sm font-semibold text-white mb-8">
						<Bell className="size-3.5" /> Stay informed
					</div>
					<h2 className="text-4xl md:text-5xl font-black mb-5 text-white text-balance tracking-tight">Never miss an incident</h2>
					<p className="text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
						Subscribe to status updates by email, SMS, or webhook. Get notified the moment something changes.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button
							size="lg"
							asChild
							className="group px-8 bg-white hover:bg-white/90 font-bold"
							style={{ color: "var(--color-primary)" }}>
							<a href="/contact">
								Subscribe to updates
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button
							size="lg"
							variant="outline"
							asChild
							className="px-8 text-white border-white/35 hover:bg-white/10">
							<a href="/help">View SLA docs</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
