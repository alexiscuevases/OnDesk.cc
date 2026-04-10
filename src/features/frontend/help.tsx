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
import { useInView, SectionBadge } from "./shared";

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
		description: "Set up your workspace, invite your team, and connect your channels.",
		count: 22,
		articles: [
			{ title: "Creating your Pulse account", href: "#", popular: true },
			{ title: "Connecting your first channel", href: "#", popular: true },
			{ title: "Inviting your team and setting roles", href: "#" },
			{ title: "Importing existing tickets from Zendesk / Freshdesk", href: "#" },
		],
	},
	{
		icon: Bot,
		label: "Pulse AI Core",
		description: "Deploying and fine-tuning autonomous resolution agents.",
		count: 31,
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
			{ title: "Automation rules reference", href: "#" },
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

const POPULAR_QUERIES = ["Reset password", "Connect Gmail", "Custom email domain", "Export tickets CSV", "Two-factor auth", "SLA breach alert"];

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
			{/* ── HERO ── */}
			<section className="relative pt-16 pb-20 md:pt-28 md:pb-24 border-b border-border overflow-hidden">
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
					<div
						className="absolute inset-0 opacity-[0.025]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
					/>
				</div>
				<div className="container mx-auto px-4 max-w-2xl text-center relative">
					<SectionBadge icon={LifeBuoy} label="Help Center" />
					<h1 className="text-5xl md:text-[5rem] font-black mb-5 text-balance tracking-tight" style={{ lineHeight: 1.04 }}>
						How can{" "}
						<span
							style={{
								background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
							}}>
							we help?
						</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">Find answers, browse guides, or reach out — we're here for every kind of Pulse user.</p>

					{/* Search */}
					<div className="relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search articles..."
							className="w-full h-14 pl-12 pr-4 rounded-2xl border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all shadow-sm"
							style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
							onFocus={(e) => {
								e.currentTarget.style.boxShadow = `0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent)`;
								e.currentTarget.style.borderColor = `color-mix(in srgb, var(--color-primary) 40%, transparent)`;
							}}
							onBlur={(e) => {
								e.currentTarget.style.boxShadow = "";
								e.currentTarget.style.borderColor = "";
							}}
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
							{POPULAR_QUERIES.map((p, i) => (
								<button
									key={p}
									onClick={() => setQuery(p)}
									className="text-xs px-3 py-1.5 rounded-full border text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2"
									style={{
										background: "var(--color-card)",
										borderColor: "var(--color-border)",
										animationDelay: `${i * 60}ms`,
										animationFillMode: "both",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-primary) 40%, transparent)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor = "var(--color-border)";
									}}>
									{p}
								</button>
							))}
						</div>
					)}
				</div>
			</section>

			{/* Trust bar */}
			<HelpTrustBar />

			{/* Quick links */}
			<QuickLinksSection />

			{/* Categories */}
			<CategoriesSection />

			<HelpCtaSection />
		</SiteLayout>
	);
}

