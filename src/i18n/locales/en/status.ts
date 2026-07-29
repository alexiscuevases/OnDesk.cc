// Status page. Service/incident ids, severity ids and colour classes live in the
// component; labels, descriptions and dates are localized.

const status = {
	hero: {
		eyebrowPrefix: "SYS.STATUS",
		allOperational: "ALL SYSTEMS OPERATIONAL",
		degraded: "DEGRADED PERFORMANCE",
		headline: { lead: "Every system,", highlight: "on the record" },
		subhead: "Real-time status and performance history for all Pulse global services.",
		lastUpdated: "LAST UPDATED: FEB 27, 2026 · 08:00 UTC",
		ctaPrimary: "Subscribe to updates",
		ctaSecondary: "View SLA docs",
		stats: {
			uptime: "OVERALL UPTIME (90D)",
			active: "ACTIVE INCIDENTS",
			incidents: "INCIDENTS (90D)",
			resolution: "AVG RESOLUTION TIME",
			resolutionValue: "< {count} MIN",
		},
	},

	statusLabels: {
		operational: "OPERATIONAL",
		degraded: "DEGRADED",
		outage: "OUTAGE",
		maintenance: "MAINTENANCE",
	},

	services: {
		sectionLabel: "01 — SERVICES",
		sectionRight: "{count} MONITORED ENDPOINTS",
		columnService: "SERVICE",
		columnUptime: "UPTIME (90D)",
		columnStatus: "STATUS",
		items: {
			ingestion: { name: "Ticket Ingestion", description: "Email, Teams, and API ticket creation", uptime: "100.00%" },
			ai: { name: "AI Engine", description: "AI classification, routing, and automated resolution", uptime: "99.98%" },
			integrations: {
				name: "Third-party Integrations",
				description: "Microsoft 365, Google Workspace, and external app integrations",
				uptime: "99.97%",
			},
			dashboard: { name: "Dashboard & Web App", description: "Agent and admin UI", uptime: "100.00%" },
			analytics: { name: "Analytics & Reports", description: "Real-time dashboards and exports", uptime: "99.99%" },
			mobile: { name: "Pulse Mobile", description: "iOS and Android native orchestration apps", uptime: "99.96%" },
			api: { name: "API", description: "Public REST and webhook APIs", uptime: "100.00%" },
			notifications: { name: "Notifications", description: "Email, Teams, and push alerts", uptime: "99.95%" },
		},
	},

	uptime: {
		sectionLabel: "02 — UPTIME_HISTORY",
		overall: "99.97%",
		caption: "90 DAYS · EACH BAR = ONE DAY · HOVER FOR DETAIL",
		dayTooltip: "Day {day}: {state}",
		rangeStart: "−90D",
		rangeEnd: "TODAY",
		legendOperational: "OPERATIONAL",
		legendDegraded: "DEGRADED",
		legendOutage: "OUTAGE",
	},

	incidents: {
		sectionLabel: "03 — INCIDENT_LOG",
		sectionRight: "LAST 90 DAYS",
		severities: { critical: "critical", major: "major", minor: "minor" },
		states: { resolved: "resolved", monitoring: "monitoring", investigating: "investigating" },
		items: {
			"inc-024": {
				title: "Elevated AI response latency",
				date: "FEB 19, 2025",
				updates: [
					{
						time: "14:32 UTC",
						message:
							"Resolved. Root cause analysis identified a saturated auto-scaling cluster. Median Pulse AI response time is restored to baseline (<800 ms).",
					},
					{
						time: "13:58 UTC",
						message: "Investigating elevated p99 latency on AI Agent Engine. Ticket creation and delivery are unaffected.",
					},
				],
			},
			"inc-023": {
				title: "Notification delivery delay",
				date: "FEB 7, 2025",
				updates: [
					{ time: "09:14 UTC", message: "Integration API throttling resolved. All queued notifications delivered." },
					{
						time: "08:41 UTC",
						message: "Third-party integration API experiencing throttling. Some notifications delayed up to 15 minutes. No tickets lost.",
					},
				],
			},
			"inc-022": {
				title: "Scheduled maintenance — database upgrade",
				date: "JAN 25, 2025",
				updates: [
					{ time: "03:00 UTC", message: "Maintenance complete. All services fully operational." },
					{ time: "01:00 UTC", message: "Scheduled maintenance window started. Read-only mode active for analytics exports." },
				],
			},
		},
		upcoming: {
			title: "Upcoming maintenance",
			window: "MAR 8, 2026 · 01:00–03:00 UTC",
			desc: "Scheduled infrastructure upgrade. Analytics exports will be in read-only mode. All other services remain fully operational.",
			cta: "Subscribe",
		},
	},

	finalCta: {
		tag: "04 — SUBSCRIBE · EMAIL / SMS / WEBHOOK",
		headline: { lead: "Never miss an", highlight: "incident." },
		desc: "Subscribe to status updates by email, SMS, or webhook. Get notified the moment something changes.",
		primary: "Subscribe to updates",
		secondary: "View SLA docs",
	},
};

export type StatusDict = typeof status;
export default status;
