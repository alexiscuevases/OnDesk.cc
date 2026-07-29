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
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

// ── Structure ──
// Slugs, doc counts, icons and which articles are "popular" live here. The
// `/help/<slug>` URL comes from `slug`, never from the (translated) label.

type CategoryKey = keyof Dictionary["help"]["categories"];

interface CategoryConfig {
	key: CategoryKey;
	slug: string;
	icon: typeof Bot;
	count: number;
	articles: { key: string; popular?: boolean }[];
}

const CATEGORIES: CategoryConfig[] = [
	{
		key: "gettingStarted",
		slug: "getting-started",
		icon: Settings,
		count: 22,
		articles: [{ key: "account", popular: true }, { key: "channel", popular: true }, { key: "team" }, { key: "import" }],
	},
	{
		key: "aiCore",
		slug: "pulse-ai-core",
		icon: Bot,
		count: 31,
		articles: [{ key: "triage", popular: true }, { key: "escalation" }, { key: "training", popular: true }, { key: "review" }],
	},
	{
		key: "automations",
		slug: "automations-slas",
		icon: Zap,
		count: 21,
		articles: [{ key: "sla", popular: true }, { key: "triggers" }, { key: "routing" }, { key: "reference" }],
	},
	{
		key: "teams",
		slug: "teams-roles",
		icon: Users,
		count: 15,
		articles: [{ key: "rbac" }, { key: "heatmaps" }, { key: "shifts" }, { key: "supervisor" }],
	},
	{
		key: "analytics",
		slug: "analytics-reports",
		icon: BarChart3,
		count: 19,
		articles: [{ key: "csat", popular: true }, { key: "export" }, { key: "forecast" }, { key: "performance" }],
	},
	{
		key: "billing",
		slug: "billing-plans",
		icon: CreditCard,
		count: 12,
		articles: [{ key: "plan" }, { key: "seats", popular: true }, { key: "invoices" }, { key: "cycle" }],
	},
];

const QUICK_LINKS = [
	{ key: "video", icon: Video, href: "#" },
	{ key: "api", icon: FileText, href: "#" },
	{ key: "releases", icon: BookOpen, href: "/changelog" },
	{ key: "community", icon: MessageSquare, href: "#" },
] as const;

const TOTAL_ARTICLES = CATEGORIES.reduce((n, c) => n + c.articles.length, 0);

