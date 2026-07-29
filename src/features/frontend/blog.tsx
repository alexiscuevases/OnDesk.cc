import { SiteLayout } from "./site-layout";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useInView, useMountVisible, PulseLine, MonoTag, SectionRule, Cross } from "./shared";
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

// ── Structure ──
// Slugs are URLs and author names are proper nouns, so both stay here. Tag ids
// key into the dictionary; only their labels are translated.

type TagId = keyof Dictionary["blog"]["tags"];
type PostKey = keyof Dictionary["blog"]["posts"];
type RoleKey = keyof Dictionary["blog"]["roles"];

interface PostConfig {
	key: PostKey;
	slug: string;
	author: string;
	role: RoleKey;
	tag: TagId;
	featured?: boolean;
}

const POSTS: PostConfig[] = [
	{ key: "aiAgents", slug: "ai-agents-resolve-80-percent", author: "Daniel Park", role: "cto", tag: "ai", featured: true },
	{ key: "sla", slug: "sla-survival-guide", author: "Sophie Laurent", role: "cs", tag: "guide" },
	{ key: "agency", slug: "running-client-support-as-an-agency", author: "Sophie Laurent", role: "cs", tag: "agency" },
	{ key: "csat", slug: "csat-from-60-to-90", author: "Sophie Laurent", role: "cs", tag: "guide" },
	{ key: "portal", slug: "self-service-portal-launch", author: "Aisha Okafor", role: "product", tag: "product" },
	{ key: "tagging", slug: "ticket-tagging-taxonomy", author: "Aisha Okafor", role: "product", tag: "ai" },
	{ key: "solo", slug: "solo-support-without-burning-out", author: "Aisha Okafor", role: "product", tag: "solo" },
];

const TAG_IDS: readonly TagId[] = ["ai", "product", "guide", "agency", "solo"];

const featuredPost = POSTS.find((p) => p.featured)!;
const restPosts = POSTS.filter((p) => !p.featured);

export default function BlogPage() {
	const { dict, locale } = useI18n();
	useLocalizedSeo({ ...dict.meta.blog, path: "/blog", locale });

	const hero = dict.blog.hero;
	const visible = useMountVisible();

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

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">{hero.subhead}</p>
					</div>

					{/* tag ticker row */}
					<div className="flex flex-wrap items-center gap-2 px-6 md:px-12 py-4 border-t border-border">
						<span className="px-3 py-1.5 bg-primary text-primary-foreground font-mono text-[10px] tracking-[0.15em] uppercase font-bold">
							{hero.allTag}
						</span>
						{TAG_IDS.map((tag) => (
							<span
								key={tag}
								className="px-3 py-1.5 border border-border font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-foreground transition-colors duration-200">
								{dict.blog.tags[tag]}
							</span>
						))}
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				<FeaturedDispatch />
				<ArchiveSection />
				<NewsletterBand />
			</div>
		</SiteLayout>
	);
}

