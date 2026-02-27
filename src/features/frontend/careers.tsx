import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Globe, Heart, Zap, TrendingUp, BookOpen, Monitor, Clock, Users, Star, ChevronRight } from "lucide-react";

const STATS = [
	{ value: "47", label: "Team members" },
	{ value: "14", label: "Countries" },
	{ value: "4.9 / 5", label: "Glassdoor rating" },
	{ value: "94%", label: "Would recommend" },
];

const DEPARTMENTS = [
	{
		name: "Engineering",
		count: 4,
		openRoles: [
			{ title: "Senior Backend Engineer — AI Platform", location: "Remote (EU / US)", type: "Full-time", tags: ["Python", "LLMs", "Azure"] },
			{ title: "Frontend Engineer — Design Systems", location: "Remote (EU / US)", type: "Full-time", tags: ["React", "TypeScript", "Tailwind"] },
			{ title: "Staff Engineer — Infrastructure", location: "Remote (EU / US)", type: "Full-time", tags: ["Kubernetes", "Terraform", "GCP"] },
			{ title: "ML Engineer — Ticket Classification", location: "Remote", type: "Full-time", tags: ["NLP", "PyTorch", "Azure OpenAI"] },
		],
	},
	{
		name: "Product & Design",
		count: 2,
		openRoles: [
			{ title: "Senior Product Manager — Core Platform", location: "Remote (EU / US)", type: "Full-time", tags: ["B2B SaaS", "Enterprise", "AI"] },
			{ title: "Product Designer — Enterprise UX", location: "Remote", type: "Full-time", tags: ["Figma", "Research", "Design Systems"] },
		],
	},
	{
		name: "Customer Success",
		count: 2,
		openRoles: [
			{ title: "Customer Success Manager — Enterprise (EMEA)", location: "London or Remote", type: "Full-time", tags: ["Enterprise", "EMEA", "SaaS"] },
			{ title: "Technical Onboarding Specialist", location: "Remote", type: "Full-time", tags: ["Microsoft 365", "Onboarding", "Technical"] },
		],
	},
	{
		name: "Sales",
		count: 2,
		openRoles: [
			{ title: "Account Executive — Mid-Market (EMEA)", location: "London or Remote", type: "Full-time", tags: ["Mid-Market", "EMEA", "SaaS"] },
			{ title: "Sales Engineer", location: "Remote (US)", type: "Full-time", tags: ["Pre-sales", "Microsoft 365", "Technical"] },
		],
	},
];

const PERKS = [
	{ icon: Globe, title: "Fully remote", desc: "Work from wherever you do your best thinking. We have team members across 14 countries." },
	{ icon: TrendingUp, title: "Competitive equity", desc: "Meaningful stock options for every employee — we believe in shared ownership from day one." },
	{ icon: Heart, title: "Health & wellness", desc: "$200/month wellness allowance plus comprehensive medical, dental, and vision." },
	{ icon: BookOpen, title: "Learning budget", desc: "$2,000/year for conferences, courses, and books. No approval required." },
	{ icon: Clock, title: "Generous PTO", desc: "Unlimited PTO with a minimum of 20 days encouraged. We track utilization — we mean it." },
	{ icon: Monitor, title: "Home office stipend", desc: "$1,500 to set up your workspace the way you want it." },
	{ icon: Users, title: "Team retreats", desc: "Two company-wide retreats per year. We have been to Lisbon, Barcelona, and Tokyo." },
	{ icon: Zap, title: "Fast-paced growth", desc: "Tripled ARR in 2024. You will see your work matter and grow with the company." },
];

const PROCESS = [
	{ step: "01", title: "Apply online", desc: "Send your application. We review every submission — no auto-rejections on keywords." },
	{ step: "02", title: "Intro call", desc: "30 minutes with a member of our team to discuss the role and answer your questions." },
	{ step: "03", title: "Technical / work sample", desc: "A focused, paid take-home or live interview relevant to your role. No trick questions." },
	{ step: "04", title: "Final interviews", desc: "Meet 2–3 people you would work with day-to-day. Decision within 5 business days." },
];

const GLASSDOOR = [
	{ quote: "Best company I have worked at. Leadership actually listens, shipping is fast, and the team is world-class.", role: "Senior Engineer" },
	{ quote: "Fully remote done right. Not just tolerated — it is the default. Great async culture.", role: "Product Designer" },
	{ quote: "Unlimited PTO that people actually use. Refreshing for a startup.", role: "Customer Success Manager" },
];

