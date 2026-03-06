import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingDown, Clock, Users, Zap, ChevronRight, Quote, BarChart3, Shield, Globe, TrendingUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useInView, useCounter, SectionBadge } from "./shared";

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

export default function CustomersPage() {
	const [activeIndustry, setActiveIndustry] = useState("All");
	const [heroVisible, setHeroVisible] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
	const statsRef = useInView();
	const c1200 = useCounter(1200, 1200, statsRef.inView);
	const c40 = useCounter(40, 900, statsRef.inView);
	const c73 = useCounter(73, 1100, statsRef.inView);
	const c49 = useCounter(49, 1300, statsRef.inView);

	useEffect(() => {
		const id = requestAnimationFrame(() => setHeroVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);

	const onMove = useCallback((e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY }), []);
	useEffect(() => {
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, [onMove]);

	const filtered = activeIndustry === "All" ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.industry === activeIndustry);
	const featured = CASE_STUDIES.find((c) => c.featured)!;
	const rest = filtered.filter((c) => !c.featured || activeIndustry !== "All");

	return (
		<SiteLayout>
			{/* ── HERO ── */}
			<section className="relative pt-16 pb-20 md:pt-28 md:pb-24 border-b border-border overflow-hidden">
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
					<div
						className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
						style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
					/>
					<div
						className="absolute inset-0 opacity-[0.025]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
					/>
				</div>
				<div className="container mx-auto px-4 text-center max-w-3xl relative">
					<div className={`transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<SectionBadge icon={Star} label="1,200+ teams. Real results." />
						<h1 className="text-5xl md:text-[5rem] font-black mb-5 text-balance tracking-tight" style={{ lineHeight: 1.04 }}>
							Customer{" "}
							<span
								style={{
									background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}>
								stories
							</span>
						</h1>
						<p
							className={`text-xl text-muted-foreground leading-relaxed text-pretty transition-all duration-1000 delay-150 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							See how support teams across every industry use SupportDesk 365 to resolve tickets faster, reduce costs, and finally get ahead of
							the queue.
						</p>
					</div>

					{/* Stat strip */}
					<div
						ref={statsRef.ref as React.RefObject<HTMLDivElement>}
						className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 transition-all duration-1000 delay-400 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						{[
							{ icon: Users, displayValue: `${c1200.toLocaleString()}+`, label: "Customers worldwide" },
							{ icon: Globe, displayValue: `${c40}+`, label: "Countries served" },
							{ icon: TrendingUp, displayValue: `${c73}%`, label: "Avg. ticket deflection" },
							{ icon: Star, displayValue: `${(c49 / 10).toFixed(1)}/5`, label: "Average CSAT rating" },
						].map(({ icon: Icon, displayValue, label }, i) => (
							<div
								key={label}
								className={`group relative flex flex-col items-center gap-1.5 py-6 px-4 rounded-2xl border transition-all duration-700 hover:-translate-y-1 hover:shadow-lg overflow-hidden cursor-default ${statsRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ background: "var(--color-card)", borderColor: "var(--color-border)", transitionDelay: `${i * 80}ms` }}>
								<div
									className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
									style={{
										background:
											"radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
									}}
								/>
								<Icon className="size-4 text-primary mb-0.5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
								<span
									className="text-2xl font-black relative z-10"
									style={{ color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>
									{displayValue}
								</span>
								<span className="text-xs text-muted-foreground relative z-10">{label}</span>
							</div>
						))}
					</div>
				</div>
			</section>{" "}
			{activeIndustry === "All" && <FeaturedCaseStudy featured={featured} />}
			{/* Filter bar + grid */}
			<CaseStudiesGrid rest={rest} activeIndustry={activeIndustry} setActiveIndustry={setActiveIndustry} />
			<CustomersCtaSection />
		</SiteLayout>
	);
}

function FeaturedCaseStudy({ featured }: { featured: (typeof CASE_STUDIES)[0] }) {
	const { ref, inView } = useInView({ threshold: 0.05 });
	return (
		<section ref={ref} className="container mx-auto px-4 py-20 max-w-6xl">
			<div
				className={`rounded-3xl border overflow-hidden transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
				style={{
					borderColor: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
					background: "color-mix(in srgb, var(--color-primary) 4%, transparent)",
				}}>
				<div className="grid md:grid-cols-2 gap-0">
					{/* Left — story */}
					<div className="p-10 flex flex-col gap-6" style={{ borderRight: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
						<div className="flex items-center gap-3">
							<div className={`size-12 rounded-xl ${featured.color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
								{featured.logo}
							</div>
							<div>
								<p className="font-bold">{featured.company}</p>
								<p className="text-xs text-muted-foreground">
									{featured.industry} · {featured.plan} plan
								</p>
							</div>
							<span
								className="ml-auto text-xs px-2.5 py-1 rounded-full font-bold"
								style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
								Featured
							</span>
						</div>
						<h2 className="text-2xl font-black text-balance leading-snug">{featured.tagline}</h2>
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">The challenge</p>
							<p className="text-sm text-muted-foreground leading-relaxed">{featured.challenge}</p>
						</div>
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">The solution</p>
							<p className="text-sm text-muted-foreground leading-relaxed">{featured.solution}</p>
						</div>
						<div className="mt-auto pt-4" style={{ borderTop: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
							<div className="flex gap-1 mb-3">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star key={i} className="size-3.5 fill-primary text-primary" />
								))}
							</div>
							<blockquote className="text-sm text-foreground leading-relaxed mb-3 flex gap-2">
								<Quote className="size-4 text-primary shrink-0 mt-0.5" />"{featured.quote}"
							</blockquote>
							<p className="text-sm font-bold">{featured.author}</p>
							<p className="text-xs text-muted-foreground">
								{featured.role}, {featured.company}
							</p>
						</div>
					</div>
					{/* Right — metrics */}
					<div className="p-10 flex flex-col gap-6">
						<p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Results</p>
						<div className="grid grid-cols-2 gap-4 flex-1">
							{featured.results.map(({ metric, label, icon: Icon }) => (
								<div
									key={label}
									className="group/metric flex flex-col gap-2 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
									style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
									<Icon className="size-4" style={{ color: "var(--color-primary)" }} />
									<p className="text-3xl font-black transition-colors duration-200" style={{ color: "var(--color-primary)" }}>
										{metric}
									</p>
									<p className="text-xs text-muted-foreground leading-snug">{label}</p>
								</div>
							))}
						</div>
						<Button size="xl" asChild className="group w-full mt-auto font-bold">
							<a href="/contact">
								Get similar results
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}

function CaseStudiesGrid({
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
		<section ref={ref} className="border-t border-border py-16" style={{ background: "color-mix(in srgb, var(--color-muted) 10%, transparent)" }}>
			<div className="container mx-auto px-4">
				{/* Industry filter */}
				<div className="flex flex-wrap justify-center gap-2 mb-10">
					{INDUSTRIES.map((ind) => (
						<button
							key={ind}
							onClick={() => setActiveIndustry(ind)}
							className={`relative px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 hover:-translate-y-0.5 ${activeIndustry === ind ? "text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
							style={
								activeIndustry === ind
									? {
										background: "var(--color-primary)",
										borderColor: "var(--color-primary)",
										boxShadow: "0 4px 14px -4px color-mix(in srgb, var(--color-primary) 50%, transparent)",
									}
									: { background: "var(--color-card)", borderColor: "var(--color-border)" }
							}>
							{ind}
							{activeIndustry === ind && (
								<span
									className="absolute -top-0.5 -right-0.5 size-2 rounded-full animate-pulse"
									style={{ background: "var(--color-accent)" }}
								/>
							)}
						</button>
					))}
				</div>
				{/* Cards grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
					{rest.map(({ company, industry, logo, color, tagline, results, quote, author, role, plan }, i) => (
						<div
							key={company}
							className={`group relative flex flex-col gap-5 p-7 rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "0 2px 16px -4px rgba(0,0,0,0.06)", transitionDelay: `${i * 70}ms` }}>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 70%)",
								}}
							/>
							<div
								className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 28%, transparent)" }}
							/>
							{/* Header */}
							<div className="flex items-center gap-3 relative z-10">
								<div className={`size-10 rounded-xl ${color} flex items-center justify-center text-white font-black text-xs shrink-0`}>
									{logo}
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-bold text-sm truncate">{company}</p>
									<p className="text-xs text-muted-foreground">{industry}</p>
								</div>
								<span
									className="text-xs px-2 py-0.5 rounded-full border font-semibold shrink-0"
									style={{
										background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
										color: "var(--color-primary)",
										borderColor: "color-mix(in srgb, var(--color-primary) 25%, transparent)",
									}}>
									{plan}
								</span>
							</div>
							{/* Tagline */}
							<h3 className="text-sm font-bold leading-snug relative z-10 group-hover:text-primary transition-colors duration-200">{tagline}</h3>
							{/* Top 2 metrics */}
							<div className="grid grid-cols-2 gap-3 relative z-10">
								{results.slice(0, 2).map(({ metric, label, icon: Icon }) => (
									<div
										key={label}
										className="flex flex-col gap-1.5 p-3 rounded-xl border transition-all duration-300"
										style={{
											background: "color-mix(in srgb, var(--color-primary) 4%, transparent)",
											borderColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
										}}>
										<Icon className="size-3.5" style={{ color: "var(--color-primary)" }} />
										<p className="text-xl font-black" style={{ color: "var(--color-primary)" }}>
											{metric}
										</p>
										<p className="text-[11px] text-muted-foreground leading-snug">{label}</p>
									</div>
								))}
							</div>
							{/* Quote */}
							<blockquote
								className="text-xs text-muted-foreground leading-relaxed italic pl-3 flex-1 relative z-10"
								style={{ borderLeft: "2px solid color-mix(in srgb, var(--color-primary) 35%, transparent)" }}>
								"{quote}"
							</blockquote>
							{/* Author */}
							<div className="flex items-center justify-between pt-3 border-t border-border relative z-10">
								<div>
									<p className="text-xs font-bold">{author}</p>
									<p className="text-[11px] text-muted-foreground">{role}</p>
								</div>
								<ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function CustomersCtaSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-20">
			<div
				className={`relative max-w-5xl mx-auto rounded-3xl overflow-hidden p-12 md:p-20 text-center transition-all duration-1000 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
				style={{
					background: "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 75%, var(--color-accent)) 100%)",
					boxShadow: "0 40px 100px -20px color-mix(in srgb, var(--color-primary) 40%, transparent)",
				}}>
				<div
					className="absolute inset-0 opacity-[0.07] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
				/>
				<div className="absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
				<div className="relative z-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-sm font-semibold text-white mb-8">
						<Star className="size-3.5" /> 1,200+ happy teams
					</div>
					<h2 className="text-4xl md:text-5xl font-black mb-5 text-white text-balance tracking-tight">Ready to write your own story?</h2>
					<p className="text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
						Join 1,200+ support teams that have already transformed how they handle tickets. No credit card required.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button
							size="xl"
							asChild
							className="group bg-white hover:bg-white/90 font-bold"
							style={{ color: "var(--color-primary)" }}>
							<a href="/auth/signup">
								Start free trial
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button
							size="xl"
							variant="outline"
							asChild
							className="text-white border-white/35 hover:bg-white/10">
							<a href="/contact">Talk to sales</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
