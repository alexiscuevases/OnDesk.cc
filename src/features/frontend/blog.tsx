import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

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
			"A deep dive into the classification, context-retrieval, and reply-generation pipeline that powers SupportDesk 365 AI Agents — and the edge cases we had to solve.",
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
			"Most self-service portals fail because they are hard to find and harder to search. Here is what we learned building the portal feature for SupportDesk 365.",
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
	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-24 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 text-center max-w-2xl">
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">Blog</h1>
					<p className="text-xl text-muted-foreground text-pretty leading-relaxed">
						Insights on AI support, customer success, and Microsoft 365 — straight from the team building SupportDesk 365.
					</p>
				</div>
			</section>

			{/* Tag filter row (visual only) */}
			<div className="border-b border-border bg-card">
				<div className="container mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none">
					<span className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary text-primary-foreground shrink-0">All</span>
					{TAGS.map((tag) => (
						<span
							key={tag}
							className={`text-xs font-medium px-3 py-1.5 rounded-full border cursor-pointer hover:border-primary/40 hover:text-foreground transition-colors shrink-0 ${TAG_STYLES[tag]}`}>
							{tag}
						</span>
					))}
				</div>
			</div>

			<div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
				{/* Featured post */}
				<div className="mb-14">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Featured</p>
					<a
						href={`/blog/${featured.slug}`}
						className="group flex flex-col md:flex-row gap-8 p-8 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
						<div className="flex-1 flex flex-col gap-4">
							<span
								className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TAG_STYLES[featured.tag]}`}>
								{featured.tag}
							</span>
							<h2 className="text-2xl md:text-3xl font-bold text-balance leading-snug group-hover:text-primary transition-colors">
								{featured.title}
							</h2>
							<p className="text-muted-foreground leading-relaxed text-pretty">{featured.excerpt}</p>
							<div className="flex items-center gap-3 mt-auto">
								<AuthorInitials name={featured.author} />
								<div className="text-xs">
									<p className="font-medium text-foreground">{featured.author}</p>
									<p className="text-muted-foreground">{featured.date}</p>
								</div>
								<div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
									<Clock className="size-3" />
									{featured.readTime} read
								</div>
							</div>
						</div>
						<div className="md:w-64 shrink-0 flex items-center justify-end">
							<div className="flex items-center gap-1.5 text-primary text-sm font-medium group-hover:gap-2.5 transition-all">
								Read article
								<ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
							</div>
						</div>
					</a>
				</div>

				{/* Post grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{rest.map((post) => (
						<a
							key={post.slug}
							href={`/blog/${post.slug}`}
							className="group flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
							<span
								className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TAG_STYLES[post.tag]}`}>
								{post.tag}
							</span>
							<h2 className="text-base font-semibold leading-snug text-balance group-hover:text-primary transition-colors">{post.title}</h2>
							<p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 text-pretty flex-1">{post.excerpt}</p>
							<div className="flex items-center gap-2.5 mt-auto pt-3 border-t border-border">
								<AuthorInitials name={post.author} />
								<div className="text-xs min-w-0">
									<p className="font-medium text-foreground truncate">{post.author}</p>
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
			</div>

			{/* Newsletter CTA */}
			<section className="border-t border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4 max-w-xl text-center">
					<h2 className="text-2xl font-bold mb-3">Stay in the loop</h2>
					<p className="text-muted-foreground mb-6 text-pretty">One email per week with our best articles on AI support, ops, and product updates.</p>
					<form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
						<input
							type="email"
							placeholder="you@company.com"
							className="flex-1 h-10 px-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
						/>
						<Button type="submit" className="shrink-0 group h-10">
							Subscribe
							<ArrowRight className="ml-1.5 size-3.5 group-hover:translate-x-0.5 transition-transform" />
						</Button>
					</form>
					<p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe at any time.</p>
				</div>
			</section>
		</SiteLayout>
	);
}
