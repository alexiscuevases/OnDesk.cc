import { SiteLayout } from "./site-layout";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useInView, useMountVisible, PulseLine, MonoTag, SectionRule, Cross } from "./shared";

type Tag = "AI" | "Product" | "Guide" | "Agency" | "Solo & Small Teams";

interface Post {
	slug: string;
	title: string;
	excerpt: string;
	author: string;
	role: string;
	date: string;
	readTime: string;
	tag: Tag;
	featured?: boolean;
}

const POSTS: Post[] = [
	{
		slug: "ai-agents-resolve-80-percent",
		title: "How AI agents resolve 80% of tickets without human intervention",
		excerpt:
			"A deep dive into the classification, context-retrieval, and reply-generation pipeline that powers Pulse AI Agents — and the edge cases we had to solve.",
		author: "Daniel Park",
		role: "CTO",
		date: "FEB 18, 2025",
		readTime: "8 MIN",
		tag: "AI",
		featured: true,
	},
	{
		slug: "sla-survival-guide",
		title: "The SLA survival guide for growing support teams",
		excerpt: "SLA breaches hurt CSAT, renewals, and morale. Here is the framework we recommend to teams scaling from 5 to 50 agents.",
		author: "Sophie Laurent",
		role: "Head of Customer Success",
		date: "FEB 11, 2025",
		readTime: "6 MIN",
		tag: "Guide",
	},
	{
		slug: "running-client-support-as-an-agency",
		title: "How agencies manage support for 8+ clients without losing their mind",
		excerpt:
			"The tools, workflows, and rituals that high-performing support agencies use to keep every client's queue clean — without context-switching all day.",
		author: "Sophie Laurent",
		role: "Head of Customer Success",
		date: "FEB 4, 2025",
		readTime: "7 MIN",
		tag: "Agency",
	},
	{
		slug: "csat-from-60-to-90",
		title: "How Fabrikam raised CSAT from 60% to 90% in 90 days",
		excerpt:
			"A case study on combining AI auto-replies, skill-based routing, and structured shift scheduling to achieve a dramatic satisfaction turnaround.",
		author: "Sophie Laurent",
		role: "Head of Customer Success",
		date: "JAN 28, 2025",
		readTime: "5 MIN",
		tag: "Guide",
	},
	{
		slug: "self-service-portal-launch",
		title: "Building a self-service portal your customers will actually use",
		excerpt:
			"Most self-service portals fail because they are hard to find and harder to search. Here is what we learned building the portal feature for Pulse.",
		author: "Aisha Okafor",
		role: "Head of Product",
		date: "JAN 21, 2025",
		readTime: "7 MIN",
		tag: "Product",
	},
	{
		slug: "ticket-tagging-taxonomy",
		title: "Why your ticket tagging taxonomy is probably wrong",
		excerpt: "Manual tags drift. AI auto-tags don't — if you seed them correctly. A practical guide to building a tag taxonomy that scales.",
		author: "Aisha Okafor",
		role: "Head of Product",
		date: "JAN 14, 2025",
		readTime: "6 MIN",
		tag: "AI",
	},
	{
		slug: "solo-support-without-burning-out",
		title: "Running support solo: how to handle 200+ requests a week without burning out",
		excerpt:
			"Canned replies, smart inboxes, and a few AI rules can do the work of a second hire. A practical guide for freelancers and solopreneurs managing client support.",
		author: "Aisha Okafor",
		role: "Head of Product",
		date: "JAN 7, 2025",
		readTime: "6 MIN",
		tag: "Solo & Small Teams",
	},
];

const TAGS: Tag[] = ["AI", "Product", "Guide", "Agency", "Solo & Small Teams"];

const featured = POSTS.find((p) => p.featured)!;
const rest = POSTS.filter((p) => !p.featured);

export default function BlogPage() {
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
								DISPATCHES — FIELD NOTES & GUIDES<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Insights for{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								every support team
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
							Guides, product updates, and stories from teams, agencies, and solos building better support.
						</p>
					</div>

					{/* tag ticker row */}
					<div className="flex flex-wrap items-center gap-2 px-6 md:px-12 py-4 border-t border-border">
						<span className="px-3 py-1.5 bg-primary text-primary-foreground font-mono text-[10px] tracking-[0.15em] uppercase font-bold">
							All
						</span>
						{TAGS.map((tag) => (
							<span
								key={tag}
								className="px-3 py-1.5 border border-border font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-foreground transition-colors duration-200">
								{tag}
							</span>
						))}
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── FEATURED DISPATCH ── */}
				<FeaturedDispatch />

				{/* ── ARCHIVE ── */}
				<ArchiveSection />

				{/* ── NEWSLETTER ── */}
				<NewsletterBand />
			</div>
		</SiteLayout>
	);
}

