import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Plug, Zap, Shield, Globe, MessageSquare, Code2, Bot, BarChart3 } from "lucide-react";

const STATS = [
	{ value: "30+", label: "Native integrations" },
	{ value: "6,000+", label: "Apps via Zapier" },
	{ value: "< 5 min", label: "Average setup time" },
	{ value: "99.9%", label: "Webhook delivery rate" },
];

const INTEGRATIONS = [
	{
		category: "Microsoft 365",
		icon: Globe,
		description: "First-class, native integrations built specifically for M365 — not bolted-on.",
		items: [
			{ name: "Microsoft Teams", desc: "Receive and reply to tickets directly inside Teams channels and chats.", badge: "Native", logo: "🟦" },
			{ name: "Outlook / Exchange", desc: "Convert inbound emails into tickets automatically with full threading.", badge: "Native", logo: "📧" },
			{ name: "SharePoint", desc: "Attach SharePoint documents to tickets and link KB articles.", badge: "Native", logo: "📁" },
			{ name: "Azure Active Directory", desc: "SSO, user sync, and role mapping via Azure AD groups.", badge: "Native", logo: "🔑" },
			{ name: "Microsoft Copilot", desc: "Surface ticket context and suggested replies inside Copilot.", badge: "Beta", logo: "✨" },
		],
	},
	{
		category: "Communication",
		icon: MessageSquare,
		description: "Meet your customers where they are — any channel becomes a ticket.",
		items: [
			{ name: "Slack", desc: "Get ticket alerts and manage escalations without leaving Slack.", badge: null, logo: "💬" },
			{ name: "Twilio", desc: "Turn SMS and WhatsApp messages into tickets instantly.", badge: null, logo: "📱" },
			{ name: "Zendesk", desc: "Migrate from Zendesk or run both systems side-by-side.", badge: null, logo: "🎫" },
			{ name: "Intercom", desc: "Sync live chat conversations to your ticket queue.", badge: null, logo: "💭" },
		],
	},
	{
		category: "CRM & Sales",
		icon: BarChart3,
		description: "Connect support data to your revenue systems for full customer context.",
		items: [
			{ name: "Salesforce", desc: "Link tickets to accounts, contacts, and opportunities in Salesforce.", badge: null, logo: "☁️" },
			{ name: "HubSpot", desc: "Create CRM contacts automatically from ticket submitters.", badge: null, logo: "🟠" },
			{ name: "Dynamics 365", desc: "Bi-directional sync with Microsoft Dynamics CRM records.", badge: "Native", logo: "🔷" },
		],
	},
	{
		category: "Developer & DevOps",
		icon: Code2,
		description: "Bridge support and engineering so bugs get fixed, not forgotten.",
		items: [
			{ name: "GitHub", desc: "Link bug tickets to GitHub issues and track resolution progress.", badge: null, logo: "🐙" },
			{ name: "Jira", desc: "Escalate tickets to Jira epics and stories with one click.", badge: null, logo: "🔵" },
			{ name: "PagerDuty", desc: "Trigger on-call alerts from high-priority tickets.", badge: null, logo: "🚨" },
			{ name: "Webhook API", desc: "Send ticket events to any endpoint in real time.", badge: null, logo: "🔗" },
		],
	},
	{
		category: "AI & Automation",
		icon: Bot,
		description: "Extend AI capabilities and connect to thousands of apps with no code.",
		items: [
			{ name: "Azure OpenAI", desc: "Power AI agents with your own Azure OpenAI deployment for data sovereignty.", badge: "Enterprise", logo: "🤖" },
			{ name: "Zapier", desc: "Connect SupportDesk 365 to 6,000+ apps via Zapier workflows.", badge: null, logo: "⚡" },
			{ name: "Power Automate", desc: "Trigger Microsoft Power Automate flows from ticket events.", badge: "Native", logo: "🔄" },
		],
	},
];

const BADGE_STYLES: Record<string, string> = {
	Native: "bg-primary/10 text-primary border-primary/20",
	Beta: "bg-warning/10 text-warning border-warning/20",
	Enterprise: "bg-muted text-muted-foreground border-border",
};

