import { SiteLayout } from "./site-layout";
import { Bell } from "lucide-react";
import { useState } from "react";
import { useInView, useMountVisible, PulseLine, MonoTag, CtaLink, DarkCta } from "./shared";

const FILTER_TAGS = ["All", "Major", "Minor", "Patch"];

const RELEASES = [
	{
		version: "3.5.0",
		date: "MAR 2025",
		tag: "Minor",
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
		date: "FEB 2025",
		tag: "Major",
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
		date: "JAN 2025",
		tag: "Patch",
		headline: "Notification reliability and dark-mode polish",
		changes: [
			{ type: "fix", text: "Resolved Teams notification duplication on ticket reassignment" },
			{ type: "fix", text: "CSAT survey link now renders correctly in Outlook mobile" },
			{ type: "improvement", text: "Improved dark mode contrast ratios across all dashboards" },
		],
	},
	{
		version: "3.3.0",
		date: "DEC 2024",
		tag: "Minor",
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
		date: "NOV 2024",
		tag: "Minor",
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
		date: "OCT 2024",
		tag: "Minor",
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
		date: "SEP 2024",
		tag: "Major",
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
	new: { label: "NEW", className: "text-accent border-accent/40" },
	improvement: { label: "IMPROVED", className: "text-primary border-primary/30" },
	fix: { label: "FIX", className: "text-amber-600 border-amber-500/40" },
};

const TAG_STYLES: Record<string, string> = {
	Major: "bg-primary text-primary-foreground border-primary",
	Minor: "text-primary border-primary/40",
	Patch: "text-muted-foreground border-border",
};

export default function ChangelogPage() {
	const [filter, setFilter] = useState("All");
	const visible = useMountVisible();
	const filtered = filter === "All" ? RELEASES : RELEASES.filter((r) => r.tag === filter);

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
								VERSION_LOG — CONTINUOUS DEPLOYMENT<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Every release,{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								on the record
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
							Tracking the continuous evolution of Pulse as the world's most advanced autonomous support platform.
						</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/auth/signup">
								Subscribe to updates <Bell className="size-3.5" />
							</CtaLink>
						</div>
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── FILTER BAR ── */}
				<div className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-12 py-4 border-b border-border">
					<div className="flex gap-2 flex-wrap">
						{FILTER_TAGS.map((tag) => (
							<button
								key={tag}
								onClick={() => setFilter(tag)}
								className={`px-4 py-2 border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
									filter === tag
										? "bg-primary text-primary-foreground border-primary"
										: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
								}`}>
								{tag}
							</button>
						))}
					</div>
					<MonoTag>
						{filtered.length} RELEASE{filtered.length !== 1 ? "S" : ""} FOUND
					</MonoTag>
				</div>

				{/* ── VERSION LOG ── */}
				<VersionLog releases={filtered} filter={filter} />

				{/* ── CTA ── */}
				<DarkCta
					tag="EOF — BETA PROGRAM · SHAPE WHAT COMES NEXT"
					headline={
						<>
							Want early <span style={{ color: "var(--pulse-lime)" }}>access?</span>
						</>
					}
					desc="Join our beta program and shape the roadmap before features ship publicly. Your feedback drives what we build next."
					primary={{ href: "/contact", label: "Request beta access" }}
					secondary={{ href: "/auth/signup", label: "Start free trial" }}
				/>
			</div>
		</SiteLayout>
	);
}

function VersionLog({ releases, filter }: { releases: typeof RELEASES; filter: string }) {
	const { ref, inView } = useInView({ threshold: 0.02 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>} key={filter} className="animate-in fade-in duration-300">
			{releases.map((release, i) => (
				<article
					key={release.version}
					className={`grid lg:grid-cols-12 border-b border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
					style={{ transitionDelay: `${Math.min(i, 4) * 80}ms` }}>
					{/* version rail */}
					<div className="lg:col-span-3 px-6 md:px-12 lg:pr-8 pt-10 pb-4 lg:pb-10 lg:border-r border-border">
						<div className="lg:sticky lg:top-24">
							<div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3">
								<h2 className="text-3xl font-black tracking-tighter" style={{ fontVariantNumeric: "tabular-nums" }}>
									v{release.version}
								</h2>
								<span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">{release.date}</span>
								<span className={`font-mono text-[9px] tracking-[0.25em] border px-2 py-1 font-bold ${TAG_STYLES[release.tag]}`}>
									{release.tag.toUpperCase()}
								</span>
							</div>
						</div>
					</div>

					{/* changes */}
					<div className="lg:col-span-9 px-6 md:px-12 pt-2 lg:pt-10 pb-10">
						<h3 className="text-xl md:text-2xl font-black tracking-tight mb-6 text-balance">{release.headline}</h3>
						<ul className="divide-y divide-border border-y border-border">
							{release.changes.map((change, ci) => {
								const style = TYPE_STYLES[change.type];
								return (
									<li key={ci} className="flex items-start gap-4 py-3 group/item">
										<span
											className={`shrink-0 w-22 text-center font-mono text-[9px] tracking-[0.2em] border px-1.5 py-1 font-bold mt-0.5 ${style.className}`}>
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
				</article>
			))}
		</section>
	);
}
