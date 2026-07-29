// Landing page copy.
//
// The hero headline is split into `lead` / `highlight` / `trail` because the
// editorial design prints the highlighted word inside an inverted primary
// block — translations move that word, so its position has to be data, not
// hardcoded JSX.

const landing = {
	hero: {
		eyebrow: "LIVE — AI SUPPORT OPERATING SYSTEM",
		headline: {
			lead: "Support that never",
			highlight: "skips",
			trail: "a beat.",
		},
		seeHow: "See how it works",
		ctaPrimary: "Start free — 14 days",
		ctaSecondary: "See pricing",
	},

	personas: {
		supportTeams: {
			label: "Support Teams",
			desc: "Manage high-volume queues with automation, routing, and real-time analytics.",
		},
		agencies: {
			label: "Agencies",
			desc: "Run support for multiple clients from a single, organized workspace.",
		},
		solo: {
			label: "Solo & Small Teams",
			desc: "Keep every request organized without the complexity. Set up in minutes.",
		},
	},

	console: {
		feed: "PULSE://LIVE_FEED",
		rec: "REC",
		statusResolving: "⚡ AI RESOLVING",
		statusResolved: "✓ RESOLVED",
		statusOpen: "○ OPEN",
		latency: "LATENCY 0.3S",
		aiResolved: "AI-RESOLVED 68%",
		uptime: "UPTIME 99.99%",
		agentAi: "AI Agent",
		agentUnassigned: "Unassigned",
		priority: {
			high: "high",
			medium: "medium",
			low: "low",
		},
		tickets: {
			invoice: "Invoice not received after payment",
			onboarding: "Onboarding support — Acme Inc.",
			darkMode: "Feature request: dark mode toggle",
			dashboard: "Can't access my account dashboard",
			refund: "Refund request — order #8812",
			passwordReset: "Password reset email not arriving",
			siteDown: "Urgent: client site unreachable",
		},
		time: {
			now: "now",
		},
	},

	ticker: [
		"CONTOSO ▲ 70% FASTER RESOLUTION",
		"FABRIKAM ▲ 8 CLIENTS · ONE INBOX",
		"NORTHWIND ▲ 12K TICKETS / MO",
		"TAILWIND ▲ 96% CSAT",
		"LITWARE ▲ SETUP IN 5 MIN",
		"WINGTIP ▲ 99.99% UPTIME",
		"PROSEWARE ▲ 41% AUTO-RESOLVED",
		"ADVENTURE WORKS ▲ 24/7 COVERAGE",
	] as string[],

	stats: {
		fasterResolution: { label: "FASTER RESOLUTION", sub: "vs. traditional helpdesks" },
		ticketsPerMonth: { label: "TICKETS / MONTH", sub: "handled across workspaces" },
		satisfaction: { label: "CUSTOMER SATISFACTION", sub: "average CSAT score" },
		scale: { label: "SOLO TO ENTERPRISE", sub: "scales with your team" },
	},

	bento: {
		sectionLabel: "PLATFORM",
		sectionTitle: "Built for how you actually work",
		sectionRight: "4 MODULES / 1 SYSTEM",
		intro: "Four modules, one heartbeat. Everything your support operation needs — nothing it doesn't.",
		unification: {
			label: "Unification",
			title: "All your channels, one place",
			description:
				"Email, chat, web widgets — everything lands in a single inbox. No more tab-switching, no more missed messages.",
			bullets: ["Unified inbox for every channel", "Multi-source sync", "Consistent experience everywhere"] as string[],
		},
		automation: {
			label: "Automation",
			title: "Classify, route, and resolve automatically",
			description:
				"AI triages incoming tickets, routes them to the right place, and resolves the common ones — instantly.",
			bullets: ["Smart AI classification", "Dynamic routing rules", "End-to-end auto-resolution"] as string[],
		},
		marketplace: {
			label: "Marketplace",
			title: "Extend with the tools you already use",
			description:
				"Connect your CRM, billing system, or any tool you rely on. A growing ecosystem of integrations.",
			bullets: ["One-click integrations", "Custom app ecosystem", "Extensible API"] as string[],
		},
		platform: {
			label: "Platform",
			title: "Manage people, queues, and workflows",
			description:
				"Whether it's one person or a hundred, Pulse gives you the controls to stay organized and balance load.",
			bullets: ["Team & workload balancing", "Advanced workflow builder", "Performance analytics"] as string[],
		},
	},

	visuals: {
		aiAgent: {
			header: "AI_AGENT // AVG_RESOLVE 18S",
			steps: {
				received: { label: "Ticket received", detail: '"Invoice not received after payment"' },
				classifying: { label: "AI classifying…", detail: "Category: Billing · Priority: High" },
				knowledge: { label: "Knowledge base search", detail: "Found 2 relevant articles in 0.3s" },
				sent: { label: "Response sent", detail: "Resolution delivered. CSAT request queued." },
			},
		},
		widget: { embed: "WIDGET.EMBED" },
		teams: {
			header: "QUEUE_OVERVIEW",
			active: "4 ACTIVE",
			ticketsLabel: "TICKETS",
			agentAi: "AI Agent",
		},
	},

	process: {
		sectionLabel: "03 — PROCESS",
		sectionRight: "REQUEST → RESOLVED",
		headline: { lead: "From request to resolved —", highlight: "in seconds." },
		subhead: "Three steps. Works for any size.",
		steps: {
			connect: {
				title: "Connect your channels",
				desc: "Bring every conversation into one place — email, chat, forms. Takes minutes, not days.",
			},
			sort: {
				title: "Let AI do the sorting",
				desc: "Pulse classifies, prioritizes, and routes every request automatically. No manual triage.",
			},
			resolve: {
				title: "Resolve faster",
				desc: "Your team focuses on what actually needs a human. Everything else gets handled.",
			},
		},
	},

	testimonials: {
		sectionLabel: "04 — TRANSMISSIONS",
		incoming: "INCOMING",
		logPrefix: "LOG_",
		items: {
			contoso: {
				quote: "Unifying our channels through Pulse reduced resolution time by 70%. Our team finally has breathing room.",
				role: "Head of Customer Success",
				segment: "SUPPORT TEAMS",
			},
			bright: {
				quote:
					"Managing 8 clients used to mean 8 different tools. Pulse collapsed it into one. Our clients are happier and we win new business because of how we report on it.",
				role: "Operations Lead",
				segment: "AGENCIES",
			},
			torres: {
				quote:
					"I run support solo for three SaaS products. Pulse is the first tool that didn't feel like it was built for a 50-person team. Setup took 10 minutes.",
				role: "Independent Consultant",
				segment: "SOLO & SMALL TEAMS",
			},
		},
	},

	trust: {
		setup: { title: "SETUP IN 5 MIN", desc: "No IT team required" },
		compliance: { title: "SOC 2 & GDPR", desc: "Enterprise-grade security" },
		uptime: { title: "99.9% UPTIME SLA", desc: "Reliable at any scale" },
		seats: { title: "1 OR 1,000 SEATS", desc: "Freelancer to global org" },
	},

	finalCta: {
		eyebrow: "05 — DEPLOY · NO CREDIT CARD · 14-DAY TRIAL",
		headline: { lead: "Put support on", highlight: "autopilot." },
		subhead: "Works for freelancers, agencies, and growing teams. Live in five minutes.",
		ctaPrimary: "Start free trial",
		ctaSecondary: "View pricing",
	},
};

export type LandingDict = typeof landing;
export default landing;
