import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, Heart, MapPin, Globe, Linkedin, Twitter, CheckCircle2 } from "lucide-react";

const VALUES = [
	{
		icon: Target,
		title: "Customer-obsessed",
		desc: "Every feature we ship is measured by one question: does it make our customers' support teams faster and happier? We interview 20+ customers before writing a single line of code.",
	},
	{
		icon: Users,
		title: "Transparent by default",
		desc: "We document our changelog, publish our status page uptime, and share the roadmap with customers before we build. No surprises — ever.",
	},
	{
		icon: Heart,
		title: "Built to last",
		desc: "We are profitable and grow sustainably — no growth-at-all-costs shortcuts that put customer data or team wellbeing at risk.",
	},
];

const TIMELINE = [
	{
		year: "2022",
		title: "Founded",
		desc: "Elena and Daniel quit their jobs to build the helpdesk they always wished existed. First 10 customers in 60 days.",
	},
	{ year: "2023", title: "Microsoft 365 native launch", desc: "Shipped the industry's first truly native Teams integration. 300 customers by year-end." },
	{ year: "2024", title: "AI Agents go GA", desc: "Auto-resolution launched publicly. Customers saw 80% ticket deflection within 30 days." },
	{ year: "2025", title: "Global scale", desc: "Reached 1,200 customers across 40 countries. Opened EMEA data residency region." },
];

const TEAM = [
	{
		name: "Elena Torres",
		role: "CEO & Co-founder",
		bio: "Former Director of Support at Fabrikam. Built SupportDesk after spending a decade frustrated by legacy ticketing tools.",
		location: "London, UK",
	},
	{
		name: "Daniel Park",
		role: "CTO & Co-founder",
		bio: "Previously Staff Engineer at Microsoft Azure. Led the team that built Teams' notification infrastructure.",
		location: "Seattle, WA",
	},
	{
		name: "Aisha Okafor",
		role: "Head of Product",
		bio: "Product lead at two previous SaaS exits. Specializes in enterprise UX and AI-assisted workflows.",
		location: "Lagos, Nigeria",
	},
	{
		name: "Ravi Menon",
		role: "Head of Engineering",
		bio: "Distributed systems engineer with 12 years building high-availability platforms across APAC and EMEA.",
		location: "Singapore",
	},
	{
		name: "Sophie Laurent",
		role: "Head of Customer Success",
		bio: "Scaled CS from 0 to 500 enterprise accounts at her last company. Keeps every customer's SLA green.",
		location: "Paris, France",
	},
	{
		name: "Marcus Webb",
		role: "Head of Sales",
		bio: "Focused on enterprise and mid-market deals across EMEA. Former Microsoft 365 solutions architect.",
		location: "Amsterdam, NL",
	},
];

const PRESS = [
	{ outlet: "TechCrunch", quote: '"The most thoughtful Microsoft 365 integration we\'ve seen in a helpdesk — period."' },
	{ outlet: "The Verge", quote: '"AI that actually works: SupportDesk 365 cut our test team\'s resolution time by 75%."' },
	{ outlet: "Forbes", quote: '"One of the 50 most exciting enterprise SaaS companies to watch in 2025."' },
];

const INVESTORS = ["Accel", "Sequoia", "Index Ventures", "Microsoft M12"];

