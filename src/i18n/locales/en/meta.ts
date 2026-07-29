// Per-page <title> and meta description, keyed by route.
// Titles are rendered as `{title} — Pulse` unless they already brand themselves.

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
} as const;

export type MetaDict = { [K in keyof typeof meta]: { title: string; description: string } };
export default meta as MetaDict;
