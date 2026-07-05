import { SiteLayout } from "./site-layout";
import { ArrowRight, ArrowUpRight, Star, TrendingDown, Clock, Users, Zap, BarChart3, Shield, Globe } from "lucide-react";
import { useState } from "react";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";

const INDUSTRIES = ["All", "Technology", "Retail", "Agency", "Finance", "Healthcare", "Education"];

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
			"Deployed Pulse AI agents to auto-resolve password resets, license requests, and onboarding checklists. Integrated directly with their Azure AD and Teams channels.",
		results: [
			{ metric: "59%", label: "Reduction in headcount needed", icon: Users },
			{ metric: "4 min", label: "Average resolution time", icon: Clock },
			{ metric: "94%", label: "CSAT score", icon: Star },
			{ metric: "$420K", label: "Annual cost savings", icon: TrendingDown },
		],
		quote: "We evaluated six tools. Pulse was the only one that had a truly native Microsoft Teams orchestration — not just a webhook bolted on.",
		author: "Marcus Rivera",
		role: "IT Director",
		plan: "ENTERPRISE",
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
			"Used Pulse's predictive routing, SLA breach alerts, and autonomous responses to handle peak load without hiring seasonal agents.",
		results: [
			{ metric: "4×", label: "Volume handled, same team size", icon: TrendingDown },
			{ metric: "98%", label: "SLA compliance during peak", icon: Shield },
			{ metric: "2.1 hrs", label: "Average first response time", icon: Clock },
			{ metric: "89%", label: "CSAT score during peak season", icon: Star },
		],
		quote: "Last holiday season was the first in five years where I wasn't personally working weekends to keep tickets green.",
		author: "Priya Patel",
		role: "VP Operations",
		plan: "PROFESSIONAL",
		featured: false,
	},
	{
		company: "BrightSupport Agency",
		industry: "Agency",
		logo: "BS",
		color: "bg-indigo-500",
		tagline: "8 clients. 1 inbox. Zero context-switching.",
		challenge:
			"BrightSupport managed email support for 8 SaaS clients across 4 different tools. Agents constantly switched tabs, mixed up client voices, and lacked any cross-client reporting to show clients what they were actually getting.",
		solution:
			"Consolidated all clients into Pulse with separate client workspaces, custom inboxes per client, and a shared analytics view for reporting. Each agent was scoped to their assigned clients only.",
		results: [
			{ metric: "8", label: "Clients in one workspace", icon: Users },
			{ metric: "60%", label: "Less time on context-switching", icon: Clock },
			{ metric: "100%", label: "Client data isolation", icon: Shield },
			{ metric: "3×", label: "Faster monthly reporting", icon: BarChart3 },
		],
		quote: "We onboard new clients in under an hour now. The isolation between client workspaces is exactly what we needed to feel confident nothing would bleed across.",
		author: "James Okafor",
		role: "Operations Lead",
		plan: "CORE",
		featured: false,
	},
	{
		company: "Torres Digital",
		industry: "Technology",
		logo: "TD",
		color: "bg-teal-500",
		tagline: "Solo consultant. 3 products. Zero dropped requests.",
		challenge:
			"Mia Torres managed client support solo for three SaaS products she'd built. Requests came through email, a contact form, and Twitter DMs. She was constantly dropping things and losing track of who she'd replied to.",
		solution:
			"Connected all 3 channels to Pulse Starter in one afternoon. Set up canned replies for her 10 most common questions and an auto-reply for nights and weekends.",
		results: [
			{ metric: "< 10 min", label: "Setup time", icon: Zap },
			{ metric: "3", label: "Products managed solo", icon: Users },
			{ metric: "0", label: "Dropped requests since launch", icon: Shield },
			{ metric: "2×", label: "Faster reply time", icon: Clock },
		],
		quote: "I was running support across three inboxes and two browsers. Pulse Starter pulled it all together in an afternoon. I haven't missed a message since.",
		author: "Mia Torres",
		role: "Independent Consultant",
		plan: "STARTER",
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
		quote: "In healthcare, a data breach is existential. Pulse gave us the controls and sovereign audit trails that legacy tools never could.",
		author: "Dr. Sandra Lin",
		role: "CISO",
		plan: "ENTERPRISE",
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
		plan: "PROFESSIONAL",
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
			"Consolidated all queues into Pulse with region-aware routing, automatic escalation paths, and a shared intelligence dashboard for regional managers.",
		results: [
			{ metric: "14→1", label: "Queues unified into one", icon: Users },
			{ metric: "0", label: "Cross-region escalation failures in 6 months", icon: Shield },
			{ metric: "41%", label: "Reduction in duplicate tickets", icon: TrendingDown },
			{ metric: "96%", label: "CSAT across all regions", icon: Star },
		],
		quote: "For the first time, our regional managers see the same data at the same time. That alone changed how we run our Monday standups.",
		author: "Lena Hoffmann",
		role: "Global Support Manager",
		plan: "ENTERPRISE",
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
		plan: "PROFESSIONAL",
		featured: false,
	},
];

