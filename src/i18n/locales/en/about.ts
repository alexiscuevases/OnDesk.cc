// About page. Team names, initials, press outlets and investor names are proper
// nouns and stay in the component; roles, bios, and locations are localized.

const about = {
	hero: {
		eyebrow: "COMPANY_RECORD — EST. 2022",
		headline: { lead: "We exist to", highlight: "fix customer support" },
		subhead:
			"Pulse is a team of 47 people across 14 countries building the autonomous support infrastructure that teams of every size actually deserve.",
		ctaPrimary: "Join the team",
		ctaSecondary: "Get in touch",
		stats: {
			founded: "FOUNDED",
			team: "TEAM MEMBERS",
			customers: "CUSTOMERS",
			countries: "COUNTRIES",
		},
	},

	mission: {
		sectionLabel: "01 — MISSION",
		sectionRight: "MAKE SUPPORT TEAMS EXTRAORDINARY",
		title: "Make support teams extraordinary",
		body1:
			"Customer support is one of the most important functions in any company and one of the most underserved by software. We think the people doing that work deserve better tools than a shared inbox and a spreadsheet.",
		body2:
			"Pulse is built to give support teams of every size the speed and structure they need to actually solve problems through autonomous orchestration, without the complexity of legacy platforms.",
		commitmentsTitle: "COMMITMENTS",
		commitments: [
			"SOC 2 Type II certified",
			"GDPR & CCPA compliant",
			"Plans starting at $9 flat — scales to enterprise",
			"99.97% uptime SLA",
		] as string[],
	},

	timeline: {
		sectionLabel: "TIMELINE",
		sectionTitle: "From zero to global in three years",
		sectionRight: "2022 → PRESENT",
		entries: {
			founded: {
				title: "Founded",
				desc: "Three engineers leave Microsoft frustrated by the state of enterprise support tooling. Pulse (launched as OnDesk) ships its first beta to 12 teams.",
			},
			integrations: {
				title: "Native integrations launch",
				desc: "Deep integrations with Microsoft 365 and Google Workspace go live. First 100 paying customers in 90 days.",
			},
			aiAgents: {
				title: "AI Agents GA",
				desc: "General availability of AI-assisted routing, ticket summarization, and suggested replies. ARR triples.",
			},
			global: {
				title: "Global scale",
				desc: "1,200+ customers across 40 countries. EU and APAC data residency regions open. Series B announced.",
			},
		},
	},

	values: {
		sectionLabel: "03 — VALUES",
		sectionRight: "WHAT WE STAND FOR",
		items: {
			customer: {
				title: "Customer-obsessed",
				desc: "Every feature starts with a real support team problem. We do 20+ customer interviews a month and ship what we learn.",
			},
			transparent: {
				title: "Transparent by default",
				desc: "We share our roadmap publicly, post our status page in real time, and tell customers when we ship something that affects them.",
			},
			lasting: {
				title: "Built to last",
				desc: "We are profitable and growing. No growth-at-all-costs here — we build relationships and infrastructure meant to still be running in 20 years.",
			},
		},
	},

	team: {
		sectionLabel: "CREW",
		sectionTitle: "Meet the leadership",
		sectionRight: "{count} OPERATORS ON DECK",
		intro: "A small team with deep experience at companies like Microsoft, Stripe, Zendesk, and ServiceNow.",
		onLinkedin: "{name} on LinkedIn",
		onTwitter: "{name} on Twitter",
		members: {
			elena: {
				role: "CEO & Co-founder",
				bio: "Former Microsoft PM. Shipped Teams channels to 280M users. Obsessed with support ops.",
				location: "London",
			},
			daniel: {
				role: "CTO & Co-founder",
				bio: "Ex-Azure. Distributed systems nerd. Has opinions about queues.",
				location: "Seattle",
			},
			aisha: {
				role: "VP Product",
				bio: "Built support tooling at Zendesk for 6 years. Believes product is a team sport.",
				location: "Lagos",
			},
			ravi: {
				role: "VP Engineering",
				bio: "Scaled infra at Stripe. Loves boring technology that actually works.",
				location: "Singapore",
			},
			sophie: {
				role: "VP Customer Success",
				bio: "10 years in enterprise SaaS CS. Holds the record for longest customer QBR.",
				location: "Paris",
			},
			marcus: {
				role: "VP Sales",
				bio: "Sold enterprise software at ServiceNow and Atlassian. Knows when to shut up and listen.",
				location: "Amsterdam",
			},
		},
	},

	press: {
		sectionLabel: "05 — PRESS & BACKERS",
		sectionRight: "ON THE RECORD",
		backedBy: "BACKED BY",
		quotes: {
			techcrunch: "Pulse is the rare support tool that works just as well for a solo consultant as it does for a 500-person enterprise.",
			verge:
				"Whether you're running one inbox or fifty, Pulse keeps everything organized without making you feel like you need an IT department.",
			forbes: "A rare example of a SaaS company that does exactly what it says on the tin.",
		},
	},

	finalCta: {
		tag: "06 — JOIN · REMOTE-FIRST / 14 COUNTRIES",
		headline: { lead: "Come build the future of", highlight: "support." },
		desc: "We are always looking for extraordinary people who care deeply about the work. Check out our open roles or just say hello.",
		primary: "View open roles",
		secondary: "Get in touch",
	},
};

export type AboutDict = typeof about;
export default about;
