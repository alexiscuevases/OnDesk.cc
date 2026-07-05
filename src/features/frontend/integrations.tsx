import { SiteLayout } from "./site-layout";
import { ArrowRight, Shield, Globe, MessageSquare, Code2, Bot, BarChart3 } from "lucide-react";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";

const INTEGRATIONS = [
	{
		category: "Google Workspace",
		icon: Globe,
		description: "First-class support for teams that live in Google — no complexity, just results.",
		items: [
			{ name: "Gmail", desc: "Convert inbound Gmail messages into tickets automatically with full threading.", badge: "Native", logo: "📩" },
			{ name: "Google Chat", desc: "Receive and reply to support tickets directly inside Google Chat spaces.", badge: "Native", logo: "💬" },
			{ name: "Google Drive", desc: "Attach Drive files to tickets and share KB articles instantly.", badge: null, logo: "📁" },
			{ name: "Google SSO", desc: "One-click sign-in and user management via Google Identity.", badge: null, logo: "🔑" },
		],
	},
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
		category: "E-commerce & Payments",
		icon: BarChart3,
		description: "Bring order data, billing context, and payment status directly into every ticket.",
		items: [
			{ name: "Stripe", desc: "See subscription status, payment history, and invoices inside any ticket.", badge: null, logo: "💳" },
			{ name: "Shopify", desc: "Surface order status, tracking, and returns without leaving Pulse.", badge: null, logo: "🛍️" },
			{ name: "PayPal", desc: "View transaction details and resolve billing disputes faster.", badge: null, logo: "🅿️" },
			{ name: "WooCommerce", desc: "Connect your WooCommerce store and handle order support in one place.", badge: null, logo: "🛒" },
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
			{ name: "Zapier", desc: "Connect Pulse to 6,000+ apps via Zapier workflows.", badge: null, logo: "⚡" },
			{ name: "Power Automate", desc: "Trigger Microsoft Power Automate flows from ticket events.", badge: "Native", logo: "🔄" },
		],
	},
];

const BADGE_STYLES: Record<string, string> = {
	Native: "text-accent border-accent/40",
	Beta: "text-amber-600 border-amber-500/40",
	Enterprise: "text-muted-foreground border-border",
};

const HOW_IT_WORKS = [
	{ step: "01", title: "Connect in one click", desc: "Authorize the integration from your dashboard — no developer required for most tools." },
	{ step: "02", title: "Map your data", desc: "Choose which fields, channels, or projects sync between Pulse and your tool." },
	{ step: "03", title: "Go live instantly", desc: "Events flow in real time. Everything is logged and auditable from day one." },
];

export default function IntegrationsPage() {
	const visible = useMountVisible();
	const { ref: statsRef, inView: statsInView } = useInView();
	const c30 = useCounter(30, 1000, statsInView);
	const c6000 = useCounter(6000, 1400, statsInView);
	const c5 = useCounter(5, 900, statsInView);
	const c999 = useCounter(999, 1300, statsInView);

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
								MARKETPLACE — CONNECTOR REGISTRY<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Connect the tools{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								you already use
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
							Whether you use Gmail or Microsoft 365, Stripe or Salesforce — Pulse connects to your stack in minutes.
						</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/auth/signup">
								Get started free <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
						</div>
					</div>

					{/* stats — hairline telemetry row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${c30}+`, label: "ECOSYSTEM PARTNERS" },
								{ value: `${c6000.toLocaleString()}+`, label: "WORKFLOW AUTOMATIONS" },
								{ value: `< ${c5} MIN`, label: "NATIVE SETUP" },
								{ value: `${(c999 / 10).toFixed(1)}%`, label: "DELIVERY RELIABILITY" },
							].map(({ value, label }, i) => (
								<div
									key={label}
									className={`px-4 md:px-10 py-8 transition-all duration-700 ${statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
									style={{ transitionDelay: `${i * 100}ms` }}>
									<div className="text-3xl md:text-4xl font-black tracking-tighter mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>
										{value}
									</div>
									<div className="font-mono text-[10px] tracking-[0.2em] text-primary font-semibold">{label}</div>
								</div>
							))}
						</div>
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── PROTOCOL — dark band ── */}
				<HowItWorksBand />

				{/* ── REGISTRY ── */}
				<RegistrySection />

				{/* ── SECURITY STRIP ── */}
				<SecurityStrip />

				{/* ── CTA ── */}
				<DarkCta
					tag="03 — BUILD · GRAPHQL API + DEVELOPER SDK"
					headline={
						<>
							Build your own <span style={{ color: "var(--pulse-lime)" }}>flow.</span>
						</>
					}
					desc="Extend Pulse with our robust GraphQL API and developer SDK. Build custom internal apps or connect proprietary legacy systems."
					primary={{ href: "/contact", label: "Request an integration" }}
					secondary={{ href: "/help", label: "View API docs" }}
				/>
			</div>
		</SiteLayout>
	);
}