export default function HelpCenterPage() {
	const { dict, locale, t, num, path } = useI18n();
	useLocalizedSeo({ ...dict.meta.help, path: "/help", locale });

	const hero = dict.help.hero;
	const visible = useMountVisible();
	const [query, setQuery] = useState("");

	// Flatten article titles for the inline search, carrying their category label.
	const allArticles = CATEGORIES.flatMap((c) =>
		c.articles.map((a) => ({
			title: (dict.help.categories[c.key].articles as Record<string, string>)[a.key],
			category: dict.help.categories[c.key].label,
			href: "#",
		})),
	);

	const filtered =
		query.trim().length > 1 ? allArticles.filter((a) => a.title.toLowerCase().includes(query.toLowerCase())) : [];

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
								{hero.eyebrow}
								<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							{hero.headline.lead}{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								{hero.headline.highlight}
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">{hero.subhead}</p>

						{/* search console */}
						<div className="max-w-2xl">
							<div className="border border-border bg-background focus-within:border-primary transition-colors">
								<div className="flex items-center justify-between px-4 py-2 border-b border-border">
									<span className="font-mono text-[10px] tracking-[0.25em] text-primary">{hero.queryLabel}</span>
									<span className="font-mono text-[10px] tracking-widest text-muted-foreground/60">
										{t(hero.docsIndexed, { count: num(TOTAL_ARTICLES) })}
									</span>
								</div>
								<div className="relative">
									<Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-accent pointer-events-none" />
									<input
										type="search"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										placeholder={hero.searchPlaceholder}
										aria-label={hero.searchPlaceholder}
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
									{hero.noResults}{" "}
									<a href={path("/contact")} className="text-primary underline-offset-2 hover:underline">
										{hero.contactSupport}
									</a>
								</p>
							)}

							{/* popular chips */}
							{query.length === 0 && (
								<div className="mt-4 flex flex-wrap gap-2">
									{dict.help.popularQueries.map((p) => (
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
							{[hero.stats.response, hero.stats.satisfaction, hero.stats.articles].map(({ value, label }) => (
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

				<QuickLinksSection />
				<CategoriesSection />

				<DarkCta
					tag={dict.help.finalCta.tag}
					headline={
						<>
							{dict.help.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.help.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.help.finalCta.desc}
					primary={{ href: "/contact", label: dict.help.finalCta.primary }}
					secondary={{ href: "/status", label: dict.help.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

function QuickLinksSection() {
	const { dict, path } = useI18n();
	const q = dict.help.quickAccess;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{q.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{q.sectionRight}</MonoTag>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border-b border-border">
				{QUICK_LINKS.map(({ key, icon: Icon, href }, i) => (
					<a
						key={key}
						href={href.startsWith("/") ? path(href) : href}
						className={`group relative bg-background px-6 py-6 flex items-center gap-4 transition-all duration-500 hover:bg-accent/5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
						style={{ transitionDelay: `${i * 80}ms` }}>
						<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
						<Icon className="size-4 text-accent shrink-0" />
						<div className="min-w-0">
							<div className="text-sm font-bold group-hover:text-primary transition-colors">{q.links[key].label}</div>
							<div className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mt-1">{q.links[key].description}</div>
						</div>
						<ArrowUpRight className="size-3.5 text-muted-foreground/0 group-hover:text-accent transition-colors ml-auto shrink-0" />
					</a>
				))}
			</div>
		</section>
	);
}

function CategoriesSection() {
	const { dict, t, num, path } = useI18n();
	const idx = dict.help.index;
	const { ref, inView } = useInView({ threshold: 0.04 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule
				index="02"
				label={idx.sectionLabel}
				title={idx.sectionTitle}
				right={t(idx.sectionRight, { count: num(CATEGORIES.length) })}
			/>
			<div className="h-10" />

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border">
					{CATEGORIES.map((config, i) => {
						const Icon = config.icon;
						const category = dict.help.categories[config.key];
						const articles = category.articles as Record<string, string>;
						return (
							<div
								key={config.key}
								className={`group relative bg-background px-6 md:px-8 py-8 flex flex-col transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ transitionDelay: `${i * 70}ms` }}>
								<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />

								<div className="flex items-center justify-between mb-2">
									<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">CAT_0{i + 1}</span>
									<span className="font-mono text-[10px] tracking-widest text-accent">
										{t(idx.docsCount, { count: num(config.count) })}
									</span>
								</div>
								<div className="flex items-center gap-3 mb-2">
									<Icon className="size-4 text-accent shrink-0" />
									<h2 className="font-black tracking-tight">{category.label}</h2>
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed mb-6">{category.description}</p>

								<ul className="divide-y divide-border border-y border-border mb-6">
									{config.articles.map((a) => (
										<li key={a.key}>
											<a href="#" className="group/link flex items-center gap-2.5 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
												<span className="font-mono text-[10px] text-muted-foreground/40 group-hover/link:text-accent transition-colors shrink-0">▸</span>
												<span className="flex-1">{articles[a.key]}</span>
												{a.popular && (
													<span className="shrink-0 font-mono text-[8px] tracking-[0.2em] border border-accent/40 text-accent px-1.5 py-0.5">
														{idx.popularBadge}
													</span>
												)}
											</a>
										</li>
									))}
								</ul>

								<a
									href={path(`/help/${config.slug}`)}
									className="mt-auto inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase font-bold text-primary hover:text-accent transition-colors">
									{t(idx.viewAll, { count: num(config.count) })} <ArrowRight className="size-3" />
								</a>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
