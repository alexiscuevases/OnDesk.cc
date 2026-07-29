// Help centre. Category slugs (used in `/help/<slug>` URLs) and article counts
// live in the component — the original derived the slug from the English label,
// which would have produced broken URLs once translated.

const help = {
	hero: {
		eyebrow: "KNOWLEDGE_BASE — 350+ ARTICLES INDEXED",
		headline: { lead: "How can", highlight: "we help?" },
		subhead: "Find answers, browse guides, or reach out — we're here for every kind of Pulse user.",
		queryLabel: "QUERY",
		docsIndexed: "{count}+ DOCS INDEXED",
		searchPlaceholder: "Search the index...",
		noResults: "No articles matched.",
		contactSupport: "Contact support",
		stats: {
			response: { value: "< 1 HR", label: "AVG RESPONSE TIME" },
			satisfaction: { value: "98%", label: "SATISFACTION RATE" },
			articles: { value: "350+", label: "ARTICLES PUBLISHED" },
		},
	},

	popularQueries: [
		"Reset password",
		"Connect Gmail",
		"Custom email domain",
		"Export tickets CSV",
		"Two-factor auth",
		"SLA breach alert",
	] as string[],

	quickAccess: {
		sectionLabel: "01 — QUICK ACCESS",
		sectionRight: "SHORTCUTS",
		links: {
			video: { label: "Video tutorials", description: "25+ walkthroughs" },
			api: { label: "API reference", description: "REST & webhook docs" },
			releases: { label: "Release notes", description: "What changed and why" },
			community: { label: "Community forum", description: "Ask fellow users" },
		},
	},

	index: {
		sectionLabel: "INDEX",
		sectionTitle: "Browse by category",
		sectionRight: "{count} CATEGORIES / 350+ DOCS",
		docsCount: "{count} DOCS",
		popularBadge: "POPULAR",
		viewAll: "View all {count} articles",
	},

	categories: {
		gettingStarted: {
			label: "Getting Started",
			description: "Set up your workspace, invite your team, and connect your channels.",
			articles: {
				account: "Creating your Pulse account",
				channel: "Connecting your first channel",
				team: "Inviting your team and setting roles",
				import: "Importing existing tickets from Zendesk / Freshdesk",
			},
		},
		aiCore: {
			label: "Pulse AI Core",
			description: "Deploying and fine-tuning autonomous resolution agents.",
			articles: {
				triage: "How AI Agents triage incoming tickets",
				escalation: "Configuring escalation rules",
				training: "Training the AI on your knowledge base",
				review: "Reviewing and editing AI-drafted replies",
			},
		},
		automations: {
			label: "Automations & SLAs",
			description: "Workflows, SLA policies, and routing rules.",
			articles: {
				sla: "Creating your first SLA policy",
				triggers: "Building automation rules with triggers",
				routing: "Skill-based routing setup",
				reference: "Automation rules reference",
			},
		},
		teams: {
			label: "Teams & Roles",
			description: "Permissions, shifts, and workload management.",
			articles: {
				rbac: "Understanding role-based access control",
				heatmaps: "Configuring team workload heatmaps",
				shifts: "Setting up shift schedules",
				supervisor: "Supervisor dashboards and live monitoring",
			},
		},
		analytics: {
			label: "Analytics & Reports",
			description: "CSAT, NPS, volume trends, and exports.",
			articles: {
				csat: "Understanding your CSAT dashboard",
				export: "Exporting reports to Excel / Power BI",
				forecast: "Setting up volume forecast alerts",
				performance: "Agent performance report guide",
			},
		},
		billing: {
			label: "Billing & Plans",
			description: "Subscriptions, invoices, and seat management.",
			articles: {
				plan: "Upgrading or downgrading your plan",
				seats: "Managing seats and adding users",
				invoices: "Downloading invoices",
				cycle: "Annual vs monthly billing",
			},
		},
	},

	finalCta: {
		tag: "03 — ESCALATE · HUMAN SUPPORT",
		headline: { lead: "Talk to a", highlight: "human." },
		desc: "Our support team typically responds within 2 hours on business days.",
		primary: "Contact support",
		secondary: "Check system status",
	},
};

export type HelpDict = typeof help;
export default help;