export default function CustomersPage() {
	const visible = useMountVisible();
	const [activeIndustry, setActiveIndustry] = useState("All");
	const { ref: statsRef, inView: statsInView } = useInView();
	const c1200 = useCounter(1200, 1200, statsInView);
	const c40 = useCounter(40, 900, statsInView);
	const c73 = useCounter(73, 1100, statsInView);
	const c49 = useCounter(49, 1300, statsInView);

	const filtered = activeIndustry === "All" ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.industry === activeIndustry);
	const featured = CASE_STUDIES.find((c) => c.featured)!;
	const rest = filtered.filter((c) => !c.featured || activeIndustry !== "All");

	return (
		<SiteLayout>
			<div className="mx-auto max-w-350 border-x border-border">
				{/* ── HERO ── */}
				<section className="relative border-b border-border overflow-hidden">
					<div
						className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
					/>

					<div
						className={`relative px-6 md:px-12 pt-16 md:pt-24 pb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<div className="flex items-center gap-3 mb-10">
							<span className="relative flex size-2">
								<span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
								<span className="relative inline-flex size-2 rounded-full bg-accent" />
							</span>
							<MonoTag className="text-foreground/70">
								CASE_FILES — 1,200+ TEAMS ON RECORD<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Real teams,{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								real results
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
							Documented outcomes from support teams, agencies, and solo operators around the world.
						</p>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${c1200.toLocaleString()}+`, label: "CUSTOMERS WORLDWIDE" },
								{ value: `${c40}+`, label: "COUNTRIES SERVED" },
								{ value: `${c73}%`, label: "AVG TICKET DEFLECTION" },
								{ value: `${(c49 / 10).toFixed(1)}/5`, label: "AVERAGE CSAT RATING" },
							].map(({ value, label }, i) => (
								<div
									key={label}
									className={`px-4 md:px-10 py-8 transition-all duration-700 ${statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
									style={{ transitionDelay: `${i * 100}ms` }}>
									<div className="text-3xl md:text-4xl font-black tracking-tighter mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>
										{value}
									</div>
									<div className="font-mono text-[10px] tracking-[0.2em] text-primary font-semibold">{label}</div>
								</div>
							))}
						</div>
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── FEATURED CASE ── */}
				{activeIndustry === "All" && <FeaturedCase featured={featured} />}

				{/* ── CASE INDEX ── */}
				<CasesIndex rest={rest} activeIndustry={activeIndustry} setActiveIndustry={setActiveIndustry} />

				{/* ── CTA ── */}
				<DarkCta
					tag="03 — YOUR TURN · NO CREDIT CARD REQUIRED"
					headline={
						<>
							Ready to write your own <span style={{ color: "var(--pulse-lime)" }}>story?</span>
						</>
					}
					desc="Join 1,200+ support teams that have already transformed how they handle tickets."
					primary={{ href: "/auth/signup", label: "Start free trial" }}
					secondary={{ href: "/contact", label: "Talk to sales" }}
				/>
			</div>
		</SiteLayout>
	);
}

function FeaturedCase({ featured }: { featured: (typeof CASE_STUDIES)[0] }) {
	const { ref, inView } = useInView({ threshold: 0.05 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">01 — FEATURED CASE</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					CASE_001 / {featured.company.toUpperCase()}
				</span>
			</div>

			<div className={`grid lg:grid-cols-12 border-b border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				{/* story */}
				<div className="lg:col-span-7 px-6 md:px-12 py-12 lg:border-r border-border flex flex-col">
					<div className="flex items-center gap-4 mb-8">
						<div className={`size-12 ${featured.color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
							{featured.logo}
						</div>
						<div>
							<p className="font-bold">{featured.company}</p>
							<p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground mt-0.5">
								{featured.industry} · {featured.plan} PLAN
							</p>
						</div>
					</div>

					<h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance mb-8">{featured.tagline}</h2>

					<div className="mb-6">
						<p className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold mb-2">THE CHALLENGE</p>
						<p className="text-sm text-muted-foreground leading-relaxed">{featured.challenge}</p>
					</div>
					<div className="mb-8">
						<p className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold mb-2">THE SOLUTION</p>
						<p className="text-sm text-muted-foreground leading-relaxed">{featured.solution}</p>
					</div>

					<div className="mt-auto border-t border-border pt-6">
						<blockquote className="text-base md:text-lg font-medium leading-relaxed mb-4">"{featured.quote}"</blockquote>
						<p className="font-mono text-xs tracking-wider text-muted-foreground">
							<span className="text-foreground font-bold">{featured.author.toUpperCase()}</span> · {featured.role.toUpperCase()} —{" "}
							{featured.company.toUpperCase()}
						</p>
					</div>
				</div>

				{/* metrics */}
				<div className="lg:col-span-5 border-t lg:border-t-0 border-border flex flex-col">
					<div className="px-6 md:px-10 py-3 border-b border-border">
						<MonoTag className="text-primary">RESULTS</MonoTag>
					</div>
					<div className="grid grid-cols-2 gap-px bg-border flex-1">
						{featured.results.map(({ metric, label, icon: Icon }) => (
							<div key={label} className="bg-background px-6 py-8 flex flex-col justify-center">
								<Icon className="size-4 text-accent mb-3" />
								<p className="text-3xl md:text-4xl font-black tracking-tighter mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>
									{metric}
								</p>
								<p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground leading-relaxed">{label}</p>
							</div>
						))}
					</div>
					<div className="border-t border-border p-6">
						<CtaLink href="/contact">
							Get similar results <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
						</CtaLink>
					</div>
				</div>
			</div>
		</section>
	);
}

function CasesIndex({
	rest,
	activeIndustry,
	setActiveIndustry,
}: {
	rest: typeof CASE_STUDIES;
	activeIndustry: string;
	setActiveIndustry: (v: string) => void;
}) {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="02" label="CASE INDEX" title="Browse the files" right={`${CASE_STUDIES.length} CASES DOCUMENTED`} />
			<div className="h-6" />

			{/* mono filter buttons */}
			<div className="flex flex-wrap gap-2 px-6 md:px-12 pb-10">
				{INDUSTRIES.map((ind) => (
					<button
						key={ind}
						onClick={() => setActiveIndustry(ind)}
						className={`px-4 py-2 border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
							activeIndustry === ind
								? "bg-primary text-primary-foreground border-primary"
								: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
						}`}>
						{ind}
					</button>
				))}
			</div>

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div key={activeIndustry} className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border animate-in fade-in duration-300">
					{rest.map(({ company, industry, logo, color, tagline, results, quote, author, role, plan }, i) => (
						<div
							key={company}
							className={`group relative bg-background px-6 md:px-8 py-8 flex flex-col transition-all duration-500 ${inView ? "opacity-100" : "opacity-0"}`}
							style={{ transitionDelay: `${i * 60}ms` }}>
							<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />

							{/* header */}
							<div className="flex items-center gap-3 mb-6">
								<div className={`size-10 ${color} flex items-center justify-center text-white font-black text-xs shrink-0`}>{logo}</div>
								<div className="flex-1 min-w-0">
									<p className="font-bold text-sm truncate">{company}</p>
									<p className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-foreground mt-0.5">{industry}</p>
								</div>
								<span className="font-mono text-[9px] tracking-[0.15em] border border-border px-1.5 py-0.5 text-muted-foreground shrink-0">
									{plan}
								</span>
							</div>

							<h3 className="text-lg font-black tracking-tight leading-snug mb-6 group-hover:text-primary transition-colors duration-200">
								{tagline}
							</h3>

							{/* top 2 metrics */}
							<div className="grid grid-cols-2 border-y border-border divide-x divide-border mb-6">
								{results.slice(0, 2).map(({ metric, label }) => (
									<div key={label} className="py-4 pr-3 first:pl-0 pl-4">
										<p className="text-2xl font-black tracking-tighter text-primary mb-1" style={{ fontVariantNumeric: "tabular-nums" }}>
											{metric}
										</p>
										<p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground leading-relaxed">{label}</p>
									</div>
								))}
							</div>

							<blockquote className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">"{quote}"</blockquote>

							<div className="flex items-center justify-between pt-4 border-t border-border">
								<div className="font-mono text-[10px] tracking-wider text-muted-foreground min-w-0">
									<span className="text-foreground font-bold">{author.toUpperCase()}</span>
									<span className="block mt-0.5 truncate">{role.toUpperCase()}</span>
								</div>
								<ArrowUpRight className="size-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
