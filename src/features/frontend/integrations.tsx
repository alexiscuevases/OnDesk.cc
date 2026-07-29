import { SiteLayout } from "./site-layout";
import { ArrowRight, Shield, Globe, MessageSquare, Code2, Bot, BarChart3 } from "lucide-react";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

// ── Structure ──
// Connector names, emoji logos, badge ids and category ordering live here.
// Descriptions and category names come from the dictionary, keyed to match.

type CategoryKey = keyof Dictionary["integrations"]["categories"];
type BadgeId = keyof Dictionary["integrations"]["badges"];

interface Connector {
	key: string;
	name: string;
	logo: string;
	badge?: BadgeId;
}

interface CategoryConfig {
	key: CategoryKey;
	icon: React.ElementType;
	items: Connector[];
}

const CATEGORIES: CategoryConfig[] = [
	{
		key: "google",
		icon: Globe,
		items: [
			{ key: "gmail", name: "Gmail", logo: "📩", badge: "native" },
			{ key: "chat", name: "Google Chat", logo: "💬", badge: "native" },
			{ key: "drive", name: "Google Drive", logo: "📁" },
			{ key: "sso", name: "Google SSO", logo: "🔑" },
		],
	},
	{
		key: "microsoft",
		icon: Globe,
		items: [
			{ key: "teams", name: "Microsoft Teams", logo: "🟦", badge: "native" },
			{ key: "outlook", name: "Outlook / Exchange", logo: "📧", badge: "native" },
			{ key: "sharepoint", name: "SharePoint", logo: "📁", badge: "native" },
			{ key: "azureAd", name: "Azure Active Directory", logo: "🔑", badge: "native" },
			{ key: "copilot", name: "Microsoft Copilot", logo: "✨", badge: "beta" },
		],
	},
	{
		key: "communication",
		icon: MessageSquare,
		items: [
			{ key: "slack", name: "Slack", logo: "💬" },
			{ key: "twilio", name: "Twilio", logo: "📱" },
			{ key: "zendesk", name: "Zendesk", logo: "🎫" },
			{ key: "intercom", name: "Intercom", logo: "💭" },
		],
	},
	{
		key: "crm",
		icon: BarChart3,
		items: [
			{ key: "salesforce", name: "Salesforce", logo: "☁️" },
			{ key: "hubspot", name: "HubSpot", logo: "🟠" },
			{ key: "dynamics", name: "Dynamics 365", logo: "🔷", badge: "native" },
		],
	},
	{
		key: "commerce",
		icon: BarChart3,
		items: [
			{ key: "stripe", name: "Stripe", logo: "💳" },
			{ key: "shopify", name: "Shopify", logo: "🛍️" },
			{ key: "paypal", name: "PayPal", logo: "🅿️" },
			{ key: "woocommerce", name: "WooCommerce", logo: "🛒" },
		],
	},
	{
		key: "developer",
		icon: Code2,
		items: [
			{ key: "github", name: "GitHub", logo: "🐙" },
			{ key: "jira", name: "Jira", logo: "🔵" },
			{ key: "pagerduty", name: "PagerDuty", logo: "🚨" },
			{ key: "webhook", name: "Webhook API", logo: "🔗" },
		],
	},
	{
		key: "ai",
		icon: Bot,
		items: [
			{ key: "azureOpenai", name: "Azure OpenAI", logo: "🤖", badge: "enterprise" },
			{ key: "zapier", name: "Zapier", logo: "⚡" },
			{ key: "powerAutomate", name: "Power Automate", logo: "🔄", badge: "native" },
		],
	},
];

const BADGE_STYLES: Record<BadgeId, string> = {
	native: "text-accent border-accent/40",
	beta: "text-amber-600 border-amber-500/40",
	enterprise: "text-muted-foreground border-border",
};

const PROTOCOL_STEPS = [
	{ key: "connect", step: "01" },
	{ key: "map", step: "02" },
	{ key: "live", step: "03" },
] as const;

const TOTAL_CONNECTORS = CATEGORIES.reduce((n, g) => n + g.items.length, 0);

