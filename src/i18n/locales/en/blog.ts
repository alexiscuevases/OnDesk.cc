// Blog. Post slugs (they're URLs), author names and dates-as-data stay in the
// component; titles, excerpts, roles and tag labels are localized.

const blog = {
	hero: {
		eyebrow: "DISPATCHES — FIELD NOTES & GUIDES",
		headline: { lead: "Insights for", highlight: "every support team" },
		subhead: "Guides, product updates, and stories from teams, agencies, and solos building better support.",
		allTag: "All",
	},

	tags: {
		ai: "AI",
		product: "Product",
		guide: "Guide",
		agency: "Agency",
		solo: "Solo & Small Teams",
	},

	featured: {
		sectionLabel: "01 — FEATURED DISPATCH",
		sectionRight: "LATEST TRANSMISSION",
		readSuffix: "READ",
		readArticle: "Read article",
	},

	archive: {
		sectionLabel: "ARCHIVE",
		sectionTitle: "All dispatches",
		sectionRight: "{count} ENTRIES ON FILE",
	},

	roles: {
		cto: "CTO",
		cs: "Head of Customer Success",
		product: "Head of Product",
	},

	posts: {
		aiAgents: {
			title: "How AI agents resolve 80% of tickets without human intervention",
			excerpt:
				"A deep dive into the classification, context-retrieval, and reply-generation pipeline that powers Pulse AI Agents — and the edge cases we had to solve.",
			date: "FEB 18, 2025",
			readTime: "8 MIN",
		},
		sla: {
			title: "The SLA survival guide for growing support teams",
			excerpt:
				"SLA breaches hurt CSAT, renewals, and morale. Here is the framework we recommend to teams scaling from 5 to 50 agents.",
			date: "FEB 11, 2025",
			readTime: "6 MIN",
		},
		agency: {
			title: "How agencies manage support for 8+ clients without losing their mind",
			excerpt:
				"The tools, workflows, and rituals that high-performing support agencies use to keep every client's queue clean — without context-switching all day.",
			date: "FEB 4, 2025",
			readTime: "7 MIN",
		},
		csat: {
			title: "How Fabrikam raised CSAT from 60% to 90% in 90 days",
			excerpt:
				"A case study on combining AI auto-replies, skill-based routing, and structured shift scheduling to achieve a dramatic satisfaction turnaround.",
			date: "JAN 28, 2025",
			readTime: "5 MIN",
		},
		portal: {
			title: "Building a self-service portal your customers will actually use",
			excerpt:
				"Most self-service portals fail because they are hard to find and harder to search. Here is what we learned building the portal feature for Pulse.",
			date: "JAN 21, 2025",
			readTime: "7 MIN",
		},
		tagging: {
			title: "Why your ticket tagging taxonomy is probably wrong",
			excerpt:
				"Manual tags drift. AI auto-tags don't — if you seed them correctly. A practical guide to building a tag taxonomy that scales.",
			date: "JAN 14, 2025",
			readTime: "6 MIN",
		},
		solo: {
			title: "Running support solo: how to handle 200+ requests a week without burning out",
			excerpt:
				"Canned replies, smart inboxes, and a few AI rules can do the work of a second hire. A practical guide for freelancers and solopreneurs managing client support.",
			date: "JAN 7, 2025",
			readTime: "6 MIN",
		},
	},

	newsletter: {
		tag: "03 — SUBSCRIBE · ONE EMAIL / WEEK · NO SPAM",
		headline: { lead: "Never miss a", highlight: "dispatch." },
		desc: "Our best articles on AI support, ops, and product updates — straight to your inbox.",
		emailPlaceholder: "YOU@COMPANY.COM",
		submit: "Subscribe",
		unsubscribe: "UNSUBSCRIBE AT ANY TIME",
	},
};

export type BlogDict = typeof blog;
export default blog;