function HowItWorksBand() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white border-b border-border" style={{ background: "var(--pulse-ink)" }}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
				<span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: "var(--pulse-lime)" }}>
					01 — PROTOCOL
				</span>
				<span className="hidden sm:block font-mono text-[11px] tracking-[0.25em] text-white/40">CONNECT → MAP → LIVE</span>
			</div>

			<div className={`px-6 md:px-12 pt-14 pb-4 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance max-w-3xl">
					Deploy Marketplace tools <span style={{ color: "var(--pulse-lime)" }}>in minutes.</span>
				</h2>
			</div>

			<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10">
				{HOW_IT_WORKS.map(({ step, title, desc }, i) => (
					<div
						key={step}
						className={`px-6 md:px-12 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 150 + 150}ms` }}>
						<span className="font-mono text-5xl font-black text-white/15 block mb-8">/{step}</span>
						<h3 className="text-xl font-bold mb-3">{title}</h3>
						<p className="text-sm text-white/50 leading-relaxed">{desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

function RegistrySection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule
				index="02"
				label="REGISTRY"
				title="Every connector, indexed"
				right={`${INTEGRATIONS.reduce((n, g) => n + g.items.length, 0)} CONNECTORS / ${INTEGRATIONS.length} CATEGORIES`}
			/>
			<div className="h-10" />

			{INTEGRATIONS.map((group, gi) => {
				const GroupIcon = group.icon;
				return (
					<div
						key={group.category}
						className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${gi * 60}ms` }}>
						{/* category header row */}
						<div className="flex items-center gap-4 px-6 md:px-12 py-4 border-t border-border">
							<GroupIcon className="size-4 text-accent shrink-0" />
							<span className="font-mono text-[11px] tracking-[0.25em] text-primary font-semibold uppercase">
								CAT_0{gi + 1} / {group.category}
							</span>
							<span className="hidden md:block text-xs text-muted-foreground truncate">{group.description}</span>
							<span className="ml-auto font-mono text-[10px] tracking-widest text-muted-foreground/60 shrink-0">
								{group.items.length} ITEMS
							</span>
						</div>

						{/* connector cells */}
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-t border-border">
							{group.items.map((item) => (
								<div key={item.name} className="group relative bg-background px-6 py-6 flex flex-col">
									<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
									<div className="flex items-start justify-between gap-2 mb-3">
										<div className="flex items-center gap-2.5">
											<span className="text-xl leading-none select-none">{item.logo}</span>
											<h3 className="font-bold text-sm">{item.name}</h3>
										</div>
										{item.badge && (
											<span className={`shrink-0 font-mono text-[9px] tracking-[0.2em] border px-1.5 py-0.5 ${BADGE_STYLES[item.badge] ?? ""}`}>
												{item.badge.toUpperCase()}
											</span>
										)}
									</div>
									<p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
									<div className="font-mono text-[10px] tracking-[0.15em] text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4">
										✓ AVAILABLE ON ALL PLANS
									</div>
								</div>
							))}
						</div>
					</div>
				);
			})}
		</section>
	);
}

function SecurityStrip() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-t border-border">
			<div
				className={`flex flex-col md:flex-row md:items-center gap-5 px-6 md:px-12 py-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				<Shield className="size-6 text-accent shrink-0" />
				<div className="flex-1">
					<p className="font-bold mb-1">High-performance connectivity for the Enterprise</p>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Every Marketplace connection leverages sovereign security protocols, TLS 1.3 encryption, and signed HMAC-SHA256 payloads.
					</p>
				</div>
				<a
					href="/security"
					className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-primary hover:text-accent transition-colors shrink-0">
					Security docs <ArrowRight className="size-3" />
				</a>
			</div>
		</section>
	);
}
