// Shared chrome: navbar, footer, language switcher, region hint.
// Hrefs deliberately stay in the components — only human-readable copy lives
// here, so a translation can never break routing.

const common = {
	nav: {
		solutions: "Solutions",
		features: "Features",
		pricing: "Pricing",
		integrations: "Integrations",
		login: "Log in",
		freeTrial: "Free Trial",
		solutionsIndex: "SOLUTIONS_INDEX",
		entries: "{count} ENTRIES",
		toggleMenu: "Toggle menu",
		telemetry: "SUPPORT_OS",
	},

	solutions: {
		supportTeams: {
			label: "Support Teams",
			description: "Manage high-volume support with automation and workflows",
		},
		agencies: {
			label: "Agencies",
			description: "Run support for multiple clients from one place",
		},
		solo: {
			label: "Solo & Small Teams",
			description: "Keep requests organized without complexity",
		},
	},

	footer: {
		index: "PULSE://INDEX",
		operational: "ALL SYSTEMS OPERATIONAL",
		tagline: "Automate support, resolve faster, and scale effortlessly.",
		rights: "© {year} PULSE — ALL RIGHTS RESERVED",
		signalEnd: "SIG.END",
		headings: {
			solutions: "Solutions",
			platform: "Platform",
			resources: "Resources",
			company: "Company",
			legal: "Legal",
		},
		links: {
			supportTeams: "Support Teams",
			agencies: "Agencies",
			solo: "Solo & Small Teams",
			features: "Features",
			integrations: "Integrations",
			changelog: "Changelog",
			blog: "Blog",
			help: "Help Center",
			customers: "Case Studies",
			status: "Status",
			about: "About",
			security: "Security",
			careers: "Careers",
			contact: "Contact",
			privacy: "Privacy",
			terms: "Terms",
		},
	},

	language: {
		label: "Language",
		mono: "LANG",
		select: "Select language",
	},

	/** Offered — never forced — when the visitor's region suggests another locale. */
	localeHint: {
		message: "This page is available in {language}.",
		action: "Switch",
		dismiss: "Dismiss",
	},
};

export type CommonDict = typeof common;
export default common;
