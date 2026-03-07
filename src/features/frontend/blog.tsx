import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Sparkles, Rss } from "lucide-react";
import { useState, useEffect } from "react";
import { useInView, SectionBadge } from "./shared";

type Tag = "AI" | "Product" | "Guide" | "Microsoft 365" | "Customer Success";

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
			"A deep dive into the classification, context-retrieval, and reply-generation pipeline that powers OnDesk.cc AI Agents — and the edge cases we had to solve.",
		author: "Daniel Park",
		role: "CTO",
		date: "Feb 18, 2025",
		readTime: "8 min",
		tag: "AI",
		featured: true,
	},
	{
		slug: "sla-survival-guide",
		title: "The SLA survival guide for growing support teams",
		excerpt: "SLA breaches hurt CSAT, renewals, and morale. Here is the framework we recommend to teams scaling from 5 to 50 agents.",
		author: "Sophie Laurent",
		role: "Head of Customer Success",
		date: "Feb 11, 2025",
		readTime: "6 min",
		tag: "Guide",
	},
	{
		slug: "microsoft-365-integration-deep-dive",
		title: "Everything you can do with the Microsoft 365 integration",
		excerpt: "Teams alerts, Outlook ingestion, SharePoint attachments, Azure AD user sync — the complete map of what connects to what and why it matters.",
		author: "Marcus Webb",
		role: "Head of Sales",
		date: "Feb 4, 2025",
		readTime: "10 min",
		tag: "Microsoft 365",
	},
	{
		slug: "csat-from-60-to-90",
		title: "How Fabrikam raised CSAT from 60% to 90% in 90 days",
		excerpt:
			"A case study on combining AI auto-replies, skill-based routing, and structured shift scheduling to achieve a dramatic satisfaction turnaround.",
		author: "Sophie Laurent",
		role: "Head of Customer Success",
		date: "Jan 28, 2025",
		readTime: "5 min",
		tag: "Customer Success",
	},
	{
		slug: "self-service-portal-launch",
		title: "Building a self-service portal your customers will actually use",
		excerpt:
			"Most self-service portals fail because they are hard to find and harder to search. Here is what we learned building the portal feature for OnDesk.cc.",
		author: "Aisha Okafor",
		role: "Head of Product",
		date: "Jan 21, 2025",
		readTime: "7 min",
		tag: "Product",
	},
	{
		slug: "ticket-tagging-taxonomy",
		title: "Why your ticket tagging taxonomy is probably wrong",
		excerpt: "Manual tags drift. AI auto-tags don't — if you seed them correctly. A practical guide to building a tag taxonomy that scales.",
		author: "Aisha Okafor",
		role: "Head of Product",
		date: "Jan 14, 2025",
		readTime: "6 min",
		tag: "AI",
	},
	{
		slug: "power-automate-connector",
		title: "Automating cross-team workflows with the Power Automate connector",
		excerpt: "From auto-creating Jira issues on high-priority tickets to notifying finance on billing complaints — real flows built by real customers.",
		author: "Daniel Park",
		role: "CTO",
		date: "Jan 7, 2025",
		readTime: "9 min",
		tag: "Microsoft 365",
	},
];

const TAG_STYLES: Record<Tag, string> = {
	AI: "bg-primary/10 text-primary border-primary/25",
	Product: "bg-accent/10 text-accent border-accent/25",
	Guide: "bg-success/10 text-success border-success/25",
	"Microsoft 365": "bg-secondary text-secondary-foreground border-border",
	"Customer Success": "bg-warning/10 text-warning border-warning/25",
};

const TAGS: Tag[] = ["AI", "Product", "Guide", "Microsoft 365", "Customer Success"];

const featured = POSTS.find((p) => p.featured)!;
const rest = POSTS.filter((p) => !p.featured);

function AuthorInitials({ name }: { name: string }) {
	return (
		<div className="size-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
			{name
				.split(" ")
				.map((n) => n[0])
				.join("")}
		</div>
	);
}

