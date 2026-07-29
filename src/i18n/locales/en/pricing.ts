// Pricing page copy.
//
// Plan *names* are brand names and stay untranslated. Prices stay in USD — the
// numbers live in the component, only their labels are localized. Comparison
// rows whose value is a checkmark carry no per-column copy; the booleans stay
// in the component so a translation cannot change what a plan includes.

const pricing = {
	hero: {
		eyebrow: "PRICING_MATRIX — 14-DAY TRIAL / NO CARD",
		headline: { lead: "Simple,", highlight: "honest", trail: "pricing" },
		subhead: "Flat pricing for solos. Flexible per-agent pricing for teams. All plans include a 14-day free trial.",
		monthly: "Monthly",
		annual: "Annual",
		annualDiscount: "−20%",
	},

	agentCounter: {
		title: "AGENT_COUNT",
		scope: "CORE & ENTERPRISE",
		agents: "agents",
		fewer: "Fewer agents",
		more: "More agents",
	},

	plans: {
		sectionLabel: "01 — PLANS",
		sectionRight: "3 TIERS / PRORATED DAILY",
		mostSelected: "MOST SELECTED",
		perMonth: "/MO",
		flatRate: "FLAT RATE · UP TO 2 AGENTS",
		billedAnnually: " · BILLED ANNUALLY",
		perAgentRate: "{rate} × {count} AGENTS",
		savePerYear: "SAVE {amount} / YEAR",
		cta: "Start free trial",
		starter: {
			tagline: "FOR SOLO & SMALL TEAMS",
			description: "Keep every request organized. Set up in minutes, cancel anytime.",
			features: [
				"Up to 2 agents",
				"300 tickets / month",
				"2 channels (email + chat)",
				"Unified inbox",
				"Canned replies",
				"Basic automations",
				"Mobile app",
				"Community support",
			] as string[],
			missing: [
				"AI classification & routing",
				"AI auto-resolution",
				"Analytics dashboard",
				"Data residency",
				"Dedicated architect",
			] as string[],
		},
		core: {
			tagline: "FOR TEAMS & AGENCIES",
			description: "Full-featured support with AI routing, omnichannel inbox, and team management.",
			features: [
				"Unlimited ticket volume",
				"All channels unified",
				"AI Classification & Routing",
				"Team workload management",
				"Analytics dashboard",
				"Marketplace access",
				"Canned replies & automation",
				"24/7 Priority support",
			] as string[],
			missing: [
				"AI auto-resolution",
				"Sovereign data residency",
				"Dedicated success architect",
				"Custom SLA frameworks",
			] as string[],
		},
		enterprise: {
			tagline: "FOR LARGE ORGANIZATIONS",
			description: "The complete platform for complex, high-volume support operations.",
			features: [
				"Everything in Pulse Core",
				"AI Auto-resolution Engine",
				"Predictive Volume Forecasting",
				"Sovereign Data Residency (US/EU/APAC)",
				"Enterprise Key Management",
				"Dedicated Success Architect",
				"Custom SLA Frameworks",
				"99.99% Uptime Guarantee",
			] as string[],
			missing: [] as string[],
		},
	},

	enterpriseCallout: {
		title: "Need 150+ agents or custom contracts?",
		desc: "Volume discounts, custom SLAs, dedicated infrastructure, and white-glove onboarding.",
		cta: "Talk to sales",
	},

	trustRow: {
		soc2: "SOC 2 TYPE II",
		uptime: "99.97% UPTIME SLA",
		customers: "{count}+ CUSTOMERS",
		rating: "4.9 / 5 AVG RATING",
	},

	fieldReports: {
		sectionLabel: "02 — FIELD REPORTS",
		sectionRight: "ONE PER PLAN",
		logPrefix: "LOG_0",
		items: {
			torres: {
				quote: "I was live in under 10 minutes. All my client emails in one inbox, basic automations done, and nothing I didn't need.",
				role: "Independent Consultant, Torres Digital",
				plan: "STARTER",
			},
			bright: {
				quote: "Core gave our agency real visibility. We manage 8 clients and everyone's queue stays separate without any extra effort.",
				role: "Operations Lead, BrightSupport Agency",
				plan: "CORE",
			},
			retail: {
				quote:
					"The autonomous resolution engine paid for the Enterprise upgrade in less than one quarter. It's not a support tool — it's a competitive edge.",
				role: "VP of Customer Experience, RetailFlow Group",
				plan: "ENTERPRISE",
			},
		},
	},

	compare: {
		sectionLabel: "MATRIX",
		sectionTitle: "Compare plans side by side",
		sectionRight: "FULL FEATURE BREAKDOWN",
		columnFeature: "FEATURE",
		columnStarter: "STARTER",
		columnCore: "CORE",
		columnEnterprise: "ENTERPRISE",
		rows: {
			agents: { feature: "Agents", starter: "Up to 2", core: "Unlimited", enterprise: "Unlimited" },
			volume: { feature: "Ticket volume", starter: "300 / month", core: "Unlimited", enterprise: "Unlimited" },
			channels: { feature: "Channels", starter: "2", core: "Unlimited", enterprise: "Unlimited" },
			aiRouting: { feature: "AI Classification & Routing" },
			autoResolution: { feature: "AI Auto-resolution" },
			analytics: { feature: "Analytics dashboard" },
			residency: { feature: "Sovereign data residency" },
			architect: { feature: "Dedicated Architect" },
			uptime: { feature: "Uptime SLA", starter: "99.9%", core: "99.97%", enterprise: "99.99%" },
			support: { feature: "Support", starter: "Community", core: "24/7 Priority", enterprise: "White-glove" },
		},
	},

	faq: {
		sectionLabel: "04 — FAQ",
		entries: "{count} ENTRIES",
		items: {
			howPricing: {
				q: "How does pricing work?",
				a: "Pulse Starter is a flat $9/month for up to 2 agents — perfect for solos and small teams. Core and Enterprise are priced per active agent per month, billed at the end of each billing period. Add or remove agents anytime; changes are prorated to the day.",
			},
			changePlans: {
				q: "Can I change plans later?",
				a: "Yes. Upgrades take effect immediately; downgrades apply at the next billing cycle. There are no lock-in fees.",
			},
			whatIsAgent: {
				q: "What counts as an agent?",
				a: "Any user who can view, respond to, or manage tickets. Read-only viewers and admins who don't handle tickets are free.",
			},
			freeTrial: {
				q: "Is there a free trial?",
				a: "All paid plans include a 14-day free trial with full feature access. No credit card required to start.",
			},
			nonProfit: {
				q: "Do you offer discounts for non-profits?",
				a: "Yes — contact us for our non-profit and education pricing. We offer up to 40% off for qualifying organizations.",
			},
			dataStored: {
				q: "Where is our data stored?",
				a: "Starter and Core data is stored in the US by default. Enterprise customers choose their region: US, EU, or APAC.",
			},
		},
	},

	finalCta: {
		tag: "05 — CONTACT · NO PRESSURE, NO SALES SCRIPTS",
		headline: { lead: "Talk to our", highlight: "team." },
		desc: "We'll walk you through the right plan for your team size and support volume.",
		primary: "Talk to sales",
		secondary: "Start free trial",
	},
};

export type PricingDict = typeof pricing;
export default pricing;
