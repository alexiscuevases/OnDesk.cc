import { SiteLayout } from "./site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Rss, Bot, Zap, Shield, MessageSquare, Globe, BarChart3, ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useInView, SectionBadge } from "./shared";

const FILTER_TAGS = ["All", "Major", "Minor", "Patch"];

const RELEASES = [
	{
		version: "3.5.0",
		date: "March 2025",
		tag: "Minor",
		icon: Sparkles,
		headline: "Pulse Starter, Google Workspace, and smarter canned replies",
		changes: [
			{ type: "new", text: "Pulse Starter plan — flat-rate pricing for solo operators and small teams" },
			{ type: "new", text: "Google Workspace integration — Gmail and Google Chat channels now supported" },
			{ type: "new", text: "Canned replies now support AI-assisted personalization before sending" },
			{ type: "new", text: "E-commerce integrations: Stripe and Shopify order context in ticket sidebar" },
			{ type: "improvement", text: "Mobile app: inbox filters now persist between sessions" },
			{ type: "fix", text: "Fixed canned reply search not returning results with accented characters" },
		],
	},
	{
		version: "3.4.0",
		date: "February 2025",
		tag: "Major",
		icon: Bot,
		headline: "The Pulse Orchestration Update — smarter, faster, sovereign",
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
		headline: "Pulse v3 — the platform, rebuilt from the ground up",
		changes: [
			{ type: "new", text: "Pulse v3 — comprehensive architecture overhaul and new design system" },
			{ type: "new", text: "AI Agents v1 — automated triage and first response" },
			{ type: "new", text: "Microsoft 365 and Google Workspace native integrations" },
			{ type: "new", text: "Enterprise: customer-managed encryption keys (Enterprise plan)" },
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
	const [heroVisible, setHeroVisible] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
	const filtered = filter === "All" ? RELEASES : RELEASES.filter((r) => r.tag === filter);

	useEffect(() => {
		const id = requestAnimationFrame(() => setHeroVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);

	const onMove = useCallback((e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY }), []);
	useEffect(() => {
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, [onMove]);

	return (
		<SiteLayout>
			{/* ── HERO ── */}
			<section className="relative pt-16 pb-20 md:pt-28 md:pb-24 overflow-hidden border-b border-border">
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
					<div
						className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 ease-out"
						style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
					/>
					<div
						className="absolute inset-0 opacity-[0.025]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
					/>
				</div>

				<div className="container mx-auto px-4 text-center relative">
					<div className={`transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<SectionBadge icon={Rss} label="Pulse Evolution" />
						<h1 className="text-5xl md:text-[5rem] font-black mb-5 text-balance tracking-tight" style={{ lineHeight: 1.04 }}>
							What's{" "}
							<span
								style={{
									background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}>
								new
							</span>
						</h1>
						<p
							className={`text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty mb-10 transition-all duration-1000 delay-150 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							Tracking the continuous evolution of Pulse as the world's most advanced autonomous support platform.
						</p>
						<div className={`transition-all duration-1000 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							<Button
								size="xl"
								asChild
								className="group">
								<a href="/auth/signup">
									Subscribe to updates
									<Bell className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* ── FILTER BAR ── */}
			<section className="container mx-auto px-4 pt-10 pb-0">
				<div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex gap-2 flex-wrap">
						{FILTER_TAGS.map((tag) => (
							<button
								key={tag}
								onClick={() => setFilter(tag)}
								className={`relative px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300 ${filter === tag
									? "text-primary-foreground border-transparent shadow-lg shadow-primary/25"
									: "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
									}`}
								style={filter === tag ? { background: "var(--color-primary)" } : { background: "var(--color-card)" }}>
								{tag}
								{filter === tag && (
									<span
										className="absolute inset-0 rounded-full animate-pulse opacity-30 pointer-events-none"
										style={{ background: "var(--color-primary)" }}
									/>
								)}
							</button>
						))}
					</div>
					<span className="text-sm text-muted-foreground font-medium">
						{filtered.length} release{filtered.length !== 1 ? "s" : ""}
					</span>
				</div>
			</section>

			{/* ── TIMELINE ── */}
			<ChangelogTimeline releases={filtered} />

			{/* ── CTA ── */}
			<ChangelogCtaSection />
		</SiteLayout>
	);
}

function ChangelogTimeline({ releases }: { releases: typeof RELEASES }) {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref} className="container mx-auto px-4 py-12 md:py-20">
			<div className="max-w-3xl mx-auto">
				<div className="relative">
					{/* Timeline vertical line */}
					<div
						className="absolute left-5 top-0 bottom-0 w-px transition-all duration-1000"
						style={{
							background: "linear-gradient(to bottom, var(--color-primary), color-mix(in srgb, var(--color-primary) 15%, transparent))",
							opacity: inView ? 1 : 0,
						}}
					/>

					<div className="space-y-12">
						{releases.map((release, i) => {
							const counts = TYPE_COUNTS(release.changes);
							const ReleaseIcon = release.icon;
							return (
								<div
									key={release.version}
									className={`relative flex gap-8 transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
									style={{ transitionDelay: `${i * 100}ms` }}>
									{/* Timeline node */}
									<div className="relative z-10 shrink-0 flex flex-col items-center">
										<div
											className="size-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-110"
											style={{
												background: "var(--color-card)",
												borderColor: "var(--color-primary)",
												boxShadow: "0 0 16px color-mix(in srgb, var(--color-primary) 30%, transparent)",
											}}>
											<ReleaseIcon className="size-4 text-primary" />
										</div>
									</div>

									{/* Release card */}
									<div
										className="group flex-1 pb-2 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
										style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
										{/* Card header */}
										<div
											className="px-6 py-5 border-b relative overflow-hidden"
											style={{
												borderColor: "var(--color-border)",
												background:
													release.tag === "Major"
														? "linear-gradient(120deg, color-mix(in srgb, var(--color-primary) 6%, var(--color-card)), var(--color-card))"
														: "var(--color-card)",
											}}>
											{/* Hover glow */}
											<div
												className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
												style={{
													background:
														"radial-gradient(ellipse at 0% 50%, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent 60%)",
												}}
											/>
											<div className="flex flex-wrap items-center gap-3 mb-1.5 relative z-10">
												<h2 className="text-2xl font-black">v{release.version}</h2>
												<Badge className={`text-xs font-bold px-2.5 ${TAG_STYLES[release.tag]}`}>{release.tag}</Badge>
												<span className="text-sm text-muted-foreground">{release.date}</span>
											</div>
											<p className="text-sm font-semibold relative z-10">{release.headline}</p>
										</div>

										{/* Type pills */}
										<div className="flex flex-wrap gap-2 px-6 pt-4 pb-3">
											{Object.entries(counts).map(([type, n]) => {
												const s = TYPE_STYLES[type];
												return (
													<span
														key={type}
														className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.className}`}>
														<span className="size-1.5 rounded-full opacity-70" style={{ background: "currentColor" }} />
														{n} {s.label}
													</span>
												);
											})}
										</div>

										{/* Change list */}
										<ul className="space-y-0 divide-y px-6 pb-5" style={{ borderColor: "var(--color-border)" }}>
											{release.changes.map((change, ci) => {
												const style = TYPE_STYLES[change.type];
												return (
													<li key={ci} className="flex items-start gap-3 py-2.5 group/item">
														<span
															className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border mt-0.5 ${style.className}`}>
															{style.label}
														</span>
														<span className="text-sm text-muted-foreground leading-relaxed group-hover/item:text-foreground transition-colors duration-200">
															{change.text}
														</span>
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
	);
}

function ChangelogCtaSection() {
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
				<div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

				<div className="relative z-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-sm font-medium text-white mb-8">
						<Sparkles className="size-3.5" /> Shape what comes next
					</div>
					<h2 className="text-4xl md:text-6xl font-black mb-5 text-white text-balance tracking-tight">Want early access?</h2>
					<p className="text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
						Join our beta program and shape the roadmap before features ship publicly. Your feedback drives what we build next.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Button
							size="xl"
							asChild
							className="group bg-white hover:bg-white/90"
							style={{ color: "var(--color-primary)" }}>
							<a href="/contact">
								Request beta access
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button
							size="xl"
							variant="outline"
							asChild
							className="text-white border-white/35 hover:bg-white/10 hover:border-white/60">
							<a href="/auth/signup">
								<Zap className="mr-2 size-4" />
								Start free trial
							</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
