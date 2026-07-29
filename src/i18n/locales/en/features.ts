// Features page copy.
//
// Filter tabs are matched by a stable id in the component; only `label` is
// translated, so a translation can never break the filter.

const features = {
	hero: {
		eyebrow: "SYS.MODULES — FULL CAPABILITY INDEX",
		headline: { lead: "Built for the", highlight: "next era", trail: "of support" },
		subhead:
			"From unified inbox to AI automation — everything you need to deliver great support, whether you're a solo consultant or a global team.",
		ctaPrimary: "Start free trial",
		ctaSecondary: "See pricing",
	},

	stats: {
		autoResolved: "AUTO-RESOLVED",
		routingLatency: "ROUTING LATENCY",
		uptimeSla: "UPTIME SLA",
		businessImpact: "BUSINESS IMPACT",
	},

	index: {
		sectionLabel: "CAPABILITY INDEX",
		sectionTitle: "The Pulse ecosystem",
		sectionRight: "{count} MODULES REGISTERED",
		intro: "The pillars of the most advanced support orchestration platform. Filter by domain.",
	},

	tabs: {
		all: "All",
		omnichannel: "Omnichannel",
		aiAutomation: "AI Automation",
		marketplace: "Marketplace",
		intelligence: "Intelligence",
		security: "Security",
	},

	modules: {
		resolution: {
			title: "Autonomous Resolution",
			description:
				"Pulse AI resolves up to 80% of support volume without human intervention. Pulse handles the routine so your team focuses on what actually needs a human.",
			bullets: [
				"Intent & sentiment detection",
				"Zero-latency auto-resolution",
				"Seamless agent handoff",
				"Self-learning resolution engine",
			] as string[],
			statLabel: "AUTONOMOUS RESOLUTION",
		},
		routing: {
			title: "Intelligent Routing",
			description:
				"Dynamic workload balancing that routes every ticket based on agent expertise, priority, and real-time operational capacity.",
			bullets: [
				"Skill-based matchmaking",
				"Predictive SLA enforcement",
				"Priority queue orchestration",
				"Capacity-aware distribution",
			] as string[],
			statLabel: "MAX ROUTING LATENCY",
		},
		omnichannel: {
			title: "Omnichannel Unification",
			description:
				"Converge WhatsApp, Email, Teams, and Voice into a single, unified thread. No silos, just fluid conversations.",
			bullets: [
				"Native WhatsApp & Teams",
				"Unified customer context",
				"Cross-channel history",
				"Instant channel switching",
			] as string[],
			statLabel: "CHANNELS UNIFIED",
		},
		marketplace: {
			title: "Pulse Marketplace",
			description:
				"Empower your agents with a deep ecosystem of integrations that bring business data directly into the support flow.",
			bullets: [
				"CRM & Billing deep-links",
				"Custom app development SDK",
				"One-click tool activation",
				"Automated workflow actions",
			] as string[],
			statLabel: "INTEGRATIONS AVAILABLE",
		},
		intelligence: {
			title: "Predictive Intelligence",
			description:
				"Move beyond descriptive reports. Leverage AI to forecast volume trends and identify friction points before they escalate.",
			bullets: [
				"Volume forecasting models",
				"Automated friction analysis",
				"Agent performance scoring",
				"Business impact reporting",
			] as string[],
			statLabel: "AVG. CSAT IMPACT",
		},
		security: {
			title: "Security & Reliability",
			description: "SOC 2, GDPR, and 99.99% uptime — built for teams that can't afford downtime, at any scale.",
			bullets: [
				"SOC 2 Type II compliance",
				"Regional data residency",
				"Advanced RBAC & SSO",
				"End-to-end data encryption",
			] as string[],
			statLabel: "UPTIME GUARANTEE",
		},
	},

	fieldReports: {
		sectionLabel: "02 — FIELD REPORTS",
		sectionRight: "VERIFIED CUSTOMERS",
		logPrefix: "LOG_0",
		items: {
			torres: {
				quote:
					"I switched from three different email inboxes to Pulse in a weekend. Now everything is in one place and I'm not dropping client requests.",
				role: "Independent Consultant, Torres Digital",
			},
			bright: {
				quote:
					"Pulse Core gave our agency exactly what we needed — separate client workflows and real visibility into what's happening across all our accounts.",
				role: "Operations Lead, BrightSupport Agency",
			},
			finstream: {
				quote:
					"Pulse transformed our support from a cost center into a CSAT driver. The autonomous routing paid back in week one.",
				role: "Director of Ops, FinStream",
			},
		},
	},

	finalCta: {
		tag: "03 — DEPLOY · 14-DAY TRIAL · NO COMMITMENT",
		headline: { lead: "Deploy Pulse in", highlight: "minutes." },
		desc: "Experience the power of autonomous support. Full access trial, no commitment required.",
		primary: "Start free trial",
		secondary: "Talk to sales",
	},
};

export type FeaturesDict = typeof features;
export default features;
