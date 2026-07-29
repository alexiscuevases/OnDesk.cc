// Changelog. Version numbers, change *types* and filter ids stay in the
// component; labels and change text are localized.
//
// `releasesFound` uses plural forms rather than appending an "s", which only
// works in English.

const changelog = {
	hero: {
		eyebrow: "VERSION_LOG — CONTINUOUS DEPLOYMENT",
		headline: { lead: "Every release,", highlight: "on the record" },
		subhead: "Tracking the continuous evolution of Pulse as the world's most advanced autonomous support platform.",
		cta: "Subscribe to updates",
	},

	filters: { all: "All", major: "Major", minor: "Minor", patch: "Patch" },

	releasesFound: {
		one: "{count} RELEASE FOUND",
		other: "{count} RELEASES FOUND",
	},

	changeTypes: { new: "NEW", improvement: "IMPROVED", fix: "FIX" },

	releases: {
		"3.5.0": {
			date: "MAR 2025",
			headline: "Pulse Starter, Google Workspace, and smarter canned replies",
			changes: [
				"Pulse Starter plan — flat-rate pricing for solo operators and small teams",
				"Google Workspace integration — Gmail and Google Chat channels now supported",
				"Canned replies now support AI-assisted personalization before sending",
				"E-commerce integrations: Stripe and Shopify order context in ticket sidebar",
				"Mobile app: inbox filters now persist between sessions",
				"Fixed canned reply search not returning results with accented characters",
			] as string[],
		},
		"3.4.0": {
			date: "FEB 2025",
			headline: "The Pulse Orchestration Update — smarter, faster, sovereign",
			changes: [
				"AI Agents v2 — context-aware multi-turn reasoning with memory",
				"Microsoft Copilot integration (beta) — surface ticket context in Copilot Chat",
				"Data residency selector for EU and APAC regions",
				"AI first-response latency reduced by 40%",
				"Ticket list now supports bulk-assign and bulk-close",
				"Fixed edge case where SLA clock did not pause on pending-customer status",
			] as string[],
		},
		"3.3.2": {
			date: "JAN 2025",
			headline: "Notification reliability and dark-mode polish",
			changes: [
				"Resolved Teams notification duplication on ticket reassignment",
				"CSAT survey link now renders correctly in Outlook mobile",
				"Improved dark mode contrast ratios across all dashboards",
			] as string[],
		},
		"3.3.0": {
			date: "DEC 2024",
			headline: "Self-service portal, Power Automate, and Twilio Voice",
			changes: [
				"Self-service portal with branded domain support",
				"Power Automate connector — trigger flows from any ticket event",
				"Phone-to-ticket: Twilio Voice transcription and auto-create",
				"Analytics date range picker now supports custom ranges",
				"SharePoint attachment previews now load without re-authentication",
			] as string[],
		},
		"3.2.0": {
			date: "NOV 2024",
			headline: "WhatsApp channel and skill-based routing",
			changes: [
				"Omnichannel inbox: WhatsApp via Twilio",
				"Skill-based routing rules engine",
				"Ticket merge — combine duplicate submissions into one thread",
				"Mobile app performance improvements (iOS & Android)",
				"Fixed time-zone offset errors in SLA breach alerts",
			] as string[],
		},
		"3.1.0": {
			date: "OCT 2024",
			headline: "AI auto-tagging and Jira two-way sync",
			changes: [
				"AI auto-tagging — tickets classified into categories automatically",
				"Jira two-way sync — status changes reflected in both systems",
				"Search now indexes ticket body content (full-text)",
				"Resolved incorrect ticket count in team workload heatmap",
			] as string[],
		},
		"3.0.0": {
			date: "SEP 2024",
			headline: "Pulse v3 — the platform, rebuilt from the ground up",
			changes: [
				"Pulse v3 — comprehensive architecture overhaul and new design system",
				"AI Agents v1 — automated triage and first response",
				"Microsoft 365 and Google Workspace native integrations",
				"Enterprise: customer-managed encryption keys (Enterprise plan)",
				"Advanced analytics with CSAT, NPS, and volume forecasting",
			] as string[],
		},
	},

	finalCta: {
		tag: "EOF — BETA PROGRAM · SHAPE WHAT COMES NEXT",
		headline: { lead: "Want early", highlight: "access?" },
		desc: "Join our beta program and shape the roadmap before features ship publicly. Your feedback drives what we build next.",
		primary: "Request beta access",
		secondary: "Start free trial",
	},
};

export type ChangelogDict = typeof changelog;
export default changelog;
