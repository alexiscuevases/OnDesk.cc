import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingDown, Clock, Users, Zap, ChevronRight, Quote, BarChart3, Shield, Globe } from "lucide-react";
import { useState } from "react";

const INDUSTRIES = ["All", "Technology", "Retail", "Healthcare", "Finance", "Education"];

const CASE_STUDIES = [
	{
		company: "Fabrikam Inc.",
		industry: "Technology",
		logo: "FA",
		color: "bg-blue-500",
		tagline: "From 22 agents to 9 — same ticket volume",
		challenge:
			"Fabrikam's IT support team was drowning in repetitive Microsoft 365 license and onboarding tickets. Agents spent 60% of their time on issues that had identical resolutions.",
		solution:
			"Deployed SupportDesk 365's AI agents to auto-resolve password resets, license requests, and onboarding checklists. Integrated directly with their Azure AD and Teams channels.",
		results: [
			{ metric: "59%", label: "Reduction in headcount needed", icon: Users },
			{ metric: "4 min", label: "Average resolution time", icon: Clock },
			{ metric: "94%", label: "CSAT score", icon: Star },
			{ metric: "$420K", label: "Annual cost savings", icon: TrendingDown },
		],
		quote: "We evaluated six tools. SupportDesk 365 was the only one that had a truly native Microsoft Teams experience — not just a webhook bolted on.",
		author: "Marcus Rivera",
		role: "IT Director",
		plan: "Enterprise",
		featured: true,
	},
	{
		company: "Northwind Traders",
		industry: "Retail",
		logo: "NT",
		color: "bg-emerald-500",
		tagline: "Customer support scaled 4× without adding headcount",
		challenge: "A peak-season surge doubled inbound customer tickets. The team had no way to predict volume or automatically route by urgency.",
		solution:
			"Used SupportDesk 365's predictive routing, SLA breach alerts, and canned responses powered by AI to handle peak load without hiring seasonal agents.",
		results: [
			{ metric: "4×", label: "Volume handled, same team size", icon: TrendingDown },
			{ metric: "98%", label: "SLA compliance during peak", icon: Shield },
			{ metric: "2.1 hrs", label: "Average first response time", icon: Clock },
			{ metric: "89%", label: "CSAT score during peak season", icon: Star },
		],
		quote: "Last holiday season was the first in five years where I wasn't personally working weekends to keep tickets green.",
		author: "Priya Patel",
		role: "VP Operations",
		plan: "Professional",
		featured: false,
	},
	{
		company: "Contoso Healthcare",
		industry: "Healthcare",
		logo: "CH",
		color: "bg-red-500",
		tagline: "HIPAA-compliant IT support with zero ticket leaks",
		challenge:
			"Healthcare IT requires airtight data handling. Legacy tools couldn't enforce HIPAA-compliant data residency or audit trails for every ticket action.",
		solution:
			"Deployed the Enterprise plan with EU data residency, full audit logging, and custom role-based access controls tied to their Active Directory groups.",
		results: [
			{ metric: "100%", label: "Audit trail coverage", icon: Shield },
			{ metric: "0", label: "Data residency violations in 18 months", icon: Globe },
			{ metric: "73%", label: "Faster compliance reporting", icon: BarChart3 },
			{ metric: "91%", label: "Agent satisfaction score", icon: Star },
		],
		quote: "In healthcare, a data breach is existential. SupportDesk 365 gave us the controls and audit trails that legacy tools never could.",
		author: "Dr. Sandra Lin",
		role: "CISO",
		plan: "Enterprise",
		featured: false,
	},
	{
		company: "Tailwind Finance",
		industry: "Finance",
		logo: "TF",
		color: "bg-amber-500",
		tagline: "Reduced ticket backlog from 3,200 to under 50 in 30 days",
		challenge:
			"A migration to Microsoft 365 generated a massive ticket backlog. Manual triage made prioritization nearly impossible and response times ballooned to 5+ days.",
		solution:
			"Used AI triage and priority routing to clear the backlog. Automated responses handled 60% of migration-related tickets with zero agent involvement.",
		results: [
			{ metric: "98%", label: "Backlog reduction in 30 days", icon: TrendingDown },
			{ metric: "60%", label: "Tickets auto-resolved by AI", icon: Zap },
			{ metric: "6 hrs", label: "Down from 5-day response time", icon: Clock },
			{ metric: "$210K", label: "Saved in contractor costs", icon: BarChart3 },
		],
		quote: "The AI triage alone paid for 18 months of our subscription in a single month.",
		author: "James Okonkwo",
		role: "Head of IT",
		plan: "Professional",
		featured: false,
	},
	{
		company: "Adventure Works",
		industry: "Retail",
		logo: "AW",
		color: "bg-violet-500",
		tagline: "Unified 14 regional support queues into one intelligent inbox",
		challenge:
			"Fourteen regional offices each managed their own ticket queues in different tools. Cross-region escalations fell through the cracks regularly.",
		solution:
			"Consolidated all queues into SupportDesk 365 with region-aware routing, automatic escalation paths, and a shared analytics dashboard for regional managers.",
		results: [
			{ metric: "14→1", label: "Queues unified into one", icon: Users },
			{ metric: "0", label: "Cross-region escalation failures in 6 months", icon: Shield },
			{ metric: "41%", label: "Reduction in duplicate tickets", icon: TrendingDown },
			{ metric: "96%", label: "CSAT across all regions", icon: Star },
		],
		quote: "For the first time, our regional managers see the same data at the same time. That alone changed how we run our Monday standups.",
		author: "Lena Hoffmann",
		role: "Global Support Manager",
		plan: "Enterprise",
		featured: false,
	},
	{
		company: "Wingtip University",
		industry: "Education",
		logo: "WU",
		color: "bg-sky-500",
		tagline: "Student IT support tickets down 67% in one semester",
		challenge:
			"University IT was overwhelmed at the start of each semester with identical password and enrollment system queries from thousands of students.",
		solution:
			"Built a self-service knowledge base with AI-assisted answers, auto-resolved the top 10 recurring query types, and integrated with their student portal via the API.",
		results: [
			{ metric: "67%", label: "Ticket reduction in first semester", icon: TrendingDown },
			{ metric: "4.8/5", label: "Student satisfaction score", icon: Star },
			{ metric: "8 min", label: "Average resolution time (down from 3 days)", icon: Clock },
			{ metric: "3 agents", label: "Now handles what took 11", icon: Users },
		],
		quote: "Our IT team finally has time to work on strategic projects instead of resetting passwords 300 times a day.",
		author: "Prof. David Osei",
		role: "VP Information Technology",
		plan: "Professional",
		featured: false,
	},
];

