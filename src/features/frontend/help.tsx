import { SiteLayout } from "./site-layout";
import {
	Bot,
	Zap,
	Users,
	BarChart3,
	Settings,
	CreditCard,
	Search,
	MessageSquare,
	BookOpen,
	FileText,
	ArrowRight,
	ArrowUpRight,
	Video,
} from "lucide-react";
import { useState } from "react";
import { useInView, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, DarkCta } from "./shared";

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
	const visible = useMountVisible();
	const [query, setQuery] = useState("");

	const filtered = query.trim().length > 1 ? ALL_ARTICLES.filter((a) => a.title.toLowerCase().includes(query.toLowerCase())) : [];

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
								KNOWLEDGE_BASE — 350+ ARTICLES INDEXED<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							How can{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								we help?
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
							Find answers, browse guides, or reach out — we're here for every kind of Pulse user.
						</p>

						{/* search console */}
						<div className="max-w-2xl">
							<div className="border border-border bg-background focus-within:border-primary transition-colors">
								<div className="flex items-center justify-between px-4 py-2 border-b border-border">
									<span className="font-mono text-[10px] tracking-[0.25em] text-primary">QUERY</span>
									<span className="font-mono text-[10px] tracking-widest text-muted-foreground/60">{ALL_ARTICLES.length}+ DOCS INDEXED</span>
								</div>
								<div className="relative">
									<Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-accent pointer-events-none" />
									<input
										type="search"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										placeholder="Search the index..."
										className="w-full h-14 pl-12 pr-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground placeholder:font-mono placeholder:text-xs placeholder:tracking-widest placeholder:uppercase focus:outline-none"
									/>
								</div>
							</div>

							{/* inline results */}
							{filtered.length > 0 && (
								<div className="mt-2 border border-border bg-background divide-y divide-border text-left">
									{filtered.slice(0, 6).map((a, i) => (
										<a key={i} href={a.href} className="group flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent/5 transition-colors">
											<span className="font-mono text-[10px] text-accent shrink-0">▸</span>
											<span className="flex-1 group-hover:text-primary transition-colors">{a.title}</span>
											<span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/60">{a.category}</span>
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

							{/* popular chips */}
							{query.length === 0 && (
								<div className="mt-4 flex flex-wrap gap-2">
									{POPULAR_QUERIES.map((p) => (
										<button
											key={p}
											onClick={() => setQuery(p)}
											className="px-3 py-1.5 border border-border font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors duration-200">
											{p}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* trust stats row */}
					<div className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-3 divide-x divide-border">
							{[
								{ value: "< 1 HR", label: "AVG RESPONSE TIME" },
								{ value: "98%", label: "SATISFACTION RATE" },
								{ value: "350+", label: "ARTICLES PUBLISHED" },
							].map(({ value, label }) => (
								<div key={label} className="px-4 md:px-10 py-6">
									<div className="text-2xl md:text-3xl font-black tracking-tighter mb-1.5" style={{ fontVariantNumeric: "tabular-nums" }}>
										{value}
									</div>
									<div className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] text-primary font-semibold">{label}</div>
								</div>
							))}
						</div>
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── QUICK ACCESS ── */}
				<QuickLinksSection />

				{/* ── INDEX ── */}
				<CategoriesSection />

				{/* ── CTA ── */}
				<DarkCta
					tag="03 — ESCALATE · HUMAN SUPPORT"
					headline={
						<>
							Talk to a <span style={{ color: "var(--pulse-lime)" }}>human.</span>
						</>
					}
					desc="Our support team typically responds within 2 hours on business days."
					primary={{ href: "/contact", label: "Contact support" }}
					secondary={{ href: "/status", label: "Check system status" }}
				/>
			</div>
		</SiteLayout>
	);
}

function QuickLinksSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">01 — QUICK ACCESS</MonoTag>
				<MonoTag className="hidden sm:block">SHORTCUTS</MonoTag>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border-b border-border">
				{QUICK_LINKS.map(({ icon: Icon, label, description, href }, i) => (
					<a
						key={label}
						href={href}
						className={`group relative bg-background px-6 py-6 flex items-center gap-4 transition-all duration-500 hover:bg-accent/5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
						style={{ transitionDelay: `${i * 80}ms` }}>
						<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
						<Icon className="size-4 text-accent shrink-0" />
						<div className="min-w-0">
							<div className="text-sm font-bold group-hover:text-primary transition-colors">{label}</div>
							<div className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mt-1">{description}</div>
						</div>
						<ArrowUpRight className="size-3.5 text-muted-foreground/0 group-hover:text-accent transition-colors ml-auto shrink-0" />
					</a>
				))}
			</div>
		</section>
	);
}

function CategoriesSection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="02" label="INDEX" title="Browse by category" right={`${CATEGORIES.length} CATEGORIES / 350+ DOCS`} />
			<div className="h-10" />

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border">
					{CATEGORIES.map(({ icon: Icon, label, description, count, articles }, i) => (
						<div
							key={label}
							className={`group relative bg-background px-6 md:px-8 py-8 flex flex-col transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ transitionDelay: `${i * 70}ms` }}>
							<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />

							<div className="flex items-center justify-between mb-2">
								<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">CAT_0{i + 1}</span>
								<span className="font-mono text-[10px] tracking-widest text-accent">{count} DOCS</span>
							</div>
							<div className="flex items-center gap-3 mb-2">
								<Icon className="size-4 text-accent shrink-0" />
								<h2 className="font-black tracking-tight">{label}</h2>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed mb-6">{description}</p>

							<ul className="divide-y divide-border border-y border-border mb-6">
								{articles.map((a) => (
									<li key={a.title}>
										<a href={a.href} className="group/link flex items-center gap-2.5 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
											<span className="font-mono text-[10px] text-muted-foreground/40 group-hover/link:text-accent transition-colors shrink-0">▸</span>
											<span className="flex-1">{a.title}</span>
											{a.popular && (
												<span className="shrink-0 font-mono text-[8px] tracking-[0.2em] border border-accent/40 text-accent px-1.5 py-0.5">
													POPULAR
												</span>
											)}
										</a>
									</li>
								))}
							</ul>

							<a
								href={`/help/${label.toLowerCase().replace(/\s+/g, "-")}`}
								className="mt-auto inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase font-bold text-primary hover:text-accent transition-colors">
								View all {count} articles <ArrowRight className="size-3" />
							</a>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
