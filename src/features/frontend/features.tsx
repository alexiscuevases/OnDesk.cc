import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
	Bot,
	Zap,
	Shield,
	Users,
	BarChart3,
	MessageSquare,
	CheckCircle2,
	ArrowRight,
	Headset,
	Globe,
	Bell,
	Lock,
	Play,
	TrendingUp,
	Clock,
	Star,
} from "lucide-react";

const TABS = ["All", "Automation", "Analytics", "Security", "Channels"];

const ALL_FEATURES = [
	{
		icon: Bot,
		title: "AI Agents",
		description: "Intelligent agents triage, classify, and auto-resolve up to 80% of incoming tickets around the clock — no human required.",
		bullets: [
			"Context-aware auto-replies",
			"Smart escalation to human agents",
			"Continuous learning from resolutions",
			"Multilingual support out of the box",
		],
		tabs: ["All", "Automation"],
		stat: "80%",
		statLabel: "auto-resolution rate",
	},
	{
		icon: Zap,
		title: "Instant SLA Tracking",
		description: "Real-time SLA dashboards fire breach alerts before they happen, keeping your team ahead of every commitment.",
		bullets: ["Custom SLA tiers per customer", "Automated breach notifications", "Priority queue rebalancing", "Historical compliance reports"],
		tabs: ["All", "Automation", "Analytics"],
		stat: "99.4%",
		statLabel: "SLA compliance avg.",
	},
	{
		icon: Shield,
		title: "Enterprise Security",
		description: "Built on Microsoft Azure with SOC 2 Type II, GDPR, and ISO 27001 compliance baked in from day one.",
		bullets: ["Azure AD SSO & MFA", "Role-based access control", "End-to-end encryption at rest & in transit", "Audit logs with 1-year retention"],
		tabs: ["All", "Security"],
		stat: "SOC 2",
		statLabel: "Type II certified",
	},
	{
		icon: Users,
		title: "Team Management",
		description: "Supervisors get a live heatmap of agent workloads, shift coverage, and real-time performance metrics.",
		bullets: ["Live workload heatmaps", "Skill-based ticket routing", "Shift scheduling integration", "Internal knowledge base"],
		tabs: ["All", "Automation"],
		stat: "3x",
		statLabel: "faster onboarding",
	},
	{
		icon: BarChart3,
		title: "Advanced Analytics",
		description: "Pre-built and custom dashboards surface CSAT trends, volume forecasts, and agent KPIs without a BI team.",
		bullets: ["CSAT & NPS tracking", "Volume forecast models", "Agent performance scorecards", "Exportable reports (CSV, PDF)"],
		tabs: ["All", "Analytics"],
		stat: "4.8★",
		statLabel: "avg. CSAT score",
	},
	{
		icon: MessageSquare,
		title: "Omnichannel Inbox",
		description: "Email, Teams chat, web widget, and phone tickets all land in one unified queue with full conversation history.",
		bullets: ["Microsoft Teams native integration", "Web widget & email ingest", "Phone-to-ticket transcription", "Unified customer timeline"],
		tabs: ["All", "Channels"],
		stat: "8+",
		statLabel: "channels unified",
	},
	{
		icon: Globe,
		title: "Self-Service Portal",
		description: "Give customers a branded portal to submit tickets, track status, and search your knowledge base 24/7.",
		bullets: ["Fully customizable branding", "AI-powered article suggestions", "Real-time ticket status", "Community Q&A"],
		tabs: ["All", "Channels"],
		stat: "40%",
		statLabel: "deflection rate",
	},
	{
		icon: Bell,
		title: "Smart Notifications",
		description: "Configurable notification rules ensure the right person is pinged at the right time — never flooded.",
		bullets: ["Digest mode to reduce noise", "Escalation chains", "Mobile push & email", "Slack & Teams webhooks"],
		tabs: ["All", "Automation", "Channels"],
		stat: "0",
		statLabel: "missed escalations",
	},
	{
		icon: Lock,
		title: "Data Residency",
		description: "Choose where your data lives. US, EU, or Asia-Pacific regions available for enterprise plans.",
		bullets: ["Regional data centers", "Sovereign cloud option", "Customer-managed encryption keys", "GDPR DPA included"],
		tabs: ["All", "Security"],
		stat: "3",
		statLabel: "global regions",
	},
];