export default function AboutPage() {
	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 max-w-3xl text-center">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
						<Globe className="size-3.5" />
						Founded 2022 · Remote-first · Profitable
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">We exist to fix customer support</h1>
					<p className="text-xl text-muted-foreground leading-relaxed text-pretty">
						SupportDesk 365 was founded by two people who spent years running support teams and were tired of paying for software that made their
						jobs harder. We built the platform we always wished existed.
					</p>
				</div>
			</section>

			{/* Stats */}
			<section className="border-b border-border">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border max-w-5xl mx-auto">
						{[
							{ value: "2022", label: "Founded" },
							{ value: "47", label: "Team members" },
							{ value: "1,200+", label: "Customers" },
							{ value: "40+", label: "Countries served" },
						].map(({ value, label }) => (
							<div
								key={label}
								className="flex flex-col items-center justify-center gap-1 bg-card py-10 text-center group hover:bg-primary/5 transition-colors">
								<div className="text-3xl font-black">{value}</div>
								<div className="text-sm text-muted-foreground">{label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Mission */}
			<section className="container mx-auto px-4 py-20 md:py-28 max-w-3xl">
				<h2 className="text-3xl font-bold mb-6 text-balance">Our mission</h2>
				<p className="text-lg text-muted-foreground leading-relaxed mb-6">
					Support teams are the unsung heroes of every company. They absorb frustration, solve complex problems under pressure, and represent your
					brand in its most vulnerable moments.
				</p>
				<p className="text-lg text-muted-foreground leading-relaxed mb-8">
					Our mission is to give those teams superpowers — AI that handles the repetitive work, integrations that eliminate tab-switching, and
					analytics that turn gut feelings into confident decisions.
				</p>
				<ul className="space-y-3">
					{["SOC 2 Type II certified", "GDPR & CCPA compliant", "US, EU, and APAC data residency", "Uptime SLA backed by contractual guarantee"].map(
						(item) => (
							<li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
								<CheckCircle2 className="size-4 text-primary shrink-0" />
								{item}
							</li>
						),
					)}
				</ul>
			</section>

			{/* Timeline */}
			<section className="border-t border-b border-border bg-muted/10 py-20">
				<div className="container mx-auto px-4 max-w-3xl">
					<h2 className="text-3xl font-bold mb-12 text-center">Our story</h2>
					<div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border">
						{TIMELINE.map(({ year, title, desc }) => (
							<div key={year} className="relative">
								<div className="absolute -left-8 top-1.5 size-3 rounded-full bg-primary ring-4 ring-background" />
								<p className="text-xs font-mono text-primary font-semibold mb-1">{year}</p>
								<h3 className="font-semibold mb-1">{title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="py-20 md:py-28">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-10 text-center">What we believe</h2>
					<div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
						{VALUES.map(({ icon: Icon, title, desc }) => (
							<div
								key={title}
								className="flex flex-col gap-4 p-7 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
								<div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center">
									<Icon className="size-5 text-primary" />
								</div>
								<h3 className="text-lg font-semibold">{title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Team */}
			<section className="border-t border-border bg-muted/10 py-20 md:py-28">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-2 text-center">Leadership team</h2>
					<p className="text-center text-muted-foreground text-sm mb-10">A team that has built and scaled enterprise SaaS before.</p>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
						{TEAM.map(({ name, role, bio, location }) => (
							<div
								key={name}
								className="flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
								<div className="flex items-center gap-3">
									<div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary shrink-0">
										{name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</div>
									<div>
										<p className="font-semibold text-sm">{name}</p>
										<p className="text-xs text-primary">{role}</p>
									</div>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed flex-1">{bio}</p>
								<div className="flex items-center justify-between pt-3 border-t border-border">
									<span className="flex items-center gap-1 text-xs text-muted-foreground">
										<MapPin className="size-3" />
										{location}
									</span>
									<div className="flex items-center gap-2">
										<button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
											<Linkedin className="size-3.5" />
										</button>
										<button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
											<Twitter className="size-3.5" />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Press & Investors */}
			<section className="border-t border-border py-16">
				<div className="container mx-auto px-4 max-w-5xl">
					<div className="grid md:grid-cols-2 gap-12">
						{/* Press */}
						<div>
							<h3 className="text-lg font-bold mb-6">In the press</h3>
							<div className="space-y-4">
								{PRESS.map(({ outlet, quote }) => (
									<div key={outlet} className="p-4 rounded-xl border border-border bg-card">
										<p className="text-xs font-semibold text-primary mb-2">{outlet}</p>
										<p className="text-sm text-muted-foreground leading-relaxed italic">{quote}</p>
									</div>
								))}
							</div>
						</div>
						{/* Investors */}
						<div>
							<h3 className="text-lg font-bold mb-6">Backed by</h3>
							<div className="grid grid-cols-2 gap-4">
								{INVESTORS.map((inv) => (
									<div key={inv} className="flex items-center justify-center p-5 rounded-xl border border-border bg-card h-20">
										<span className="text-sm font-semibold text-muted-foreground">{inv}</span>
									</div>
								))}
							</div>
							<p className="text-xs text-muted-foreground mt-4 leading-relaxed">
								Profitable and growing — we raise selectively and on our terms.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Join us on the journey</h2>
					<p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
						We are hiring across engineering, product, and customer success. Come build the future of support.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3">
						<Button size="lg" asChild className="group h-12 px-8">
							<a href="/careers">
								View open roles
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="h-12 px-8">
							<a href="/contact">Get in touch</a>
						</Button>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