function FeaturedDispatch() {
	const { dict, path } = useI18n();
	const f = dict.blog.featured;
	const post = dict.blog.posts[featuredPost.key];
	const { ref, inView } = useInView({ threshold: 0.05 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{f.sectionLabel}</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					{f.sectionRight}
				</span>
			</div>

			<a
				href={path(`/blog/${featuredPost.slug}`)}
				className={`group grid lg:grid-cols-12 border-b border-border transition-all duration-700 hover:bg-accent/5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				{/* meta rail */}
				<div className="lg:col-span-3 px-6 md:px-12 lg:pr-8 pt-10 pb-2 lg:pb-10 lg:border-r border-border">
					<div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3 font-mono text-[10px] tracking-[0.2em] uppercase">
						<span className="border border-accent/40 text-accent px-2 py-1 font-bold">{dict.blog.tags[featuredPost.tag]}</span>
						<span className="text-muted-foreground">{post.date}</span>
						<span className="text-muted-foreground">
							{post.readTime} {f.readSuffix}
						</span>
					</div>
				</div>

				{/* content */}
				<div className="lg:col-span-9 px-6 md:px-12 pt-4 lg:pt-10 pb-10">
					<h2 className="text-3xl md:text-5xl font-black tracking-tight text-balance leading-tight mb-5 group-hover:text-primary transition-colors duration-200">
						{post.title}
					</h2>
					<p className="text-muted-foreground leading-relaxed max-w-3xl mb-8">{post.excerpt}</p>
					<div className="flex items-center justify-between">
						<p className="font-mono text-[11px] tracking-wider text-muted-foreground">
							<span className="text-foreground font-bold">{featuredPost.author.toUpperCase()}</span> ·{" "}
							{dict.blog.roles[featuredPost.role].toUpperCase()}
						</p>
						<span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase font-bold text-primary group-hover:text-accent transition-colors">
							{f.readArticle} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
						</span>
					</div>
				</div>
			</a>
		</section>
	);
}

function ArchiveSection() {
	const { dict, t, num, path } = useI18n();
	const a = dict.blog.archive;
	const { ref, inView } = useInView({ threshold: 0.04 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule
				index="02"
				label={a.sectionLabel}
				title={a.sectionTitle}
				right={t(a.sectionRight, { count: num(POSTS.length) })}
			/>
			<div className="h-10" />

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="divide-y divide-border border-b border-border">
					{restPosts.map((config, i) => {
						const post = dict.blog.posts[config.key];
						return (
							<a
								key={config.slug}
								href={path(`/blog/${config.slug}`)}
								className={`group grid md:grid-cols-12 gap-3 md:gap-6 px-6 md:px-12 py-7 transition-all duration-500 hover:bg-accent/5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
								style={{ transitionDelay: `${i * 60}ms` }}>
								{/* index + tag */}
								<div className="md:col-span-2 flex md:flex-col items-center md:items-start gap-3 font-mono text-[10px] tracking-[0.2em] uppercase">
									<span className="text-muted-foreground/50">{String(i + 2).padStart(2, "0")}</span>
									<span className="border border-accent/40 text-accent px-2 py-1 font-bold">{dict.blog.tags[config.tag]}</span>
								</div>

								{/* title + excerpt */}
								<div className="md:col-span-7 min-w-0">
									<h3 className="text-lg md:text-xl font-black tracking-tight leading-snug mb-2 group-hover:text-primary transition-colors duration-200">
										{post.title}
									</h3>
									<p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
								</div>

								{/* meta */}
								<div className="md:col-span-3 flex md:flex-col md:items-end justify-between gap-2">
									<div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground md:text-right">
										<span className="block text-foreground font-bold">{config.author.toUpperCase()}</span>
										<span className="block mt-1">
											{post.date} · {post.readTime}
										</span>
									</div>
									<ArrowUpRight className="size-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
								</div>
							</a>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function NewsletterBand() {
	const { dict } = useI18n();
	const n = dict.blog.newsletter;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white overflow-hidden" style={{ background: "var(--pulse-ink-deep)" }}>
			<div className="absolute inset-0 flex items-center opacity-30 pointer-events-none" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-40" strokeWidth={0.8} />
			</div>

			<div
				className={`relative px-6 md:px-12 py-24 md:py-32 text-center transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
				<MonoTag className="block mb-8 text-white/50">{n.tag}</MonoTag>
				<h2 className="text-4xl md:text-6xl font-black tracking-tighter text-balance mb-6 max-w-4xl mx-auto">
					{n.headline.lead} <span style={{ color: "var(--pulse-lime)" }}>{n.headline.highlight}</span>
				</h2>
				<p className="text-white/55 text-lg md:text-xl mb-12 max-w-xl mx-auto">{n.desc}</p>

				<form className="flex flex-col sm:flex-row max-w-md mx-auto border border-white/25 focus-within:border-(--pulse-lime) transition-colors" onSubmit={(e) => e.preventDefault()}>
					<input
						type="email"
						required
						placeholder={n.emailPlaceholder}
						aria-label={n.emailPlaceholder}
						className="flex-1 h-14 px-5 bg-transparent text-white placeholder:text-white/40 font-mono text-xs tracking-[0.15em] focus:outline-none"
					/>
					<button
						type="submit"
						className="group relative inline-flex items-center justify-center gap-2 overflow-hidden px-7 h-14 font-mono text-xs tracking-[0.15em] uppercase font-bold text-(--pulse-ink-deep) shrink-0"
						style={{ background: "var(--pulse-lime)" }}>
						<span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90" />
						<span className="relative z-10 flex items-center gap-2">
							{n.submit} <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
						</span>
					</button>
				</form>
				<p className="font-mono text-[10px] tracking-[0.2em] text-white/35 mt-5">{n.unsubscribe}</p>
			</div>
		</section>
	);
}