const HOW_IT_WORKS = [
	{ step: "01", title: "Connect in one click", desc: "Authorize the integration from your dashboard — no developer required for most tools." },
	{ step: "02", title: "Map your data", desc: "Choose which fields, channels, or projects sync between SupportDesk and your tool." },
	{ step: "03", title: "Go live instantly", desc: "Events flow in real time. Everything is logged and auditable from day one." },
];

export default function IntegrationsPage() {
	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 text-center">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
						<Plug className="size-3.5" />
						30+ integrations and counting
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">Connect your entire stack</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty mb-8">
						SupportDesk 365 plugs into the tools your team already uses — starting with a deep, native Microsoft 365 integration.
					</p>
					<Button size="lg" asChild className="group h-12 px-8">
						<a href="/signup">
							Get started free
							<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
						</a>
					</Button>
				</div>
			</section>

			{/* Stats */}
			<section className="border-b border-border">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border max-w-5xl mx-auto">
						{STATS.map(({ value, label }) => (
							<div
								key={label}
								className="flex flex-col items-center justify-center gap-1 bg-card py-10 text-center group hover:bg-primary/5 transition-colors">
								<div className="text-3xl font-black text-primary">{value}</div>
								<div className="text-sm text-muted-foreground">{label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="container mx-auto px-4 py-16 max-w-5xl">
				<h2 className="text-2xl font-bold mb-8 text-center">Set up any integration in minutes</h2>
				<div className="grid md:grid-cols-3 gap-6">
					{HOW_IT_WORKS.map(({ step, title, desc }) => (
						<div key={step} className="flex flex-col gap-3 p-6 rounded-xl border border-border bg-card">
							<span className="text-4xl font-black text-muted-foreground/20">{step}</span>
							<h3 className="font-semibold">{title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* Integration groups */}
			<section className="container mx-auto px-4 py-10 md:py-16">
				<div className="max-w-6xl mx-auto space-y-16">
					{INTEGRATIONS.map((group) => {
						const GroupIcon = group.icon;
						return (
							<div key={group.category}>
								<div className="flex items-start gap-4 mb-6">
									<div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
										<GroupIcon className="size-5 text-primary" />
									</div>
									<div>
										<h2 className="text-2xl font-bold">{group.category}</h2>
										<p className="text-sm text-muted-foreground mt-0.5">{group.description}</p>
									</div>
								</div>
								<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
									{group.items.map((item) => (
										<div
											key={item.name}
											className="group flex flex-col gap-3 p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-0.5">
											<div className="flex items-start justify-between gap-2">
												<div className="flex items-center gap-2.5">
													<span className="text-xl leading-none">{item.logo}</span>
													<h3 className="font-semibold">{item.name}</h3>
												</div>
												{item.badge && (
													<span
														className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${BADGE_STYLES[item.badge] ?? ""}`}>
														{item.badge}
													</span>
												)}
											</div>
											<p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
											<div className="flex items-center gap-1.5 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
												<CheckCircle2 className="size-3.5" />
												<span>Available on all plans</span>
											</div>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Security note */}
			<section className="container mx-auto px-4 pb-10 max-w-6xl">
				<div className="rounded-2xl border border-border bg-muted/20 p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
					<div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
						<Shield className="size-6 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold mb-1">Enterprise-grade security for every integration</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							All integrations use OAuth 2.0 or API key authentication, enforce TLS 1.3 in transit, and are scoped to the minimum permissions
							required. Webhook payloads are signed with HMAC-SHA256. Full audit logs available on all plans.
						</p>
					</div>
					<Button variant="outline" size="sm" asChild className="shrink-0">
						<a href="/security">
							Security docs
							<ArrowRight className="ml-1.5 size-3.5" />
						</a>
					</Button>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Don't see your tool?</h2>
					<p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
						Our REST API and webhook system lets you connect to any platform. Enterprise customers get dedicated integration engineering support.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3">
						<Button size="lg" asChild className="group h-12 px-8">
							<a href="/contact">
								Request an integration
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="h-12 px-8">
							<a href="/help">
								<Zap className="mr-2 size-4" />
								View API docs
							</a>
						</Button>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
