import { SiteLayout } from "./site-layout";
import { CheckCircle2, AlertCircle, XCircle, Clock, Activity, Bell, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
	{ name: "AI Agent Engine", description: "Automated triage, classification, and replies", status: "operational", uptime: "99.98%" },
	{ name: "Microsoft 365 Integration", description: "Teams, Outlook, SharePoint, Azure AD sync", status: "operational", uptime: "99.97%" },
	{ name: "Dashboard & Web App", description: "Agent and admin UI", status: "operational", uptime: "100.00%" },
	{ name: "Analytics & Reports", description: "Real-time dashboards and exports", status: "operational", uptime: "99.99%" },
	{ name: "Mobile App", description: "iOS and Android native apps", status: "operational", uptime: "99.96%" },
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
				message: "Resolved. Root cause was a misconfigured auto-scaling rule. Median AI response time is back to baseline (<800 ms).",
			},
			{ time: "13:58 UTC", message: "Investigating elevated p99 latency on AI Agent Engine. Ticket creation and delivery are unaffected." },
		],
	},
	{
		id: "inc-023",
		title: "Teams notification delay",
		severity: "minor",
		status: "resolved",
		date: "Feb 7, 2025",
		updates: [
			{ time: "09:14 UTC", message: "Resolved. Microsoft Graph API throttling lifted. All queued notifications delivered." },
			{ time: "08:41 UTC", message: "Microsoft Graph API experiencing throttling. Teams notifications delayed up to 15 minutes. No tickets lost." },
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
	return (
		<SiteLayout>
			{/* Hero */}
			<section className={`py-20 md:py-24 border-b border-border ${overallStatus === "operational" ? "bg-success/5" : "bg-warning/5"}`}>
				<div className="container mx-auto px-4 max-w-3xl text-center">
					<div className="flex justify-center mb-5">
						<div
							className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-semibold ${STATUS_CONFIG[overallStatus].bg}`}>
							<span className={`size-2.5 rounded-full animate-pulse ${STATUS_CONFIG[overallStatus].dot}`} />
							<OverallIcon className="size-4" />
							{overallStatus === "operational" ? "All systems operational" : "Some systems degraded"}
						</div>
					</div>
					<h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">System Status</h1>
					<p className="text-lg text-muted-foreground text-pretty mb-4">
						Real-time status and 90-day uptime history for all SupportDesk 365 services.
					</p>
					<p className="text-xs text-muted-foreground">Last updated: Feb 27, 2026 at 08:00 UTC</p>

					<div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
						<Button variant="outline" size="sm" className="gap-2">
							<Bell className="size-3.5" />
							Subscribe to updates
						</Button>
						<Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
							<RefreshCw className="size-3.5" />
							Auto-refreshes every 60s
						</Button>
					</div>
				</div>
			</section>

			{/* Overall uptime metrics */}
			<section className="border-b border-border">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border max-w-4xl mx-auto">
						{[
							{ value: "99.97%", label: "Overall uptime (90d)" },
							{ value: "0", label: "Active incidents" },
							{ value: "3", label: "Incidents (90d)" },
							{ value: "< 15 min", label: "Avg. resolution time" },
						].map(({ value, label }) => (
							<div key={label} className="flex flex-col items-center justify-center gap-1 bg-card py-8 text-center">
								<div className="text-2xl font-bold">{value}</div>
								<div className="text-xs text-muted-foreground">{label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Services */}
			<section className="container mx-auto px-4 py-14 max-w-4xl">
				<h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
					<Activity className="size-5 text-primary" />
					Services
				</h2>
				<div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
					{/* Table header */}
					<div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						<span>Service</span>
						<span className="text-right pr-8">90-day uptime</span>
						<span className="text-right w-28">Status</span>
					</div>
					{SERVICES.map((service) => {
						const cfg = STATUS_CONFIG[service.status];
						const Icon = cfg.icon;
						return (
							<div
								key={service.name}
								className="grid md:grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
								<div className="min-w-0">
									<p className="text-sm font-medium text-foreground">{service.name}</p>
									<p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
								</div>
								<div className="hidden md:block text-sm font-mono text-muted-foreground text-right pr-8">{service.uptime}</div>
								<div className={`flex items-center gap-1.5 text-xs font-medium shrink-0 md:w-28 md:justify-end ${cfg.className}`}>
									<Icon className="size-3.5" />
									{cfg.label}
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Uptime history */}
			<section className="container mx-auto px-4 pb-14 max-w-4xl">
				<div className="rounded-2xl border border-border bg-card p-6">
					<div className="flex items-center justify-between mb-2">
						<h2 className="text-lg font-semibold">90-day uptime history</h2>
						<span className="text-sm font-semibold text-success">99.97%</span>
					</div>
					<p className="text-xs text-muted-foreground mb-5">Each bar represents one day. Hover for details.</p>

					{/* Bar chart */}
					<div className="flex gap-px items-end h-10">
						{UPTIME_DAYS.map((day, i) => (
							<div
								key={i}
								title={`Day ${i + 1}: ${day === "operational" ? "Operational" : "Degraded"}`}
								className={`flex-1 rounded-sm transition-all hover:opacity-80 hover:scale-y-110 h-full cursor-default ${day === "operational" ? "bg-success/60" : day === "degraded" ? "bg-warning/70" : "bg-destructive/70"}`}
							/>
						))}
					</div>
					<div className="flex justify-between mt-2 text-xs text-muted-foreground">
						<span>90 days ago</span>
						<span>Today</span>
					</div>

					{/* Legend */}
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

			{/* Past incidents */}
			<section className="border-t border-border bg-muted/10 py-14">
				<div className="container mx-auto px-4 max-w-4xl">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-xl font-semibold">Past incidents</h2>
						<span className="text-sm text-muted-foreground">Last 90 days</span>
					</div>
					<div className="space-y-4">
						{PAST_INCIDENTS.map((incident) => (
							<div key={incident.id} className="rounded-xl border border-border bg-card overflow-hidden">
								<div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-border bg-muted/20">
									<span className="text-sm font-semibold text-foreground">{incident.title}</span>
									<span
										className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${SEVERITY_STYLES[incident.severity]}`}>
										{incident.severity}
									</span>
									<span className={`text-xs font-medium capitalize ${STATUS_INCIDENT[incident.status]}`}>{incident.status}</span>
									<span className="ml-auto text-xs text-muted-foreground">{incident.date}</span>
								</div>
								<ul className="divide-y divide-border">
									{incident.updates.map((u, i) => (
										<li key={i} className="flex gap-4 px-6 py-3.5 text-sm">
											<span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5 w-20">{u.time}</span>
											<span className="text-muted-foreground leading-relaxed">{u.message}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					{/* Scheduled maintenance notice */}
					<div className="mt-8 p-5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
						<Clock className="size-5 text-primary shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-semibold mb-1">Upcoming maintenance</p>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Scheduled infrastructure upgrade on <strong className="text-foreground">Mar 8, 2026 01:00 – 03:00 UTC</strong>. Analytics
								exports will be in read-only mode. All other services remain fully operational.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Subscribe CTA */}
			<section className="border-t border-border py-14">
				<div className="container mx-auto px-4 text-center max-w-lg">
					<Bell className="size-8 text-primary mx-auto mb-4" />
					<h2 className="text-2xl font-bold mb-3">Never miss an incident</h2>
					<p className="text-muted-foreground text-sm mb-6 leading-relaxed">
						Subscribe to status updates by email, SMS, or webhook. Get notified the moment something changes.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button size="lg" asChild className="group h-11 px-7">
							<a href="/contact">
								Subscribe to updates
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="h-11 px-7">
							<a href="/help">View SLA docs</a>
						</Button>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
