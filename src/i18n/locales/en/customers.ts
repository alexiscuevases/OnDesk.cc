// Customers / case studies.
//
// Industry *ids* drive the filter and live in the component; only `label` is
// translated. Company names, author names, logos, colours and plan names are
// proper nouns and stay in the component too. Result icons pair by index with
// the `results` array below.

interface Result {
	metric: string;
	label: string;
}

const customers = {
	hero: {
		eyebrow: "CASE_FILES — 1,200+ TEAMS ON RECORD",
		headline: { lead: "Real teams,", highlight: "real results" },
		subhead: "Documented outcomes from support teams, agencies, and solo operators around the world.",
		stats: {
			customers: "CUSTOMERS WORLDWIDE",
			countries: "COUNTRIES SERVED",
			deflection: "AVG TICKET DEFLECTION",
			csat: "AVERAGE CSAT RATING",
		},
	},

	industries: {
		all: "All",
		technology: "Technology",
		retail: "Retail",
		agency: "Agency",
		finance: "Finance",
		healthcare: "Healthcare",
		education: "Education",
	},

	featured: {
		sectionLabel: "01 — FEATURED CASE",
		caseTag: "CASE_001",
		challengeLabel: "THE CHALLENGE",
		solutionLabel: "THE SOLUTION",
		resultsLabel: "RESULTS",
		cta: "Get similar results",
		planSuffix: "PLAN",
	},

	index: {
		sectionLabel: "CASE INDEX",
		sectionTitle: "Browse the files",
		sectionRight: "{count} CASES DOCUMENTED",
	},

	cases: {
		fabrikam: {
			tagline: "From 22 agents to 9 — same ticket volume",
			challenge:
				"Fabrikam's IT support team was drowning in repetitive Microsoft 365 license and onboarding tickets. Agents spent 60% of their time on issues that had identical resolutions.",
			solution:
				"Deployed Pulse AI agents to auto-resolve password resets, license requests, and onboarding checklists. Integrated directly with their Azure AD and Teams channels.",
			results: [
				{ metric: "59%", label: "Reduction in headcount needed" },
				{ metric: "4 min", label: "Average resolution time" },
				{ metric: "94%", label: "CSAT score" },
				{ metric: "$420K", label: "Annual cost savings" },
			] as Result[],
			quote:
				"We evaluated six tools. Pulse was the only one that had a truly native Microsoft Teams orchestration — not just a webhook bolted on.",
			role: "IT Director",
		},
		northwind: {
			tagline: "Customer support scaled 4× without adding headcount",
			challenge:
				"A peak-season surge doubled inbound customer tickets. The team had no way to predict volume or automatically route by urgency.",
			solution:
				"Used Pulse's predictive routing, SLA breach alerts, and autonomous responses to handle peak load without hiring seasonal agents.",
			results: [
				{ metric: "4×", label: "Volume handled, same team size" },
				{ metric: "98%", label: "SLA compliance during peak" },
				{ metric: "2.1 hrs", label: "Average first response time" },
				{ metric: "89%", label: "CSAT score during peak season" },
			] as Result[],
			quote: "Last holiday season was the first in five years where I wasn't personally working weekends to keep tickets green.",
			role: "VP Operations",
		},
		brightsupport: {
			tagline: "8 clients. 1 inbox. Zero context-switching.",
			challenge:
				"BrightSupport managed email support for 8 SaaS clients across 4 different tools. Agents constantly switched tabs, mixed up client voices, and lacked any cross-client reporting to show clients what they were actually getting.",
			solution:
				"Consolidated all clients into Pulse with separate client workspaces, custom inboxes per client, and a shared analytics view for reporting. Each agent was scoped to their assigned clients only.",
			results: [
				{ metric: "8", label: "Clients in one workspace" },
				{ metric: "60%", label: "Less time on context-switching" },
				{ metric: "100%", label: "Client data isolation" },
				{ metric: "3×", label: "Faster monthly reporting" },
			] as Result[],
			quote:
				"We onboard new clients in under an hour now. The isolation between client workspaces is exactly what we needed to feel confident nothing would bleed across.",
			role: "Operations Lead",
		},
		torres: {
			tagline: "Solo consultant. 3 products. Zero dropped requests.",
			challenge:
				"Mia Torres managed client support solo for three SaaS products she'd built. Requests came through email, a contact form, and Twitter DMs. She was constantly dropping things and losing track of who she'd replied to.",
			solution:
				"Connected all 3 channels to Pulse Starter in one afternoon. Set up canned replies for her 10 most common questions and an auto-reply for nights and weekends.",
			results: [
				{ metric: "< 10 min", label: "Setup time" },
				{ metric: "3", label: "Products managed solo" },
				{ metric: "0", label: "Dropped requests since launch" },
				{ metric: "2×", label: "Faster reply time" },
			] as Result[],
			quote:
				"I was running support across three inboxes and two browsers. Pulse Starter pulled it all together in an afternoon. I haven't missed a message since.",
			role: "Independent Consultant",
		},
		contoso: {
			tagline: "HIPAA-compliant IT support with zero ticket leaks",
			challenge:
				"Healthcare IT requires airtight data handling. Legacy tools couldn't enforce HIPAA-compliant data residency or audit trails for every ticket action.",
			solution:
				"Deployed the Enterprise plan with EU data residency, full audit logging, and custom role-based access controls tied to their Active Directory groups.",
			results: [
				{ metric: "100%", label: "Audit trail coverage" },
				{ metric: "0", label: "Data residency violations in 18 months" },
				{ metric: "73%", label: "Faster compliance reporting" },
				{ metric: "91%", label: "Agent satisfaction score" },
			] as Result[],
			quote:
				"In healthcare, a data breach is existential. Pulse gave us the controls and sovereign audit trails that legacy tools never could.",
			role: "CISO",
		},
		tailwind: {
			tagline: "Reduced ticket backlog from 3,200 to under 50 in 30 days",
			challenge:
				"A migration to Microsoft 365 generated a massive ticket backlog. Manual triage made prioritization nearly impossible and response times ballooned to 5+ days.",
			solution:
				"Used AI triage and priority routing to clear the backlog. Automated responses handled 60% of migration-related tickets with zero agent involvement.",
			results: [
				{ metric: "98%", label: "Backlog reduction in 30 days" },
				{ metric: "60%", label: "Tickets auto-resolved by AI" },
				{ metric: "6 hrs", label: "Down from 5-day response time" },
				{ metric: "$210K", label: "Saved in contractor costs" },
			] as Result[],
			quote: "The AI triage alone paid for 18 months of our subscription in a single month.",
			role: "Head of IT",
		},
		adventure: {
			tagline: "Unified 14 regional support queues into one intelligent inbox",
			challenge:
				"Fourteen regional offices each managed their own ticket queues in different tools. Cross-region escalations fell through the cracks regularly.",
			solution:
				"Consolidated all queues into Pulse with region-aware routing, automatic escalation paths, and a shared intelligence dashboard for regional managers.",
			results: [
				{ metric: "14→1", label: "Queues unified into one" },
				{ metric: "0", label: "Cross-region escalation failures in 6 months" },
				{ metric: "41%", label: "Reduction in duplicate tickets" },
				{ metric: "96%", label: "CSAT across all regions" },
			] as Result[],
			quote:
				"For the first time, our regional managers see the same data at the same time. That alone changed how we run our Monday standups.",
			role: "Global Support Manager",
		},
		wingtip: {
			tagline: "Student IT support tickets down 67% in one semester",
			challenge:
				"University IT was overwhelmed at the start of each semester with identical password and enrollment system queries from thousands of students.",
			solution:
				"Built a self-service knowledge base with AI-assisted answers, auto-resolved the top 10 recurring query types, and integrated with their student portal via the API.",
			results: [
				{ metric: "67%", label: "Ticket reduction in first semester" },
				{ metric: "4.8/5", label: "Student satisfaction score" },
				{ metric: "8 min", label: "Average resolution time (down from 3 days)" },
				{ metric: "3 agents", label: "Now handles what took 11" },
			] as Result[],
			quote: "Our IT team finally has time to work on strategic projects instead of resetting passwords 300 times a day.",
			role: "VP Information Technology",
		},
	},

	finalCta: {
		tag: "03 — YOUR TURN · NO CREDIT CARD REQUIRED",
		headline: { lead: "Ready to write your own", highlight: "story?" },
		desc: "Join 1,200+ support teams that have already transformed how they handle tickets.",
		primary: "Start free trial",
		secondary: "Talk to sales",
	},
};

export type CustomersDict = typeof customers;
export default customers;
