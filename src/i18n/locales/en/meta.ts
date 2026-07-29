// Per-page <title> and meta description, keyed by route.
// `useLocalizedSeo` appends " — Pulse" unless the title already brands itself.

const meta = {
	home: {
		title: "Pulse — Support that never skips a beat",
		description:
			"The AI support operating system. Unify every channel, automate triage, and resolve faster — for freelancers, agencies, and growing teams.",
	},
	pricing: {
		title: "Pricing",
		description:
			"Transparent per-agent pricing with a 14-day free trial. No credit card required, no setup fees, cancel anytime.",
	},
	features: {
		title: "Features",
		description:
			"Unified inbox, AI automation, a growing integration marketplace, and the team controls to run support at any scale.",
	},
	about: {
		title: "About",
		description:
			"Why we're building Pulse: support tools should scale from one person to a global team without changing how you work.",
	},
	contact: {
		title: "Contact",
		description: "Talk to our team about plans, migrations, or a demo. No pressure and no sales scripts.",
	},
	customers: {
		title: "Customers",
		description:
			"How support teams, agencies, and solo consultants use Pulse to resolve faster and keep every client organized.",
	},
	integrations: {
		title: "Integrations",
		description:
			"Connect your CRM, billing, and messaging tools to Pulse. A growing marketplace plus an extensible API.",
	},
	help: {
		title: "Help Center",
		description: "Guides, answers, and troubleshooting for getting the most out of Pulse.",
	},
	status: {
		title: "Status",
		description: "Live operational status, uptime history, and incident reports for the Pulse platform.",
	},
	blog: {
		title: "Blog",
		description: "Notes on support operations, AI automation, and building Pulse.",
	},
	changelog: {
		title: "Changelog",
		description: "Every release, fix, and improvement shipped to Pulse.",
	},
	careers: {
		title: "Careers",
		description: "Open roles at Pulse. Remote-first, small team, high ownership.",
	},
	security: {
		title: "Security",
		description:
			"SOC 2 Type II, GDPR compliance, encryption in transit and at rest, and regional data residency for Enterprise.",
	},
	privacy: {
		title: "Privacy Policy",
		description: "How Pulse collects, uses, shares, and protects your information.",
	},
	terms: {
		title: "Terms of Service",
		description: "The agreement that governs your use of Pulse.",
	},
	solutionSupportTeams: {
		title: "Pulse for Support Teams",
		description:
			"Manage high-volume queues with AI triage, skill-based routing, workload balancing, and real-time analytics.",
	},
	solutionAgencies: {
		title: "Pulse for Agencies",
		description:
			"Run support for every client from one workspace — separate queues, per-client reporting, and no tool sprawl.",
	},
	solutionSolo: {
		title: "Pulse for Solo & Small Teams",
		description: "Keep every request organized without enterprise complexity. Set up in minutes, not weeks.",
	},
} as const;

export type MetaDict = { [K in keyof typeof meta]: { title: string; description: string } };
export default meta as MetaDict;