export default function IntegrationsPage() {
	const { dict, locale, t, num } = useI18n();
	useLocalizedSeo({ ...dict.meta.integrations, path: "/integrations", locale });

	const hero = dict.integrations.hero;
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
								{hero.eyebrow}
								<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							{hero.headline.lead}{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								{hero.headline.highlight}
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">{hero.subhead}</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/auth/signup">
								{hero.cta} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
						</div>
					</div>

					{/* stats — hairline telemetry row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${num(c30)}+`, label: hero.stats.partners },
								{ value: `${num(c6000)}+`, label: hero.stats.automations },
								{ value: t(hero.stats.setupValue, { count: num(c5) }), label: hero.stats.setup },
								{
									value: `${num(c999 / 10, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
									label: hero.stats.reliability,
								},
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

				<HowItWorksBand />
				<RegistrySection />
				<SecurityStrip />

				<DarkCta
					tag={dict.integrations.finalCta.tag}
					headline={
						<>
							{dict.integrations.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.integrations.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.integrations.finalCta.desc}
					primary={{ href: "/contact", label: dict.integrations.finalCta.primary }}
					secondary={{ href: "/help", label: dict.integrations.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

function HowItWorksBand() {
	const { dict } = useI18n();
	const p = dict.integrations.protocol;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white border-b border-border" style={{ background: "var(--pulse-ink)" }}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
				<span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: "var(--pulse-lime)" }}>
					{p.sectionLabel}
				</span>
				<span className="hidden sm:block font-mono text-[11px] tracking-[0.25em] text-white/40">{p.sectionRight}</span>
			</div>

			<div className={`px-6 md:px-12 pt-14 pb-4 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance max-w-3xl">
					{p.headline.lead} <span style={{ color: "var(--pulse-lime)" }}>{p.headline.highlight}</span>
				</h2>
			</div>

			<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10">
				{PROTOCOL_STEPS.map(({ key, step }, i) => (
					<div
						key={step}
						className={`px-6 md:px-12 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 150 + 150}ms` }}>
						<span className="font-mono text-5xl font-black text-white/15 block mb-8">/{step}</span>
						<h3 className="text-xl font-bold mb-3">{p.steps[key].title}</h3>
						<p className="text-sm text-white/50 leading-relaxed">{p.steps[key].desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

function RegistrySection() {
	const { dict, t, num } = useI18n();
	const r = dict.integrations.registry;
	const { ref, inView } = useInView({ threshold: 0.04 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule
				index="02"
				label={r.sectionLabel}
				title={r.sectionTitle}
				right={t(r.sectionRight, { connectors: num(TOTAL_CONNECTORS), categories: num(CATEGORIES.length) })}
			/>
			<div className="h-10" />

			{CATEGORIES.map((group, gi) => {
				const GroupIcon = group.icon;
				const category = dict.integrations.categories[group.key];
				return (
					<div
						key={group.key}
						className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${gi * 60}ms` }}>
						{/* category header row */}
						<div className="flex items-center gap-4 px-6 md:px-12 py-4 border-t border-border">
							<GroupIcon className="size-4 text-accent shrink-0" />
							<span className="font-mono text-[11px] tracking-[0.25em] text-primary font-semibold uppercase">
								CAT_0{gi + 1} / {category.name}
							</span>
							<span className="hidden md:block text-xs text-muted-foreground truncate">{category.description}</span>
							<span className="ml-auto font-mono text-[10px] tracking-widest text-muted-foreground/60 shrink-0">
								{t(r.itemCount, { count: num(group.items.length) })}
							</span>
						</div>

						{/* connector cells */}
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-t border-border">
							{group.items.map((item) => {
								const desc = (category.items as Record<string, string>)[item.key];
								return (
									<div key={item.key} className="group relative bg-background px-6 py-6 flex flex-col">
										<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
										<div className="flex items-start justify-between gap-2 mb-3">
											<div className="flex items-center gap-2.5">
												<span className="text-xl leading-none select-none">{item.logo}</span>
												<h3 className="font-bold text-sm">{item.name}</h3>
											</div>
											{item.badge && (
												<span className={`shrink-0 font-mono text-[9px] tracking-[0.2em] border px-1.5 py-0.5 ${BADGE_STYLES[item.badge]}`}>
													{dict.integrations.badges[item.badge].toUpperCase()}
												</span>
											)}
										</div>
										<p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
										<div className="font-mono text-[10px] tracking-[0.15em] text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4">
											{r.availableOnAllPlans}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</section>
	);
}

function SecurityStrip() {
	const { dict, path } = useI18n();
	const s = dict.integrations.security;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-t border-border">
			<div
				className={`flex flex-col md:flex-row md:items-center gap-5 px-6 md:px-12 py-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				<Shield className="size-6 text-accent shrink-0" />
				<div className="flex-1">
					<p className="font-bold mb-1">{s.title}</p>
					<p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
				</div>
				<a
					href={path("/security")}
					className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-primary hover:text-accent transition-colors shrink-0">
					{s.cta} <ArrowRight className="size-3" />
				</a>
			</div>
		</section>
	);
}
