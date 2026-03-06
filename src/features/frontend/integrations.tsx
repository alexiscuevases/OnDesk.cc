import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Plug, Zap, Shield, Globe, MessageSquare, Code2, Bot, BarChart3, Layers, Clock, Activity } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useInView, useCounter, SectionBadge } from "./shared";

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
	const [visible, setVisible] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
	const statsRef = useInView();
	const c30 = useCounter(30, 1000, statsRef.inView);
	const c6000 = useCounter(6000, 1400, statsRef.inView);
	const c5 = useCounter(5, 900, statsRef.inView);
	const c999 = useCounter(999, 1300, statsRef.inView);

	useEffect(() => {
		const id = requestAnimationFrame(() => setVisible(true));
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
			<section className="relative pt-16 pb-20 md:pt-28 md:pb-28 overflow-hidden border-b border-border">
				{/* Background */}
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
					<div
						className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 ease-out"
						style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
					/>
					<div
						className="absolute top-16 right-[12%] size-72 rounded-full blur-[80px] animate-pulse"
						style={{ animationDuration: "7s", background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}
					/>
					<div
						className="absolute inset-0 opacity-[0.025]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
					/>
				</div>

				<div className="container mx-auto px-4 text-center relative">
					<div className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<SectionBadge icon={Plug} label="30+ integrations and counting" />
						<h1 className="text-5xl md:text-[5rem] font-black mb-5 text-balance tracking-tight" style={{ lineHeight: 1.04 }}>
							Connect your{" "}
							<span
								style={{
									background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}>
								entire stack
							</span>
						</h1>
						<p
							className={`text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty mb-10 transition-all duration-1000 delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							SupportDesk 365 plugs into the tools your team already uses — starting with a deep, native Microsoft 365 integration.
						</p>
						<div className={`transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							<Button
								size="xl"
								asChild
								className="group">
								<a href="/auth/signup">
									Get started free
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
						</div>
					</div>

					{/* Stat strip */}
					<div
						ref={statsRef.ref as React.RefObject<HTMLDivElement>}
						className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 transition-all duration-1000 delay-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						{[
							{ icon: Layers, displayValue: `${c30}+`, label: "Native integrations" },
							{ icon: Zap, displayValue: `${c6000.toLocaleString()}+`, label: "Apps via Zapier" },
							{ icon: Clock, displayValue: `< ${c5} min`, label: "Average setup time" },
							{ icon: Activity, displayValue: `${(c999 / 10).toFixed(1)}%`, label: "Webhook delivery rate" },
						].map(({ icon: Icon, displayValue, label }, i) => (
							<div
								key={label}
								className={`group relative flex flex-col items-center gap-1.5 py-6 px-4 rounded-2xl border transition-all duration-700 hover:-translate-y-1 hover:shadow-lg overflow-hidden cursor-default ${statsRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ background: "var(--color-card)", borderColor: "var(--color-border)", transitionDelay: `${i * 80}ms` }}>
								<div
									className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
									style={{
										background:
											"radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
									}}
								/>
								<Icon className="size-4 text-primary mb-0.5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
								<span
									className="text-2xl font-black relative z-10"
									style={{ color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>
									{displayValue}
								</span>
								<span className="text-xs text-muted-foreground relative z-10">{label}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── HOW IT WORKS ── */}
			<HowItWorksSection />

			{/* ── INTEGRATION GROUPS ── */}
			<IntegrationGroupsSection />

			{/* ── SECURITY NOTE ── */}
			<SecuritySection />

			{/* ── CTA ── */}
			<IntegrationsCtaSection />
		</SiteLayout>
	);
}

function HowItWorksSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-20 max-w-5xl">
			<div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<SectionBadge icon={Zap} label="Quick setup" />
				<h2 className="text-3xl md:text-5xl font-black text-balance tracking-tight">Set up any integration in minutes</h2>
			</div>
			<div className="grid md:grid-cols-3 gap-6">
				{HOW_IT_WORKS.map(({ step, title, desc }, i) => (
					<div
						key={step}
						className={`group relative flex flex-col gap-4 p-7 rounded-2xl border overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
						style={{
							background: "var(--color-card)",
							borderColor: "var(--color-border)",
							transitionDelay: `${i * 100}ms`,
						}}>
						{/* Hover glow */}
						<div
							className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
							style={{
								background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 70%)",
							}}
						/>
						<div
							className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
							style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)" }}
						/>
						<span
							className="text-6xl font-black leading-none relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 inline-block"
							style={{ color: "color-mix(in srgb, var(--color-primary) 15%, transparent)" }}>
							{step}
						</span>
						<h3 className="font-bold text-lg relative z-10">{title}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed relative z-10">{desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

function IntegrationGroupsSection() {
	const { ref, inView } = useInView({ threshold: 0.04 });
	return (
		<section ref={ref} className="container mx-auto px-4 py-6 md:py-12 pb-16">
			<div className="max-w-6xl mx-auto space-y-20">
				{INTEGRATIONS.map((group, gi) => {
					const GroupIcon = group.icon;
					return (
						<div
							key={group.category}
							className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
							style={{ transitionDelay: `${gi * 80}ms` }}>
							{/* Group header */}
							<div className="flex items-start gap-4 mb-7">
								<div
									className="size-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
									style={{
										background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
										boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)",
									}}>
									<GroupIcon className="size-5 text-primary" />
								</div>
								<div>
									<h2 className="text-2xl font-black">{group.category}</h2>
									<p className="text-sm text-muted-foreground mt-1">{group.description}</p>
								</div>
							</div>
							{/* Cards grid */}
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
								{group.items.map((item, ii) => (
									<div
										key={item.name}
										className={`group relative flex flex-col gap-3 p-6 rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
										style={{
											background: "var(--color-card)",
											borderColor: "var(--color-border)",
											transitionDelay: `${gi * 80 + ii * 60}ms`,
										}}>
										{/* Hover glow */}
										<div
											className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
											style={{
												background:
													"radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 65%)",
											}}
										/>
										<div
											className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
											style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 28%, transparent)" }}
										/>

										<div className="flex items-start justify-between gap-2 relative z-10">
											<div className="flex items-center gap-2.5">
												<span className="text-2xl leading-none select-none">{item.logo}</span>
												<h3 className="font-bold">{item.name}</h3>
											</div>
											{item.badge && (
												<span
													className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${BADGE_STYLES[item.badge] ?? ""}`}>
													{item.badge}
												</span>
											)}
										</div>
										<p className="text-sm text-muted-foreground leading-relaxed flex-1 relative z-10">{item.desc}</p>
										<div
											className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 relative z-10"
											style={{ color: "var(--color-primary)" }}>
											<CheckCircle2 className="size-3.5" />
											Available on all plans
										</div>
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function SecuritySection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 pb-16 max-w-6xl">
			<div
				className={`relative rounded-3xl border overflow-hidden p-7 flex flex-col md:flex-row items-start md:items-center gap-6 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
				style={{
					background: "linear-gradient(120deg, color-mix(in srgb, var(--color-primary) 6%, var(--color-card)), var(--color-card))",
					borderColor: "color-mix(in srgb, var(--color-primary) 25%, transparent)",
					boxShadow: "0 4px 30px -6px color-mix(in srgb, var(--color-primary) 10%, transparent)",
				}}>
				<div
					className="absolute inset-0 opacity-[0.03] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "30px 30px" }}
				/>
				<div
					className="size-14 rounded-2xl flex items-center justify-center shrink-0 relative z-10"
					style={{
						background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
						boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)",
					}}>
					<Shield className="size-7 text-primary" />
				</div>
				<div className="flex-1 relative z-10">
					<h3 className="font-bold text-lg mb-1">Enterprise-grade security for every integration</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						All integrations use OAuth 2.0 or API key authentication, enforce TLS 1.3 in transit, and are scoped to the minimum permissions
						required. Webhook payloads are signed with HMAC-SHA256. Full audit logs available on all plans.
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					asChild
					className="shrink-0 relative z-10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
					<a href="/security">
						Security docs
						<ArrowRight className="ml-1.5 size-3.5" />
					</a>
				</Button>
			</div>
		</section>
	);
}

function IntegrationsCtaSection() {
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
					<SectionBadge icon={Code2} label="Don't see your tool?" />
					<h2 className="text-4xl md:text-6xl font-black mb-5 text-white text-balance tracking-tight">Build any integration</h2>
					<p className="text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
						Our REST API and webhook system lets you connect to any platform. Enterprise customers get dedicated integration engineering support.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Button
							size="xl"
							asChild
							className="group bg-white hover:bg-white/90"
							style={{ color: "var(--color-primary)" }}>
							<a href="/contact">
								Request an integration
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button
							size="xl"
							variant="outline"
							asChild
							className="text-white border-white/35 hover:bg-white/10 hover:border-white/60">
							<a href="/help">
								<Zap className="mr-2 size-4" />
								View API docs
							</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
