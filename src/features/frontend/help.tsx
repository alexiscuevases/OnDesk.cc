import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import {
	Bot,
	Zap,
	Users,
	BarChart3,
	Settings,
	CreditCard,
	ChevronRight,
	Search,
	LifeBuoy,
	MessageSquare,
	BookOpen,
	Clock,
	ThumbsUp,
	FileText,
	ArrowRight,
	Video,
} from "lucide-react";
import { useState } from "react";

interface Article {
	title: string;
	href: string;
	popular?: boolean;
}

interface Category {
	icon: typeof Bot;
	label: string;
	description: string;
	count: number;
	articles: Article[];
}

const CATEGORIES: Category[] = [
	{
		icon: Settings,
		label: "Getting Started",
		description: "Onboarding, workspace setup, and first steps.",
		count: 18,
		articles: [
			{ title: "Creating your SupportDesk 365 account", href: "#", popular: true },
			{ title: "Connecting Microsoft 365 to your workspace", href: "#", popular: true },
			{ title: "Inviting your team and setting roles", href: "#" },
			{ title: "Importing existing tickets from Zendesk / Freshdesk", href: "#" },
		],
	},
	{
		icon: Bot,
		label: "AI Agents",
		description: "Set up, train, and fine-tune your AI agents.",
		count: 24,
		articles: [
			{ title: "How AI Agents triage incoming tickets", href: "#", popular: true },
			{ title: "Configuring escalation rules", href: "#" },
			{ title: "Training the AI on your knowledge base", href: "#", popular: true },
			{ title: "Reviewing and editing AI-drafted replies", href: "#" },
		],
	},
	{
		icon: Zap,
		label: "Automations & SLAs",
		description: "Workflows, SLA policies, and routing rules.",
		count: 21,
		articles: [
			{ title: "Creating your first SLA policy", href: "#", popular: true },
			{ title: "Building automation rules with triggers", href: "#" },
			{ title: "Skill-based routing setup", href: "#" },
			{ title: "Power Automate connector reference", href: "#" },
		],
	},
	{
		icon: Users,
		label: "Teams & Roles",
		description: "Permissions, shifts, and workload management.",
		count: 15,
		articles: [
			{ title: "Understanding role-based access control", href: "#" },
			{ title: "Configuring team workload heatmaps", href: "#" },
			{ title: "Setting up shift schedules", href: "#" },
			{ title: "Supervisor dashboards and live monitoring", href: "#" },
		],
	},
	{
		icon: BarChart3,
		label: "Analytics & Reports",
		description: "CSAT, NPS, volume trends, and exports.",
		count: 19,
		articles: [
			{ title: "Understanding your CSAT dashboard", href: "#", popular: true },
			{ title: "Exporting reports to Excel / Power BI", href: "#" },
			{ title: "Setting up volume forecast alerts", href: "#" },
			{ title: "Agent performance report guide", href: "#" },
		],
	},
	{
		icon: CreditCard,
		label: "Billing & Plans",
		description: "Subscriptions, invoices, and seat management.",
		count: 12,
		articles: [
			{ title: "Upgrading or downgrading your plan", href: "#" },
			{ title: "Managing seats and adding users", href: "#", popular: true },
			{ title: "Downloading invoices", href: "#" },
			{ title: "Annual vs monthly billing", href: "#" },
		],
	},
];

const ALL_ARTICLES = CATEGORIES.flatMap((c) => c.articles.map((a) => ({ ...a, category: c.label })));

const POPULAR_QUERIES = ["Reset password", "Teams notifications", "Custom email domain", "Export tickets CSV", "Two-factor auth", "SLA breach alert"];

const QUICK_LINKS = [
	{ icon: Video, label: "Video tutorials", description: "25+ walkthroughs", href: "#" },
	{ icon: FileText, label: "API reference", description: "REST & webhook docs", href: "#" },
	{ icon: BookOpen, label: "Release notes", description: "What changed and why", href: "/changelog" },
	{ icon: MessageSquare, label: "Community forum", description: "Ask fellow users", href: "#" },
];