function HelpTrustBar() {
	const { ref, inView } = useInView();
	const items = [
		{ icon: Clock, stat: "< 1 hr", label: "Avg. response time" },
		{ icon: ThumbsUp, stat: "98%", label: "Satisfaction rate" },
		{ icon: BookOpen, stat: "350+", label: "Articles published" },
	];
	return (
		<section ref={ref} className="border-b border-border" style={{ background: "var(--color-card)" }}>
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-3 divide-x divide-border max-w-2xl mx-auto">
					{items.map(({ icon: Icon, stat, label }, i) => (
						<div
							key={label}
							className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-5 px-4 text-center sm:text-left transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
							style={{ transitionDelay: `${i * 100}ms` }}>
							<Icon className="size-4 shrink-0" style={{ color: "var(--color-primary)" }} />
							<div>
								<div className="text-sm font-black" style={{ color: "var(--color-primary)" }}>
									{stat}
								</div>
								<div className="text-xs text-muted-foreground">{label}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function QuickLinksSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 pt-14 pb-0 max-w-5xl">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{QUICK_LINKS.map(({ icon: Icon, label, description, href }, i) => (
					<a
						key={label}
						href={href}
						className={`group relative flex items-center gap-3 p-4 rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ background: "var(--color-card)", borderColor: "var(--color-border)", transitionDelay: `${i * 80}ms` }}>
						<div
							className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
							style={{
								background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
							}}
						/>
						<div
							className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
							style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 28%, transparent)" }}
						/>
						<div
							className="size-10 rounded-xl flex items-center justify-center shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110"
							style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
							<Icon className="size-4" style={{ color: "var(--color-primary)" }} />
						</div>
						<div className="relative z-10">
							<div className="text-sm font-bold">{label}</div>
							<div className="text-xs text-muted-foreground">{description}</div>
						</div>
					</a>
				))}
			</div>
		</section>
	);
}

function CategoriesSection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref} className="container mx-auto px-4 py-14 md:py-20">
			<h2
				className={`text-xl font-bold mb-6 max-w-5xl mx-auto transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				Browse by category
			</h2>
			<div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5">
				{CATEGORIES.map(({ icon: Icon, label, description, count, articles }, i) => (
					<div
						key={label}
						className={`group relative flex flex-col gap-4 p-6 rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
						style={{ background: "var(--color-card)", borderColor: "var(--color-border)", transitionDelay: `${i * 70 + 100}ms` }}>
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
						<div className="flex items-center justify-between relative z-10">
							<div className="flex items-center gap-3">
								<div
									className="size-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
									style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
									<Icon className="size-5" style={{ color: "var(--color-primary)" }} />
								</div>
								<div>
									<h2 className="text-sm font-bold">{label}</h2>
									<p className="text-xs text-muted-foreground">{description}</p>
								</div>
							</div>
							<span
								className="text-xs text-muted-foreground rounded-full px-2 py-0.5 shrink-0 font-semibold"
								style={{ background: "color-mix(in srgb, var(--color-muted) 60%, transparent)" }}>
								{count}
							</span>
						</div>
						<ul className="space-y-2 border-t border-border pt-4 relative z-10">
							{articles.map((a) => (
								<li key={a.title}>
									<a
										href={a.href}
										className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground group/link transition-colors">
										<ChevronRight className="size-3 shrink-0 text-muted-foreground/40 group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all" />
										<span className="flex-1">{a.title}</span>
										{a.popular && (
											<span
												className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border"
												style={{
													background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
													color: "var(--color-primary)",
													borderColor: "color-mix(in srgb, var(--color-primary) 25%, transparent)",
												}}>
												Popular
											</span>
										)}
									</a>
								</li>
							))}
						</ul>
						<a
							href={`/help/${label.toLowerCase().replace(/\s+/g, "-")}`}
							className="flex items-center gap-1 text-xs font-semibold mt-auto group/more relative z-10 transition-colors"
							style={{ color: "var(--color-primary)" }}>
							View all {count} articles
							<ArrowRight className="size-3 group-hover/more:translate-x-0.5 transition-transform" />
						</a>
					</div>
				))}
			</div>
		</section>
	);
}

function HelpCtaSection() {
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
						<MessageSquare className="size-3.5" /> Still need help?
					</div>
					<h2 className="text-4xl md:text-5xl font-black mb-5 text-white text-balance tracking-tight">Talk to a human</h2>
					<p className="text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
						Our support team typically responds within 2 hours on business days.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button
							asChild
							className="group h-12 px-8 bg-white hover:bg-white/90 hover:-translate-y-0.5 transition-all duration-300 font-bold"
							style={{ color: "var(--color-primary)" }}>
							<a href="/contact">
								Contact support
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button
							variant="outline"
							asChild
							className="h-12 px-8 text-white border-white/35 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300">
							<a href="/status">Check system status</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
