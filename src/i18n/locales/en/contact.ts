// Contact page. Form field *values* (`general`, `1-10`, …) stay in the
// component — only their labels are localized, so a translation can't change
// what gets submitted.

const contact = {
	hero: {
		eyebrow: "COMMS — AVG RESPONSE 4 BUSINESS HOURS",
		headline: { lead: "Get", highlight: "in touch" },
		subhead: "We're here to help. Reach out to the right team and we'll get back to you fast.",
		stats: {
			response: { value: "< 4h", label: "SALES RESPONSE TIME" },
			soc2: { value: "SOC 2", label: "TYPE II CERTIFIED" },
			customers: "CUSTOMERS WORLDWIDE",
			uptime: "UPTIME SLA",
		},
	},

	channels: {
		sectionLabel: "01 — CHANNELS",
		sectionRight: "PICK THE RIGHT FREQUENCY",
		options: {
			general: {
				title: "General",
				desc: "New to Pulse, not sure where to start, or just have a quick question? We read every message.",
				badge: "REPLIES < 8H",
			},
			sales: {
				title: "Sales",
				desc: "Questions about plans, pricing, or whether Pulse is right for you — we're happy to help.",
				badge: "REPLIES < 4H",
			},
			enterprise: {
				title: "Enterprise",
				desc: "Custom contracts, SSO, compliance reviews, and SLA guarantees for teams with advanced requirements.",
				badge: "DEDICATED TEAM",
			},
			press: {
				title: "Press",
				desc: "Media inquiries, logo requests, and press kit. We are happy to provide interviews, quotes, and company data.",
				badge: "REPLIES < 24H",
			},
		},
	},

	form: {
		sectionLabel: "02 — TRANSMIT",
		sectionRight: "CHANNEL OPEN",
		newMessage: "NEW_MESSAGE",
		encrypted: "ENCRYPTED · TLS 1.3",
		title: "Send us a message",
		subtitle: "We read every submission and reply within one business day.",
		firstName: "First name",
		firstNamePlaceholder: "Alex",
		lastName: "Last name",
		lastNamePlaceholder: "Johnson",
		email: "Work email",
		emailPlaceholder: "alex@company.com",
		company: "Company",
		companyPlaceholder: "Acme Corp",
		teamSize: "Team size",
		teamSizePlaceholder: "Select",
		teamSizes: {
			"1-10": "1–10 agents",
			"11-50": "11–50 agents",
			"51-200": "51–200 agents",
			"200+": "200+ agents",
		},
		reason: "Reason for contact",
		reasonPlaceholder: "Select a topic",
		reasons: {
			general: "General question",
			sales: "Sales inquiry",
			enterprise: "Enterprise plan",
			technical: "Technical support",
			partnership: "Partnership",
			other: "Other",
		},
		/** Message-box hint, swapped to match the selected reason. */
		reasonHints: {
			general: "Tell us a bit about yourself and what you're trying to do. We'll point you in the right direction.",
			sales: "Tell us your team size, current setup, and what you are hoping to solve.",
			enterprise: "Describe your requirements — SSO, compliance, SLA, or custom contracts.",
			technical: "Share details about the issue or integration you need help with.",
			partnership: "Tell us about your product and the kind of partnership you have in mind.",
			other: "Whatever is on your mind — we read every message.",
		},
		message: "Message",
		messagePlaceholder: "Tell us how we can help...",
		submit: "Send message",
		privacyPrefix: "By submitting this form you agree to our",
		privacyLink: "Privacy Policy",
		success: {
			tag: "✓ TRANSMISSION RECEIVED",
			title: "Message received",
			desc: "We will get back to you within 4 business hours during weekdays.",
			sendAnother: "Send another",
			helpCenter: "Help center",
		},
	},

	sidebar: {
		officesTitle: "OFFICES",
		offices: {
			london: { city: "London", address: "Remote-first HQ — 14 countries" },
			seattle: { city: "Seattle", address: "Engineering hub" },
		},
		responseTitle: "RESPONSE_TIMES",
		responseTimes: {
			sales: { channel: "SALES", time: "< 4 HOURS" },
			enterprise: { channel: "ENTERPRISE", time: "DEDICATED CSM" },
			general: { channel: "GENERAL", time: "< 1 BUSINESS DAY" },
			press: { channel: "PRESS", time: "< 24 HOURS" },
		},
		promoTitle: "Looking for quick answers?",
		promoDesc: "Browse 200+ articles in our help center before reaching out.",
		promoCta: "Help center",
	},
};

export type ContactDict = typeof contact;
export default contact;
