import { SiteLayout } from "./site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Rss, Bot, Zap, Shield, MessageSquare, Globe, BarChart3, ArrowRight } from "lucide-react";
import { useState } from "react";

const FILTER_TAGS = ["All", "Major", "Minor", "Patch"];

const RELEASES = [
	{
		version: "3.4.0",
		date: "February 2025",
		tag: "Major",
		icon: Bot,
		headline: "AI Agents v2 — smarter, faster, context-aware",
		changes: [
			{ type: "new", text: "AI Agents v2 — context-aware multi-turn reasoning with memory" },
			{ type: "new", text: "Microsoft Copilot integration (beta) — surface ticket context in Copilot Chat" },
			{ type: "new", text: "Data residency selector for EU and APAC regions" },
			{ type: "improvement", text: "AI first-response latency reduced by 40%" },
			{ type: "improvement", text: "Ticket list now supports bulk-assign and bulk-close" },
			{ type: "fix", text: "Fixed edge case where SLA clock did not pause on pending-customer status" },
		],
	},
	{
		version: "3.3.2",
		date: "January 2025",
		tag: "Patch",
		icon: Zap,
		headline: "Notification reliability and dark-mode polish",
		changes: [
			{ type: "fix", text: "Resolved Teams notification duplication on ticket reassignment" },
			{ type: "fix", text: "CSAT survey link now renders correctly in Outlook mobile" },
			{ type: "improvement", text: "Improved dark mode contrast ratios across all dashboards" },
		],
	},
	{
		version: "3.3.0",
		date: "December 2024",
		tag: "Minor",
		icon: Globe,
		headline: "Self-service portal, Power Automate, and Twilio Voice",
		changes: [
			{ type: "new", text: "Self-service portal with branded domain support" },
			{ type: "new", text: "Power Automate connector — trigger flows from any ticket event" },
			{ type: "new", text: "Phone-to-ticket: Twilio Voice transcription and auto-create" },
			{ type: "improvement", text: "Analytics date range picker now supports custom ranges" },
			{ type: "fix", text: "SharePoint attachment previews now load without re-authentication" },
		],
	},
	{
		version: "3.2.0",
		date: "November 2024",
		tag: "Minor",
		icon: MessageSquare,
		headline: "WhatsApp channel and skill-based routing",
		changes: [
			{ type: "new", text: "Omnichannel inbox: WhatsApp via Twilio" },
			{ type: "new", text: "Skill-based routing rules engine" },
			{ type: "improvement", text: "Ticket merge — combine duplicate submissions into one thread" },
			{ type: "improvement", text: "Mobile app performance improvements (iOS & Android)" },
			{ type: "fix", text: "Fixed time-zone offset errors in SLA breach alerts" },
		],
	},
	{
		version: "3.1.0",
		date: "October 2024",
		tag: "Minor",
		icon: BarChart3,
		headline: "AI auto-tagging and Jira two-way sync",
		changes: [
			{ type: "new", text: "AI auto-tagging — tickets classified into categories automatically" },
			{ type: "new", text: "Jira two-way sync — status changes reflected in both systems" },
			{ type: "improvement", text: "Search now indexes ticket body content (full-text)" },
			{ type: "fix", text: "Resolved incorrect ticket count in team workload heatmap" },
		],
	},
	{
		version: "3.0.0",
		date: "September 2024",
		tag: "Major",
		icon: Shield,
		headline: "SupportDesk 365 v3 — rebuilt from the ground up",
		changes: [
			{ type: "new", text: "SupportDesk 365 v3 — rebuilt UI with new design system" },
			{ type: "new", text: "AI Agents v1 — automated triage and first response" },
			{ type: "new", text: "Microsoft 365 native integration (Teams, Outlook, Azure AD, SharePoint)" },
			{ type: "new", text: "Enterprise: customer-managed encryption keys" },
			{ type: "new", text: "Advanced analytics with CSAT, NPS, and volume forecasting" },
		],
	},
];