const GLOBAL_STATS = [
	{ value: "1,200+", label: "Customers worldwide" },
	{ value: "40+", label: "Countries served" },
	{ value: "73%", label: "Average ticket deflection" },
	{ value: "4.9/5", label: "Average CSAT rating" },
];

export default function CustomersPage() {
	const [activeIndustry, setActiveIndustry] = useState("All");

	const filtered = activeIndustry === "All" ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.industry === activeIndustry);

	const featured = CASE_STUDIES.find((c) => c.featured)!;
	const rest = filtered.filter((c) => !c.featured || activeIndustry !== "All");

	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 text-center max-w-3xl">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
						<Star className="size-3.5" />
						1,200+ teams. Real results.
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">Customer stories</h1>
					<p className="text-xl text-muted-foreground leading-relaxed text-pretty">
						See how support teams across every industry use SupportDesk 365 to resolve tickets faster, reduce costs, and finally get ahead of the
						queue.
					</p>
				</div>
			</section>

			{/* Global stats strip */}
			<section className="border-b border-border">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border max-w-5xl mx-auto">
						{GLOBAL_STATS.map(({ value, label }) => (
							<div
								key={label}
								className="flex flex-col items-center justify-center gap-1 bg-card py-10 text-center hover:bg-primary/5 transition-colors">
								<div className="text-3xl font-black">{value}</div>
								<div className="text-sm text-muted-foreground">{label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Featured case study */}
			{activeIndustry === "All" && (
				<section className="container mx-auto px-4 py-20 max-w-6xl">
					<div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
						<div className="grid md:grid-cols-2 gap-0">
							{/* Left — story */}
							<div className="p-10 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-primary/10">
								<div className="flex items-center gap-3">
									<div
										className={`size-12 rounded-xl ${featured.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
										{featured.logo}
									</div>
									<div>
										<p className="font-bold">{featured.company}</p>
										<p className="text-xs text-muted-foreground">
											{featured.industry} · {featured.plan} plan
										</p>
									</div>
									<span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-semibold">Featured</span>
								</div>
								<h2 className="text-2xl font-bold text-balance">{featured.tagline}</h2>
								<div>
									<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">The challenge</p>
									<p className="text-sm text-muted-foreground leading-relaxed">{featured.challenge}</p>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">The solution</p>
									<p className="text-sm text-muted-foreground leading-relaxed">{featured.solution}</p>
								</div>
								<div className="mt-auto pt-4 border-t border-primary/10">
									<div className="flex gap-1 mb-3">
										{Array.from({ length: 5 }).map((_, i) => (
											<Star key={i} className="size-3.5 fill-primary text-primary" />
										))}
									</div>
									<blockquote className="text-sm text-foreground leading-relaxed mb-3 flex gap-2">
										<Quote className="size-4 text-primary shrink-0 mt-0.5" />"{featured.quote}"
									</blockquote>
									<p className="text-sm font-semibold">{featured.author}</p>
									<p className="text-xs text-muted-foreground">
										{featured.role}, {featured.company}
									</p>
								</div>
							</div>

							{/* Right — metrics */}
							<div className="p-10 flex flex-col gap-6">
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Results</p>
								<div className="grid grid-cols-2 gap-4 flex-1">
									{featured.results.map(({ metric, label, icon: Icon }) => (
										<div key={label} className="flex flex-col gap-2 p-5 rounded-xl bg-card border border-border">
											<Icon className="size-4 text-primary" />
											<p className="text-3xl font-black">{metric}</p>
											<p className="text-xs text-muted-foreground leading-snug">{label}</p>
										</div>
									))}
								</div>
								<Button asChild className="group h-11 w-full mt-auto">
									<a href="/contact">
										Get similar results
										<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
									</a>
								</Button>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Filter bar + grid */}
			<section className="border-t border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4">
					{/* Industry filter */}
					<div className="flex flex-wrap justify-center gap-2 mb-10">
						{INDUSTRIES.map((ind) => (
							<button
								key={ind}
								onClick={() => setActiveIndustry(ind)}
								className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
									activeIndustry === ind
										? "bg-primary text-primary-foreground border-primary"
										: "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
								}`}>
								{ind}
							</button>
						))}
					</div>

					{/* Cards grid */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
						{rest.map(({ company, industry, logo, color, tagline, results, quote, author, role, plan }) => (
							<div
								key={company}
								className="flex flex-col gap-5 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
								{/* Header */}
								<div className="flex items-center gap-3">
									<div className={`size-10 rounded-xl ${color} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
										{logo}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-sm truncate">{company}</p>
										<p className="text-xs text-muted-foreground">{industry}</p>
									</div>
									<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium shrink-0">
										{plan}
									</span>
								</div>

								{/* Tagline */}
								<h3 className="text-sm font-semibold leading-snug">{tagline}</h3>

								{/* Top 2 metrics */}
								<div className="grid grid-cols-2 gap-3">
									{results.slice(0, 2).map(({ metric, label, icon: Icon }) => (
										<div key={label} className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/50 border border-border">
											<Icon className="size-3.5 text-primary" />
											<p className="text-xl font-black">{metric}</p>
											<p className="text-[11px] text-muted-foreground leading-snug">{label}</p>
										</div>
									))}
								</div>

								{/* Quote */}
								<blockquote className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-3 flex-1">
									"{quote}"
								</blockquote>

								{/* Author */}
								<div className="flex items-center justify-between pt-3 border-t border-border">
									<div>
										<p className="text-xs font-semibold">{author}</p>
										<p className="text-[11px] text-muted-foreground">{role}</p>
									</div>
									<ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 border-t border-border">
				<div className="container mx-auto px-4 text-center max-w-2xl">
					<h2 className="text-3xl font-bold mb-4">Ready to write your own story?</h2>
					<p className="text-muted-foreground mb-8 leading-relaxed">
						Join 1,200+ support teams that have already transformed how they handle tickets. Start your free trial today — no credit card required.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3">
						<Button size="lg" asChild className="group h-12 px-8">
							<a href="/signup">
								Start free trial
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="h-12 px-8">
							<a href="/contact">Talk to sales</a>
						</Button>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