export default function CareersPage() {
	const totalRoles = DEPARTMENTS.reduce((acc, d) => acc + d.openRoles.length, 0);

	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 text-center max-w-3xl">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
						<Zap className="size-3.5" />
						{totalRoles} open positions
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">Build the future of customer support</h1>
					<p className="text-xl text-muted-foreground leading-relaxed text-pretty mb-8">
						We are a remote-first team of 47 people spread across the globe, working to make support teams everywhere faster, happier, and more
						effective.
					</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Globe className="size-4 text-primary" /> 14 countries
						</span>
						<span className="flex items-center gap-1.5">
							<MapPin className="size-4 text-primary" /> Fully remote
						</span>
						<span className="flex items-center gap-1.5">
							<Star className="size-4 text-primary" /> 4.9 / 5 Glassdoor
						</span>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className="border-b border-border">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border max-w-4xl mx-auto">
						{STATS.map(({ value, label }) => (
							<div
								key={label}
								className="flex flex-col items-center justify-center gap-1 bg-card py-8 text-center group hover:bg-primary/5 transition-colors">
								<div className="text-2xl font-bold">{value}</div>
								<div className="text-xs text-muted-foreground">{label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Perks */}
			<section className="container mx-auto px-4 py-20">
				<h2 className="text-3xl font-bold mb-3 text-center">Why work here</h2>
				<p className="text-center text-muted-foreground text-sm mb-10 max-w-xl mx-auto">
					We compete on culture, not just compensation. Here is what that means in practice.
				</p>
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
					{PERKS.map(({ icon: Icon, title, desc }) => (
						<div
							key={title}
							className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
							<div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Icon className="size-5 text-primary" />
							</div>
							<h3 className="font-semibold text-sm">{title}</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* Glassdoor reviews */}
			<section className="border-y border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4 max-w-5xl">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-2xl font-bold">What the team says</h2>
						<div className="flex items-center gap-1.5 text-sm">
							<div className="flex gap-0.5">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star key={i} className="size-3.5 fill-primary text-primary" />
								))}
							</div>
							<span className="font-semibold">4.9</span>
							<span className="text-muted-foreground">on Glassdoor</span>
						</div>
					</div>
					<div className="grid md:grid-cols-3 gap-4">
						{GLASSDOOR.map(({ quote, role }) => (
							<div key={role} className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-card">
								<div className="flex gap-0.5">
									{Array.from({ length: 5 }).map((_, i) => (
										<Star key={i} className="size-3 fill-primary text-primary" />
									))}
								</div>
								<p className="text-sm text-foreground leading-relaxed">"{quote}"</p>
								<p className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border">{role}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Open roles */}
			<section className="py-20">
				<div className="container mx-auto px-4 max-w-4xl">
					<h2 className="text-3xl font-bold mb-2 text-center">Open positions</h2>
					<p className="text-center text-sm text-muted-foreground mb-12">
						{totalRoles} roles across {DEPARTMENTS.length} departments
					</p>
					<div className="space-y-10">
						{DEPARTMENTS.map((dept) => (
							<div key={dept.name}>
								<div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
									<h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{dept.name}</h3>
									<span className="text-xs text-primary font-medium">{dept.openRoles.length} open</span>
								</div>
								<div className="space-y-3">
									{dept.openRoles.map((role) => (
										<div
											key={role.title}
											className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
											<div className="flex-1 min-w-0">
												<p className="font-semibold group-hover:text-primary transition-colors">{role.title}</p>
												<div className="flex flex-wrap gap-3 mt-1.5 text-sm text-muted-foreground">
													<span className="flex items-center gap-1">
														<MapPin className="size-3.5" /> {role.location}
													</span>
													<span>{role.type}</span>
												</div>
												<div className="flex flex-wrap gap-1.5 mt-2">
													{role.tags.map((tag) => (
														<span
															key={tag}
															className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
															{tag}
														</span>
													))}
												</div>
											</div>
											<Button size="sm" variant="outline" asChild className="group/btn shrink-0">
												<a href="/contact">
													Apply
													<ArrowRight className="ml-1.5 size-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
												</a>
											</Button>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Hiring process */}
			<section className="border-t border-border bg-muted/10 py-20">
				<div className="container mx-auto px-4 max-w-4xl">
					<h2 className="text-3xl font-bold mb-3 text-center">Our hiring process</h2>
					<p className="text-center text-sm text-muted-foreground mb-12">Transparent, fast, and respectful of your time.</p>
					<div className="grid md:grid-cols-4 gap-5">
						{PROCESS.map(({ step, title, desc }) => (
							<div key={step} className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-card">
								<span className="text-3xl font-black text-muted-foreground/20">{step}</span>
								<h3 className="font-semibold text-sm">{title}</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* General application */}
			<section className="border-t border-border py-16">
				<div className="container mx-auto px-4 text-center max-w-xl">
					<h2 className="text-2xl font-bold mb-3">Don't see your role?</h2>
					<p className="text-muted-foreground mb-6 text-sm leading-relaxed">
						We are always interested in meeting exceptional people. Send us a note and tell us how you'd contribute.
					</p>
					<Button asChild className="group h-11 px-6">
						<a href="/contact">
							Send a general application
							<ChevronRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
						</a>
					</Button>
				</div>
			</section>
		</SiteLayout>
	);
}