const TYPE_STYLES: Record<string, { label: string; className: string }> = {
	new: { label: "New", className: "bg-primary/10 text-primary border-primary/25" },
	improvement: { label: "Improved", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" },
	fix: { label: "Fix", className: "bg-amber-500/10 text-amber-600 border-amber-500/25" },
};

const TAG_STYLES: Record<string, string> = {
	Major: "bg-primary text-primary-foreground",
	Minor: "bg-secondary text-secondary-foreground",
	Patch: "bg-muted text-muted-foreground",
};

const TYPE_COUNTS = (changes: (typeof RELEASES)[0]["changes"]) =>
	changes.reduce<Record<string, number>>((acc, c) => {
		acc[c.type] = (acc[c.type] ?? 0) + 1;
		return acc;
	}, {});

export default function ChangelogPage() {
	const [filter, setFilter] = useState("All");
	const visible = filter === "All" ? RELEASES : RELEASES.filter((r) => r.tag === filter);

	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 text-center">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
						<Rss className="size-3.5" />
						Always up to date
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">Changelog</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty mb-8">
						Every update, improvement, and fix — documented transparently so you always know what changed and why.
					</p>
					<Button variant="outline" className="gap-2 h-10">
						<Bell className="size-4" />
						Subscribe to updates
					</Button>
				</div>
			</section>

			{/* Filter + Release stats */}
			<section className="container mx-auto px-4 pt-12 pb-0">
				<div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					{/* Tag filters */}
					<div className="flex gap-2">
						{FILTER_TAGS.map((tag) => (
							<button
								key={tag}
								onClick={() => setFilter(tag)}
								className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
									filter === tag
										? "bg-primary text-primary-foreground border-primary"
										: "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
								}`}>
								{tag}
							</button>
						))}
					</div>
					<span className="text-sm text-muted-foreground">
						{visible.length} release{visible.length !== 1 ? "s" : ""}
					</span>
				</div>
			</section>

			{/* Releases */}
			<section className="container mx-auto px-4 py-12 md:py-20">
				<div className="max-w-3xl mx-auto">
					<div className="relative">
						{/* Timeline line */}
						<div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

						<div className="space-y-10">
							{visible.map((release) => {
								const counts = TYPE_COUNTS(release.changes);
								const ReleaseIcon = release.icon;
								return (
									<div key={release.version} className="relative flex gap-8">
										{/* Timeline dot */}
										<div className="relative z-10 shrink-0 size-9 rounded-full bg-card border-2 border-primary flex items-center justify-center mt-1">
											<ReleaseIcon className="size-4 text-primary" />
										</div>

										<div className="flex-1 pb-2">
											{/* Header */}
											<div className="flex flex-wrap items-center gap-3 mb-1">
												<h2 className="text-2xl font-bold">v{release.version}</h2>
												<Badge className={`text-xs ${TAG_STYLES[release.tag]}`}>{release.tag}</Badge>
												<span className="text-sm text-muted-foreground">{release.date}</span>
											</div>

											{/* Headline */}
											<p className="text-sm font-medium text-foreground mb-4">{release.headline}</p>

											{/* Type summary pills */}
											<div className="flex flex-wrap gap-2 mb-4">
												{Object.entries(counts).map(([type, n]) => {
													const s = TYPE_STYLES[type];
													return (
														<span
															key={type}
															className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.className}`}>
															{n} {s.label}
														</span>
													);
												})}
											</div>

											{/* Change list */}
											<ul className="space-y-2.5 bg-card border border-border rounded-xl p-4">
												{release.changes.map((change, i) => {
													const style = TYPE_STYLES[change.type];
													return (
														<li key={i} className="flex items-start gap-3">
															<span
																className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-0.5 ${style.className}`}>
																{style.label}
															</span>
															<span className="text-sm text-muted-foreground leading-relaxed">{change.text}</span>
														</li>
													);
												})}
											</ul>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4 text-center max-w-xl">
					<h2 className="text-2xl font-bold mb-3">Want early access to new features?</h2>
					<p className="text-muted-foreground mb-6 text-pretty">Join our beta program and shape the roadmap before features ship publicly.</p>
					<Button asChild className="group h-11 px-8">
						<a href="/contact">
							Request beta access
							<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
						</a>
					</Button>
				</div>
			</section>
		</SiteLayout>
	);
}