export default function BlogPage() {
	const [heroVisible, setHeroVisible] = useState(false);
	useEffect(() => {
		const id = requestAnimationFrame(() => setHeroVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);

	return (
		<SiteLayout>
			{/* ── HERO ── */}
			<section className="relative pt-16 pb-20 md:pt-28 md:pb-24 overflow-hidden border-b border-border">
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
					<div
						className="absolute inset-0 opacity-[0.025]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
					/>
				</div>
				<div className="container mx-auto px-4 text-center max-w-2xl relative">
					<div className={`transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<SectionBadge icon={Rss} label="Insights from the team" />
						<h1 className="text-5xl md:text-[5rem] font-black mb-5 text-balance tracking-tight" style={{ lineHeight: 1.04 }}>
							The{" "}
							<span
								style={{
									background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}>
								Blog
							</span>
						</h1>
						<p
							className={`text-xl text-muted-foreground text-pretty leading-relaxed transition-all duration-1000 delay-150 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							Insights on AI support, customer success, and Microsoft 365 — straight from the team building OnDesk.cc.
						</p>
					</div>
				</div>
			</section>

			{/* Tag filter row */}
			<div className="border-b border-border" style={{ background: "var(--color-card)" }}>
				<div className="container mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none">
					<span
						className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 shadow-sm"
						style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
						All
					</span>
					{TAGS.map((tag) => (
						<span
							key={tag}
							className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer hover:border-primary/40 hover:text-foreground transition-all duration-200 shrink-0 hover:-translate-y-0.5 ${TAG_STYLES[tag]}`}>
							{tag}
						</span>
					))}
				</div>
			</div>

			<BlogPostsSection />
			<BlogCtaSection />
		</SiteLayout>
	);
}

function BlogPostsSection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref} className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
			{/* Featured post */}
			<div className={`mb-14 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
				<p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em] mb-5">Featured</p>
				<a
					href={`/blog/${featured.slug}`}
					className="group relative flex flex-col md:flex-row gap-8 p-8 rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
					style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
					{/* Hover glow */}
					<div
						className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
						style={{ background: "radial-gradient(ellipse at 0% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 60%)" }}
					/>
					<div
						className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
						style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)" }}
					/>
					<div className="flex-1 flex flex-col gap-4 relative z-10">
						<span
							className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${TAG_STYLES[featured.tag]}`}>
							{featured.tag}
						</span>
						<h2 className="text-2xl md:text-3xl font-black text-balance leading-snug group-hover:text-primary transition-colors duration-200">
							{featured.title}
						</h2>
						<p className="text-muted-foreground leading-relaxed text-pretty">{featured.excerpt}</p>
						<div className="flex items-center gap-3 mt-auto">
							<AuthorInitials name={featured.author} />
							<div className="text-xs">
								<p className="font-semibold text-foreground">{featured.author}</p>
								<p className="text-muted-foreground">{featured.date}</p>
							</div>
							<div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
								<Clock className="size-3" />
								{featured.readTime} read
							</div>
						</div>
					</div>
					<div className="md:w-56 shrink-0 flex items-center justify-end relative z-10">
						<div
							className="flex items-center gap-2 font-semibold text-sm transition-all duration-200 group-hover:gap-3"
							style={{ color: "var(--color-primary)" }}>
							Read article
							<ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
						</div>
					</div>
				</a>
			</div>

			{/* Post grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
				{rest.map((post, i) => (
					<a
						key={post.slug}
						href={`/blog/${post.slug}`}
						className={`group relative flex flex-col gap-4 p-6 rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
						style={{ background: "var(--color-card)", borderColor: "var(--color-border)", transitionDelay: `${i * 60 + 150}ms` }}>
						{/* Hover glow */}
						<div
							className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
							style={{
								background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 70%)",
							}}
						/>
						<div
							className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
							style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 28%, transparent)" }}
						/>
						<span
							className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border relative z-10 ${TAG_STYLES[post.tag]}`}>
							{post.tag}
						</span>
						<h2 className="text-base font-bold leading-snug text-balance group-hover:text-primary transition-colors duration-200 relative z-10">
							{post.title}
						</h2>
						<p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 text-pretty flex-1 relative z-10">{post.excerpt}</p>
						<div className="flex items-center gap-2.5 mt-auto pt-3 border-t border-border relative z-10">
							<AuthorInitials name={post.author} />
							<div className="text-xs min-w-0">
								<p className="font-semibold text-foreground truncate">{post.author}</p>
								<p className="text-muted-foreground">{post.date}</p>
							</div>
							<div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground shrink-0">
								<Clock className="size-3" />
								{post.readTime}
							</div>
						</div>
					</a>
				))}
			</div>
		</section>
	);
}

function BlogCtaSection() {
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
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-sm font-medium text-white mb-8">
						<Sparkles className="size-3.5" /> Stay in the loop
					</div>
					<h2 className="text-4xl md:text-5xl font-black mb-5 text-white text-balance tracking-tight">Never miss an article</h2>
					<p className="text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
						One email per week with our best articles on AI support, ops, and product updates. No spam, ever.
					</p>
					<form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
						<input
							type="email"
							placeholder="you@company.com"
							className="flex-1 h-12 px-4 rounded-xl border border-white/30 bg-white/15 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all"
						/>
						<Button
							type="submit"
							className="shrink-0 group h-12 px-6 bg-white hover:bg-white/90 hover:-translate-y-0.5 transition-all duration-300"
							style={{ color: "var(--color-primary)" }}>
							Subscribe
							<ArrowRight className="ml-1.5 size-3.5 group-hover:translate-x-0.5 transition-transform" />
						</Button>
					</form>
					<p className="text-xs text-white/50 mt-4">No spam. Unsubscribe at any time.</p>
				</div>
			</div>
		</section>
	);
}