const SOCIAL_PROOF = [
	{
		quote: "Resolved our first 500 tickets in 48 hours after onboarding. The AI agent is uncanny.",
		author: "Laura M.",
		role: "Head of Support, Nexus Labs",
		rating: 5,
	},
	{
		quote: "SLA compliance went from 71% to 99% in our first month. Our enterprise clients noticed immediately.",
		author: "David K.",
		role: "VP Operations, Vantage Group",
		rating: 5,
	},
	{
		quote: "The omnichannel inbox is the single best upgrade we have made to our support stack.",
		author: "Priya S.",
		role: "Support Director, CloudBridge",
		rating: 5,
	},
];

export default function FeaturesPage() {
	const [activeTab, setActiveTab] = useState("All");

	const visible = ALL_FEATURES.filter((f) => f.tabs.includes(activeTab));

	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 text-center">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
						<Headset className="size-3.5" />
						Everything your support team needs
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">Features built for modern support</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 text-pretty">
						From AI-powered automation to enterprise security, every capability in SupportDesk 365 is designed to help your team resolve more,
						faster.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3 mb-12">
						<Button size="lg" asChild className="group h-12 px-8">
							<a href="/signup">
								Start free trial
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="h-12 px-8 gap-2">
							<a href="#demo">
								<Play className="size-4" />
								Watch demo
							</a>
						</Button>
					</div>

					{/* Stat strip */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden max-w-3xl mx-auto border border-border">
						{[
							{ icon: TrendingUp, value: "80%", label: "Auto-resolution" },
							{ icon: Clock, value: "< 2 min", label: "First response" },
							{ icon: Star, value: "4.8 / 5", label: "Avg. CSAT" },
							{ icon: Shield, value: "SOC 2", label: "Certified" },
						].map(({ icon: Icon, value, label }) => (
							<div key={label} className="flex flex-col items-center gap-1 py-5 px-4 bg-card">
								<Icon className="size-4 text-primary mb-1" />
								<span className="text-xl font-bold">{value}</span>
								<span className="text-xs text-muted-foreground">{label}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Tab filter + Feature grid */}
			<section className="container mx-auto px-4 py-20 md:py-28">
				{/* Tabs */}
				<div className="flex flex-wrap justify-center gap-2 mb-12">
					{TABS.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
								activeTab === tab
									? "bg-primary text-primary-foreground border-primary"
									: "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
							}`}>
							{tab}
						</button>
					))}
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{visible.map(({ icon: Icon, title, description, bullets, stat, statLabel }) => (
						<div
							key={title}
							className="group flex flex-col gap-5 p-7 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
							<div className="flex items-start justify-between">
								<div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
									<Icon className="size-5 text-primary" />
								</div>
								<div className="text-right">
									<div className="text-xl font-bold text-primary">{stat}</div>
									<div className="text-xs text-muted-foreground">{statLabel}</div>
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold mb-2">{title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
							</div>
							<ul className="space-y-1.5 mt-auto">
								{bullets.map((b) => (
									<li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
										<CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
										{b}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</section>

			{/* Social proof strip */}
			<section className="border-t border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4 max-w-5xl">
					<h2 className="text-center text-2xl font-bold mb-10">What teams say after switching</h2>
					<div className="grid md:grid-cols-3 gap-6">
						{SOCIAL_PROOF.map(({ quote, author, role, rating }) => (
							<div key={author} className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card">
								<div className="flex gap-0.5">
									{Array.from({ length: rating }).map((_, i) => (
										<Star key={i} className="size-4 fill-primary text-primary" />
									))}
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed flex-1">"{quote}"</p>
								<div className="border-t border-border pt-4">
									<div className="text-sm font-semibold">{author}</div>
									<div className="text-xs text-muted-foreground">{role}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Bottom CTA */}
			<section className="border-t border-border py-16">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Ready to see it in action?</h2>
					<p className="text-muted-foreground mb-8 max-w-xl mx-auto">
						Start your 14-day free trial. No credit card required. Full access to every feature.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3">
						<Button size="lg" asChild className="group h-12 px-8">
							<a href="/signup">
								Start free trial
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="h-12 px-8">
							<a href="/contact">Talk to sales</a>
						</Button>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