function FeaturedDispatch() {
	const { ref, inView } = useInView({ threshold: 0.05 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">01 — FEATURED DISPATCH</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					LATEST TRANSMISSION
				</span>
			</div>

			<a
				href={`/blog/${featured.slug}`}
				className={`group grid lg:grid-cols-12 border-b border-border transition-all duration-700 hover:bg-accent/5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				{/* meta rail */}
				<div className="lg:col-span-3 px-6 md:px-12 lg:pr-8 pt-10 pb-2 lg:pb-10 lg:border-r border-border">
					<div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3 font-mono text-[10px] tracking-[0.2em] uppercase">
						<span className="border border-accent/40 text-accent px-2 py-1 font-bold">{featured.tag}</span>
						<span className="text-muted-foreground">{featured.date}</span>
						<span className="text-muted-foreground">{featured.readTime} READ</span>
					</div>
				</div>

				{/* content */}
				<div className="lg:col-span-9 px-6 md:px-12 pt-4 lg:pt-10 pb-10">
					<h2 className="text-3xl md:text-5xl font-black tracking-tight text-balance leading-tight mb-5 group-hover:text-primary transition-colors duration-200">
						{featured.title}
					</h2>
					<p className="text-muted-foreground leading-relaxed max-w-3xl mb-8">{featured.excerpt}</p>
					<div className="flex items-center justify-between">
						<p className="font-mono text-[11px] tracking-wider text-muted-foreground">
							<span className="text-foreground font-bold">{featured.author.toUpperCase()}</span> · {featured.role.toUpperCase()}
						</p>
						<span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase font-bold text-primary group-hover:text-accent transition-colors">
							Read article <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
						</span>
					</div>
				</div>
			</a>
		</section>
	);
}

function ArchiveSection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="02" label="ARCHIVE" title="All dispatches" right={`${POSTS.length} ENTRIES ON FILE`} />
			<div className="h-10" />

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="divide-y divide-border border-b border-border">
					{rest.map((post, i) => (
						<a
							key={post.slug}
							href={`/blog/${post.slug}`}
							className={`group grid md:grid-cols-12 gap-3 md:gap-6 px-6 md:px-12 py-7 transition-all duration-500 hover:bg-accent/5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
							style={{ transitionDelay: `${i * 60}ms` }}>
							{/* index + tag */}
							<div className="md:col-span-2 flex md:flex-col items-center md:items-start gap-3 font-mono text-[10px] tracking-[0.2em] uppercase">
								<span className="text-muted-foreground/50">{String(i + 2).padStart(2, "0")}</span>
								<span className="border border-accent/40 text-accent px-2 py-1 font-bold">{post.tag}</span>
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
									<span className="block text-foreground font-bold">{post.author.toUpperCase()}</span>
									<span className="block mt-1">
										{post.date} · {post.readTime}
									</span>
								</div>
								<ArrowUpRight className="size-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
							</div>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}

function NewsletterBand() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white overflow-hidden" style={{ background: "var(--pulse-ink-deep)" }}>
			<div className="absolute inset-0 flex items-center opacity-30 pointer-events-none" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-40" strokeWidth={0.8} />
			</div>

			<div
				className={`relative px-6 md:px-12 py-24 md:py-32 text-center transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
				<MonoTag className="block mb-8 text-white/50">03 — SUBSCRIBE · ONE EMAIL / WEEK · NO SPAM</MonoTag>
				<h2 className="text-4xl md:text-6xl font-black tracking-tighter text-balance mb-6 max-w-4xl mx-auto">
					Never miss a <span style={{ color: "var(--pulse-lime)" }}>dispatch.</span>
				</h2>
				<p className="text-white/55 text-lg md:text-xl mb-12 max-w-xl mx-auto">
					Our best articles on AI support, ops, and product updates — straight to your inbox.
				</p>

				<form className="flex flex-col sm:flex-row max-w-md mx-auto border border-white/25 focus-within:border-(--pulse-lime) transition-colors" onSubmit={(e) => e.preventDefault()}>
					<input
						type="email"
						required
						placeholder="YOU@COMPANY.COM"
						className="flex-1 h-14 px-5 bg-transparent text-white placeholder:text-white/40 font-mono text-xs tracking-[0.15em] focus:outline-none"
					/>
					<button
						type="submit"
						className="group relative inline-flex items-center justify-center gap-2 overflow-hidden px-7 h-14 font-mono text-xs tracking-[0.15em] uppercase font-bold text-(--pulse-ink-deep) shrink-0"
						style={{ background: "var(--pulse-lime)" }}>
						<span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90" />
						<span className="relative z-10 flex items-center gap-2">
							Subscribe <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
						</span>
					</button>
				</form>
				<p className="font-mono text-[10px] tracking-[0.2em] text-white/35 mt-5">UNSUBSCRIBE AT ANY TIME</p>
			</div>
		</section>
	);
}
