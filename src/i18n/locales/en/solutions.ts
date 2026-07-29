// Solution pages — one per segment, all three rendered by solution-page.tsx.
// Icons and ordering live in that component, paired to these keys.

const solutions = {
	chrome: {
		ctaPrimary: "Start free trial",
		ctaSecondary: "See pricing",
		capabilitiesLabel: "CAPABILITIES",
		capabilitiesRight: "BUILT-IN / NO ADD-ONS",
		processLabel: "02 — PROCESS",
		processRight: "REQUEST → RESOLVED",
		transmissionLabel: "03 — TRANSMISSION",
		verifiedCustomer: "VERIFIED CUSTOMER",
		deployLabel: "04 — DEPLOY",
	},

	supportTeams: {
		badge: "For Support Teams",
		code: "SEG_01 / SUPPORT_TEAMS",
		headline: { lead: "Handle more tickets", highlight: "without growing", trail: "your team" },
		description:
			"Pulse brings every channel, agent, and workflow into a single command center. Stop context-switching. Start resolving.",
		stats: {
			resolution: { value: "80%", label: "Faster resolution" },
			volume: { value: "50K+", label: "Tickets/month handled" },
			satisfaction: { value: "95%", label: "Customer satisfaction" },
		},
		featuresHeadline: "Everything your support team needs",
		features: {
			triage: {
				title: "AI-powered triage",
				desc: "Auto-classify, prioritize, and route every ticket the moment it arrives. No manual sorting, no missed requests.",
			},
			team: {
				title: "Team & workload management",
				desc: "See your entire team's queue at a glance. Balance loads automatically and prevent agent burnout.",
			},
			sla: {
				title: "SLA tracking",
				desc: "Define SLAs per channel or priority. Get alerts before deadlines slip — never miss a commitment again.",
			},
			analytics: {
				title: "Performance analytics",
				desc: "Measure resolution times, CSAT scores, and agent output from one unified dashboard.",
			},
		},
		stepsHeadline: "From chaos to resolved — in minutes",
		steps: {
			connect: { title: "Connect your channels", desc: "Bring email, chat, and social into one inbox. Takes minutes, not days." },
			rules: { title: "Define your rules", desc: "Set SLAs, routing logic, and automation flows once. Pulse handles the rest." },
			ai: {
				title: "Let AI handle the volume",
				desc: "Pulse classifies and routes every ticket while your team focuses on what actually needs a human.",
			},
		},
		testimonial: {
			quote:
				"Unifying our channels through Pulse reduced resolution time by 70%. The AI classification acts with surgical precision — our team finally has breathing room.",
			role: "Head of Customer Success",
		},
		ctaBadge: "Support Teams",
		ctaHeadline: "Ready to put your queue on autopilot?",
		ctaDesc: "14-day free trial. No credit card. Unified support and automation from day one.",
	},

	agencies: {
		badge: "For Agencies",
		code: "SEG_02 / AGENCIES",
		headline: { lead: "Manage every client's support", highlight: "from one place", trail: "" },
		description:
			"One platform. Multiple clients. Full visibility. Stop juggling tabs and tools — Pulse gives your agency a professional support operation at scale.",
		stats: {
			resolution: { value: "8+", label: "Clients per workspace" },
			volume: { value: "60%", label: "Less operational overhead" },
			satisfaction: { value: "100%", label: "Client data isolation" },
		},
		featuresHeadline: "Built for agencies that run support for others",
		features: {
			triage: {
				title: "Multi-client workspaces",
				desc: "Every client gets a fully isolated environment with their own channels, agents, and data. No cross-contamination.",
			},
			team: {
				title: "Branded client inboxes",
				desc: "Set up custom-branded inboxes for each client. Your agency delivers a polished, professional experience.",
			},
			sla: {
				title: "Cross-client reporting",
				desc: "Aggregate or per-client reports in one click. Show your clients exactly what your team is delivering.",
			},
			analytics: {
				title: "Role-based access",
				desc: "Control exactly who sees what. Assign agents to specific clients only — no accidental data exposure.",
			},
		},
		stepsHeadline: "Onboard a new client in under an hour",
		steps: {
			connect: {
				title: "Create a client workspace",
				desc: "Each client gets their own isolated space in minutes. No technical setup required.",
			},
			rules: {
				title: "Connect their channels",
				desc: "Plug in their email, chat widget, and social accounts. Pulse unifies them immediately.",
			},
			ai: {
				title: "Report and retain",
				desc: "Generate per-client performance reports that prove your agency's value — and help you win renewals.",
			},
		},
		testimonial: {
			quote:
				"Managing 8 clients used to mean 8 different tools. Pulse collapsed it into one. Our team is faster, our clients are happier, and we win new business because of how we report on it.",
			role: "Operations Lead",
		},
		ctaBadge: "Agencies",
		ctaHeadline: "Your clients deserve better support. Start delivering it.",
		ctaDesc: "14-day free trial. Set up your first client workspace in under an hour.",
	},

	solo: {
		badge: "For Solo & Small Teams",
		code: "SEG_03 / SOLO_SMALL_TEAMS",
		headline: { lead: "Stay on top of every request", highlight: "without the complexity", trail: "" },
		description:
			"Built for one person or a small crew. Pulse keeps your requests organized, your responses fast, and your clients happy — without enterprise overhead.",
		stats: {
			resolution: { value: "< 5 min", label: "To your first ticket" },
			volume: { value: "All", label: "Channels in one place" },
			satisfaction: { value: "1 → 50", label: "Scales with your team" },
		},
		featuresHeadline: "Simple by design. Powerful when you need it.",
		features: {
			triage: {
				title: "Unified inbox",
				desc: "Every email, chat, and form submission in one place. Stop switching tabs to find what needs a reply.",
			},
			team: {
				title: "No-code automations",
				desc: "Set up auto-replies, routing, and tags in minutes. No engineers. No complexity. Just results.",
			},
			sla: {
				title: "Canned replies",
				desc: "Save your best responses and reuse them with one click. Handle common questions in seconds.",
			},
			analytics: {
				title: "Grows with you",
				desc: "Start solo. Add a teammate when you're ready. Pricing that makes sense at every stage — no sudden jumps.",
			},
		},
		stepsHeadline: "Up and running in an afternoon",
		steps: {
			connect: {
				title: "Connect in 5 minutes",
				desc: "Plug in your email or chat widget. No IT department required — just a few clicks.",
			},
			rules: {
				title: "Organize once",
				desc: "Set up simple tags, priorities, and routing. One afternoon of setup, months of payoff.",
			},
			ai: { title: "Respond faster", desc: "AI suggestions and canned replies help you close tickets before coffee gets cold." },
		},
		testimonial: {
			quote:
				"I run support solo for three SaaS products. Pulse is the first tool that didn't feel like it was built for a 50-person team. Setup took 10 minutes. Now I actually enjoy answering tickets.",
			role: "Independent Consultant",
		},
		ctaBadge: "Solo & Small Teams",
		ctaHeadline: "Keep it simple. Keep it fast. Keep every client happy.",
		ctaDesc: "Free for 14 days. No credit card. No enterprise contract. Just great support.",
	},
};

export type SolutionsDict = typeof solutions;
export default solutions;
