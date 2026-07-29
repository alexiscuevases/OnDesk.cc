// Careers. Department ids drive the filter and live in the component, as do the
// technology tags on each role (they're proper nouns). Titles, locations,
// employment types and all prose are localized.

const careers = {
	hero: {
		eyebrow: "HIRING — {count} POSITIONS OPEN",
		headline: { lead: "Build the", highlight: "autonomous service" },
		subhead:
			"We are a remote-first team of 47 people spread across the globe, building support infrastructure that works for solo founders and enterprise teams alike.",
		facts: { countries: "14 COUNTRIES", remote: "FULLY REMOTE", glassdoor: "4.9 / 5 GLASSDOOR" },
		ctaPrimary: "View open positions",
		ctaSecondary: "About us",
		stats: {
			team: "TEAM MEMBERS",
			countries: "COUNTRIES",
			rating: "GLASSDOOR RATING",
			recommend: "WOULD RECOMMEND",
		},
	},

	perks: {
		sectionLabel: "BENEFITS",
		sectionTitle: "Why work here",
		sectionRight: "CULTURE > COMPENSATION",
		intro: "We compete on culture, not just compensation. Here is what that means in practice.",
		items: {
			remote: { title: "Fully remote", desc: "Work from wherever you do your best thinking. We have team members across 14 countries." },
			equity: {
				title: "Competitive equity",
				desc: "Meaningful stock options for every employee — we believe in shared ownership from day one.",
			},
			health: { title: "Health & wellness", desc: "$200/month wellness allowance plus comprehensive medical, dental, and vision." },
			learning: { title: "Learning budget", desc: "$2,000/year for conferences, courses, and books. No approval required." },
			pto: { title: "Generous PTO", desc: "Unlimited PTO with a minimum of 20 days encouraged. We track utilization — we mean it." },
			office: { title: "Home office stipend", desc: "$1,500 to set up your workspace the way you want it." },
			retreats: { title: "Team retreats", desc: "Two company-wide retreats per year. We have been to Lisbon, Barcelona, and Tokyo." },
			growth: { title: "Fast-paced growth", desc: "Tripled ARR in 2024. You will see your work matter and grow with the company." },
		},
	},

	reports: {
		sectionLabel: "02 — CREW REPORTS",
		sectionRight: "4.9 / 5 ON GLASSDOOR",
		verifiedEmployee: "VERIFIED EMPLOYEE",
		items: {
			engineer: {
				quote: "Best company I have worked at. Leadership actually listens, shipping is fast, and the team is world-class.",
				role: "Senior Engineer",
			},
			designer: {
				quote: "Fully remote done right. Not just tolerated — it is the default. Great async culture.",
				role: "Product Designer",
			},
			csm: { quote: "Unlimited PTO that people actually use. Refreshing for a startup.", role: "Customer Success Manager" },
		},
	},

	roles: {
		sectionLabel: "OPEN POSITIONS",
		sectionTitle: "Join the crew",
		sectionRight: "{roles} ROLES / {departments} DEPARTMENTS",
		allFilter: "All",
		openCount: "{count} OPEN",
		apply: "APPLY",
		types: { fullTime: "Full-time" },
		locations: {
			remoteEuUs: "Remote (EU / US)",
			remote: "Remote",
			remoteUs: "Remote (US)",
			remoteUsLatam: "Remote (US / LATAM)",
			londonOrRemote: "London or Remote",
		},
		departments: {
			engineering: {
				name: "Intelligence & Infrastructure",
				roles: {
					intelligence: "Senior Intelligence Engineer — Pulse Core",
					frontend: "Frontend Engineer — Design Systems",
					infra: "Staff Engineer — Infrastructure",
					ml: "ML Engineer — Ticket Classification",
				},
			},
			product: {
				name: "Product & Design",
				roles: {
					pmCore: "Senior Product Manager — Core Platform",
					designer: "Product Designer — Enterprise UX",
					pmSmb: "Product Manager — Starter & SMB",
				},
			},
			success: {
				name: "Customer Success",
				roles: {
					csmEnterprise: "Customer Success Manager — Enterprise (EMEA)",
					onboarding: "Technical Onboarding Specialist",
				},
			},
			sales: {
				name: "Sales",
				roles: {
					aeMidMarket: "Account Executive — Mid-Market (EMEA)",
					salesEngineer: "Sales Engineer",
					aeSmb: "SMB Account Executive",
				},
			},
		},
	},

	process: {
		sectionLabel: "04 — PROCESS",
		sectionRight: "APPLY → OFFER IN ~2 WEEKS",
		headline: { lead: "Transparent, fast,", highlight: "respectful." },
		subhead: "Four steps. No trick questions. Paid work samples.",
		steps: {
			apply: { title: "Apply online", desc: "Send your application. We review every submission — no auto-rejections on keywords." },
			intro: { title: "Intro call", desc: "30 minutes with a member of our team to discuss the role and answer your questions." },
			technical: {
				title: "Technical / work sample",
				desc: "A focused, paid take-home or live interview relevant to your role. No trick questions.",
			},
			final: { title: "Final interviews", desc: "Meet 2-3 people you would work with day-to-day. Decision within 5 business days." },
		},
	},

	finalCta: {
		tag: "EOF — GENERAL APPLICATION",
		headline: { lead: "Don't see your", highlight: "role?" },
		desc: "We are always interested in meeting exceptional people. Send us a note and tell us how you would contribute.",
		primary: "Send a general application",
		secondary: "About us",
	},
};

export type CareersDict = typeof careers;
export default careers;