export default function HelpCenterPage() {
	const [query, setQuery] = useState("");

	const filtered = query.trim().length > 1 ? ALL_ARTICLES.filter((a) => a.title.toLowerCase().includes(query.toLowerCase())) : [];

	return (
		<SiteLayout>
			{/* Hero with search */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 max-w-2xl text-center">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
						<LifeBuoy className="size-3.5" />
						Help Center
					</div>
					<h1 className="text-4xl md:text-5xl font-bold mb-5 text-balance">How can we help?</h1>
					<p className="text-lg text-muted-foreground mb-8 text-pretty">Search our docs or browse by category below.</p>

					{/* Search */}
					<div className="relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search articles..."
							className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
						/>
					</div>

					{/* Inline search results */}
					{filtered.length > 0 && (
						<div className="mt-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden text-left">
							{filtered.slice(0, 6).map((a, i) => (
								<a
									key={i}
									href={a.href}
									className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-0">
									<BookOpen className="size-4 shrink-0 text-muted-foreground" />
									<span className="flex-1">{a.title}</span>
									<span className="text-xs text-muted-foreground">{a.category}</span>
								</a>
							))}
						</div>
					)}
					{query.trim().length > 1 && filtered.length === 0 && (
						<p className="mt-3 text-sm text-muted-foreground">
							No articles matched.{" "}
							<a href="/contact" className="text-primary underline-offset-2 hover:underline">
								Contact support
							</a>
						</p>
					)}

					{/* Popular chips */}
					{query.length === 0 && (
						<div className="mt-6 flex flex-wrap justify-center gap-2">
							{POPULAR_QUERIES.map((p) => (
								<button
									key={p}
									onClick={() => setQuery(p)}
									className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
									{p}
								</button>
							))}
						</div>
					)}
				</div>
			</section>

			{/* Trust bar */}
			<section className="border-b border-border bg-card">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-3 divide-x divide-border max-w-2xl mx-auto">
						{[
							{ icon: Clock, stat: "< 2 hrs", label: "Avg. response time" },
							{ icon: ThumbsUp, stat: "97%", label: "Satisfaction rate" },
							{ icon: BookOpen, stat: "200+", label: "Articles published" },
						].map(({ icon: Icon, stat, label }) => (
							<div key={label} className="flex flex-col sm:flex-row items-center justify-center gap-2 py-4 px-4 text-center sm:text-left">
								<Icon className="size-4 text-primary shrink-0" />
								<div>
									<div className="text-sm font-bold">{stat}</div>
									<div className="text-xs text-muted-foreground">{label}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Quick links */}
			<section className="container mx-auto px-4 pt-14 pb-0 max-w-5xl">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{QUICK_LINKS.map(({ icon: Icon, label, description, href }) => (
						<a
							key={label}
							href={href}
							className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all">
							<div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
								<Icon className="size-4 text-primary" />
							</div>
							<div>
								<div className="text-sm font-semibold">{label}</div>
								<div className="text-xs text-muted-foreground">{description}</div>
							</div>
						</a>
					))}
				</div>
			</section>

			{/* Categories */}
			<section className="container mx-auto px-4 py-14 md:py-20">
				<h2 className="text-xl font-bold mb-6 max-w-5xl mx-auto">Browse by category</h2>
				<div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{CATEGORIES.map(({ icon: Icon, label, description, count, articles }) => (
						<div
							key={label}
							className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
										<Icon className="size-5 text-primary" />
									</div>
									<div>
										<h2 className="text-sm font-semibold">{label}</h2>
										<p className="text-xs text-muted-foreground">{description}</p>
									</div>
								</div>
								<span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 shrink-0">{count}</span>
							</div>

							<ul className="space-y-2 border-t border-border pt-4">
								{articles.map((a) => (
									<li key={a.title}>
										<a
											href={a.href}
											className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground group/link transition-colors">
											<ChevronRight className="size-3 shrink-0 text-muted-foreground/40 group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all" />
											<span className="flex-1">{a.title}</span>
											{a.popular && (
												<span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
													Popular
												</span>
											)}
										</a>
									</li>
								))}
							</ul>

							<a
								href={`/help/${label.toLowerCase().replace(/\s+/g, "-")}`}
								className="flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2 mt-auto group/more">
								View all {count} articles
								<ArrowRight className="size-3 group-hover/more:translate-x-0.5 transition-transform" />
							</a>
						</div>
					))}
				</div>
			</section>

			{/* Still need help */}
			<section className="border-t border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4 max-w-2xl text-center">
					<MessageSquare className="size-8 text-primary mx-auto mb-4" />
					<h2 className="text-2xl font-bold mb-3">Still need help?</h2>
					<p className="text-muted-foreground mb-6 text-pretty">Our support team typically responds within 2 hours on business days.</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3">
						<Button asChild className="group h-11 px-8">
							<a href="/contact">
								Contact support
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button variant="outline" asChild className="h-11 px-8">
							<a href="/status">Check system status</a>
						</Button>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
