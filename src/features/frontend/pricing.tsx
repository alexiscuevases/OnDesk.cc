import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, X, Star, Users, Zap, Shield, ChevronDown, Sparkles, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ── Scroll-reveal hook ──
function useInView(options?: IntersectionObserverInit) {
	const ref = useRef<HTMLElement>(null);
	const [inView, setInView] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					obs.disconnect();
				}
			},
			{ threshold: 0.1, ...options },
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);
	return { ref, inView };
}

// ── Section badge ──
function SectionBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
	return (
		<div className="flex justify-center mb-5">
			<span
				className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
				style={{
					background: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
					border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
					color: "var(--color-primary)",
				}}>
				<Icon className="size-3.5" />
				{label}
			</span>
		</div>
	);
}

const PLANS = [
	{
		name: "Starter",
		price: { monthly: "$29", annual: "$23" },
		period: "/mo",
		description: "Perfect for small teams just getting started with structured support.",
		cta: "Start free trial",
		href: "/signup",
		highlight: false,
		features: [
			"Up to 5 agents",
			"1,000 tickets / month",
			"Email & web widget",
			"Basic AI triage",
			"Standard SLA tracking",
			"7-day analytics history",
			"Email support",
		],
		missing: ["Microsoft 365 SSO", "Advanced AI agents", "Custom reporting", "Data residency", "Dedicated CSM"],
	},
	{
		name: "Professional",
		price: { monthly: "$89", annual: "$71" },
		period: "/mo",
		description: "For growing teams that need AI automation and deeper integrations.",
		cta: "Start free trial",
		href: "/signup",
		highlight: true,
		badge: "Most popular",
		features: [
			"Up to 25 agents",
			"10,000 tickets / month",
			"All Starter channels + Teams",
			"Full AI agents (auto-resolve)",
			"Advanced SLA with breach alerts",
			"90-day analytics history",
			"Microsoft 365 SSO",
			"Custom SLA tiers",
			"Priority support (24h SLA)",
		],
		missing: ["Custom reporting", "Data residency", "Dedicated CSM"],
	},
	{
		name: "Enterprise",
		price: { monthly: "Custom", annual: "Custom" },
		period: "",
		description: "Unlimited scale, custom integrations, and white-glove onboarding.",
		cta: "Talk to sales",
		href: "/contact",
		highlight: false,
		features: [
			"Unlimited agents",
			"Unlimited tickets",
			"All Professional features",
			"Custom AI workflows",
			"Advanced analytics & reporting",
			"Data residency (US/EU/APAC)",
			"Customer-managed encryption",
			"Dedicated Customer Success Manager",
			"Custom SLAs & contracts",
			"SSO & SAML",
		],
		missing: [],
	},
];

const LOGOS = ["Contoso", "Fabrikam", "Northwind", "Tailwind", "Adventure Works", "Wingtip"];

const TESTIMONIALS = [
	{
		quote: "We evaluated six tools. SupportDesk 365 was the only one that had a real Microsoft Teams native experience — not just a webhook.",
		author: "Marcus Rivera",
		role: "IT Director",
		company: "Fabrikam Inc.",
		plan: "Professional",
	},
	{
		quote: "Went from 22 agents to 9 handling the same volume. The ROI paid for three years of Enterprise in the first quarter.",
		author: "Priya Patel",
		role: "VP Operations",
		company: "Northwind Traders",
		plan: "Enterprise",
	},
];

const FAQ = [
	{
		q: "Can I change plans later?",
		a: "Yes. Upgrades take effect immediately; downgrades apply at the next billing cycle. There are no lock-in fees.",
	},
	{
		q: "What counts as a ticket?",
		a: "Each unique inbound conversation — regardless of channel — counts as one ticket. Follow-up messages in the same thread do not.",
	},
	{
		q: "Is there a free trial?",
		a: "All paid plans include a 14-day free trial with full feature access. No credit card required to start.",
	},
	{
		q: "Do you offer discounts for non-profits?",
		a: "Yes — contact us for our non-profit and education pricing. We offer up to 40% off for qualifying organizations.",
	},
	{
		q: "Where is our data stored?",
		a: "Starter and Professional data is stored in the US by default. Enterprise customers choose their region: US, EU, or APAC.",
	},
	{
		q: "What happens when I exceed my ticket limit?",
		a: "You get an in-app alert at 80% usage. If you exceed the limit you can upgrade, purchase an overage pack, or tickets queue until the next billing cycle.",
	},
];

const COMPARE_ROWS = [
	{ feature: "Agents included", starter: "5", pro: "25", enterprise: "Unlimited" },
	{ feature: "Tickets / month", starter: "1,000", pro: "10,000", enterprise: "Unlimited" },
	{ feature: "AI auto-resolve", starter: "Basic", pro: "Full", enterprise: "Custom" },
	{ feature: "Microsoft 365 SSO", starter: false, pro: true, enterprise: true },
	{ feature: "SLA breach alerts", starter: false, pro: true, enterprise: true },
	{ feature: "Custom AI workflows", starter: false, pro: false, enterprise: true },
	{ feature: "Data residency", starter: false, pro: false, enterprise: true },
	{ feature: "Dedicated CSM", starter: false, pro: false, enterprise: true },
	{ feature: "Support SLA", starter: "Email", pro: "24-hour", enterprise: "Custom" },
];

export default function PricingPage() {
	const [annual, setAnnual] = useState(false);
	const [visible, setVisible] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

	useEffect(() => {
		const id = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);

	useEffect(() => {
		const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, []);

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
						className="absolute inset-0 opacity-[0.025]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
					/>
				</div>

				<div className="container mx-auto px-4 text-center relative">
					<div className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
						<SectionBadge icon={Zap} label="14-day free trial — no credit card required" />
						<h1 className="text-5xl md:text-[5rem] font-black mb-5 text-balance tracking-tight" style={{ lineHeight: 1.04 }}>
							Simple,{" "}
							<span
								style={{
									background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}>
								transparent pricing
							</span>
						</h1>
						<p
							className={`text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty mb-10 transition-all duration-1000 delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							Start free for 14 days, then choose the plan that fits your team. No hidden fees, no per-ticket surprises.
						</p>

						{/* Billing toggle */}
						<div
							className={`inline-flex items-center gap-1 p-1.5 rounded-full border transition-all duration-1000 delay-250 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
							<button
								onClick={() => setAnnual(false)}
								className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${!annual ? "text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
								style={!annual ? { background: "var(--color-primary)" } : {}}>
								Monthly
							</button>
							<button
								onClick={() => setAnnual(true)}
								className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${annual ? "text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
								style={annual ? { background: "var(--color-primary)" } : {}}>
								Annual
								<span
									className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-300 ${annual ? "bg-white/20 text-white" : "bg-green-500/15 text-green-600"}`}>
									Save 20%
								</span>
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* ── PLANS ── */}
			<PlansSection annual={annual} />

			{/* ── SOCIAL PROOF ── */}
			<SocialProofSection />

			{/* ── COMPARISON TABLE ── */}
			<CompareSection />

			{/* ── FAQ ── */}
			<FaqSection />

			{/* ── FINAL CTA ── */}
			<PricingCtaSection />
		</SiteLayout>
	);
}

// ── Plans section ──
function PlansSection({ annual }: { annual: boolean }) {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-20 md:py-24">
			<div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
				{PLANS.map((plan, i) => (
					<div
						key={plan.name}
						className={`relative rounded-2xl flex flex-col gap-6 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
						style={{ transitionDelay: `${i * 120}ms` }}>
						{/* Card shell */}
						<div
							className={`relative flex flex-col gap-6 p-8 rounded-2xl border h-full transition-all duration-300 hover:-translate-y-1 ${plan.highlight ? "hover:shadow-2xl" : "hover:shadow-xl"}`}
							style={
								plan.highlight
									? {
										background:
											"linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 8%, var(--color-card)), var(--color-card))",
										borderColor: "color-mix(in srgb, var(--color-primary) 50%, transparent)",
										boxShadow:
											"0 24px 60px -12px color-mix(in srgb, var(--color-primary) 20%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)",
									}
									: {
										background: "var(--color-card)",
										borderColor: "var(--color-border)",
										boxShadow: "0 4px 20px -4px rgba(0,0,0,0.06)",
									}
							}>
							{/* Glow for highlighted plan */}
							{plan.highlight && (
								<div
									className="absolute inset-0 rounded-2xl pointer-events-none"
									style={{
										background:
											"radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 65%)",
									}}
								/>
							)}

							{/* Popular badge */}
							{plan.highlight && plan.badge && (
								<span
									className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg"
									style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
									<Sparkles className="size-3" />
									{plan.badge}
								</span>
							)}

							{/* Plan name + desc */}
							<div className="relative z-10">
								<h3 className="text-xl font-black mb-1.5">{plan.name}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
							</div>

							{/* Price */}
							<div className="relative z-10">
								<div className="flex items-end gap-1.5">
									<span
										className="text-5xl font-black tabular-nums transition-all duration-500"
										style={plan.highlight ? { color: "var(--color-primary)" } : {}}>
										{annual ? plan.price.annual : plan.price.monthly}
									</span>
									{plan.period && <span className="text-muted-foreground mb-1.5 text-lg">{plan.period}</span>}
								</div>
								{annual && plan.price.annual !== "Custom" && (
									<p className="text-xs text-green-600 font-semibold mt-1">Billed annually — you save 20%</p>
								)}
							</div>

							{/* CTA */}
							<div className="relative z-10">
								<Button
									size="lg"
									asChild
									variant={plan.highlight ? "default" : "outline"}
									className={`group h-12 w-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${plan.highlight ? "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40" : "hover:border-primary/50 hover:bg-primary/5"}`}>
									<a href={plan.href}>
										{plan.cta}
										<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
									</a>
								</Button>
							</div>

							{/* Feature list */}
							<ul className="space-y-2.5 relative z-10">
								{plan.features.map((f) => (
									<li key={f} className="flex items-start gap-2.5 text-sm group/item">
										<div
											className="size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover/item:scale-110"
											style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
											<CheckCircle2 className="size-3 text-primary" />
										</div>
										<span className="text-foreground/85 group-hover/item:text-foreground transition-colors">{f}</span>
									</li>
								))}
								{plan.missing.map((f) => (
									<li key={f} className="flex items-start gap-2.5 text-sm opacity-35">
										<X className="size-5 shrink-0 mt-0.5 text-muted-foreground" />
										<span>{f}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				))}
			</div>

			{/* Trust row */}
			<div
				className={`flex flex-wrap justify-center gap-8 mt-14 text-sm text-muted-foreground transition-all duration-700 delay-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
				{[
					{ icon: Shield, text: "SOC 2 Type II certified" },
					{ icon: Zap, text: "99.97% uptime SLA" },
					{ icon: Users, text: "1,200+ customers" },
					{ icon: Star, text: "4.9 / 5 average rating" },
				].map(({ icon: Icon, text }) => (
					<span key={text} className="flex items-center gap-2 transition-colors hover:text-foreground cursor-default">
						<Icon className="size-4 text-primary" />
						{text}
					</span>
				))}
			</div>
		</section>
	);
}

// ── Social proof ──
function SocialProofSection() {
	const { ref, inView } = useInView();
	return (
		<section
			ref={ref}
			className="border-y border-border py-20 relative overflow-hidden"
			style={{ background: "color-mix(in srgb, var(--color-muted) 15%, transparent)" }}>
			<div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full blur-[120px] pointer-events-none"
				style={{ background: "color-mix(in srgb, var(--color-primary) 5%, transparent)" }}
			/>
			<div className="container mx-auto px-4 relative">
				{/* Logo strip */}
				<div className={`text-center mb-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-6">Trusted by teams at</p>
					<div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
						{LOGOS.map((l, i) => (
							<span
								key={l}
								className={`text-muted-foreground/40 font-bold text-sm tracking-wide hover:text-muted-foreground transition-all duration-500 cursor-default select-none ${inView ? "opacity-100" : "opacity-0"}`}
								style={{ transitionDelay: `${i * 60}ms` }}>
								{l}
							</span>
						))}
					</div>
				</div>

				{/* Testimonial cards */}
				<div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
					{TESTIMONIALS.map(({ quote, author, role, company, plan }, i) => (
						<div
							key={author}
							className={`group relative flex flex-col gap-4 p-7 rounded-2xl border overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{
								background: "var(--color-card)",
								borderColor: "var(--color-border)",
								transitionDelay: `${i * 120}ms`,
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

							<div className="flex gap-1 relative z-10">
								{Array.from({ length: 5 }).map((_, idx) => (
									<Star key={idx} className="size-4 fill-primary text-primary" />
								))}
							</div>
							<blockquote className="text-sm text-foreground leading-relaxed flex-1 relative z-10">"{quote}"</blockquote>
							<div className="flex items-center justify-between pt-4 border-t border-border relative z-10">
								<div>
									<p className="text-sm font-bold">{author}</p>
									<p className="text-xs text-muted-foreground mt-0.5">
										{role}, {company}
									</p>
								</div>
								<span
									className="text-xs px-2.5 py-1 rounded-full font-semibold"
									style={{
										background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
										color: "var(--color-primary)",
										border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
									}}>
									{plan} plan
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ── Comparison table ──
function CompareSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-20 md:py-28">
			<div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<SectionBadge icon={TrendingUp} label="Plan comparison" />
				<h2 className="text-3xl md:text-5xl font-black text-balance tracking-tight">Compare plans side by side</h2>
			</div>

			<div
				className={`max-w-4xl mx-auto rounded-2xl border overflow-hidden transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
				style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "0 8px 40px -8px rgba(0,0,0,0.08)" }}>
				{/* Header */}
				<div className="grid grid-cols-4 divide-x divide-border" style={{ background: "color-mix(in srgb, var(--color-muted) 30%, transparent)" }}>
					<div className="p-5 text-sm font-bold text-muted-foreground">Feature</div>
					{["Starter", "Professional", "Enterprise"].map((p) => (
						<div key={p} className="p-5 text-sm font-black text-center" style={p === "Professional" ? { color: "var(--color-primary)" } : {}}>
							{p}
						</div>
					))}
				</div>
				{/* Rows */}
				<div className="divide-y divide-border">
					{COMPARE_ROWS.map(({ feature, starter, pro, enterprise }, rowIdx) => (
						<div
							key={feature}
							className="grid grid-cols-4 divide-x divide-border transition-colors duration-200 hover:bg-primary/3"
							style={{ transitionDelay: `${rowIdx * 30}ms` }}>
							<div className="px-5 py-3.5 text-sm text-muted-foreground font-medium">{feature}</div>
							{([starter, pro, enterprise] as (string | boolean)[]).map((val, i) => (
								<div key={i} className="px-5 py-3.5 text-sm text-center flex items-center justify-center">
									{typeof val === "boolean" ? (
										val ? (
											<div
												className="size-6 rounded-full flex items-center justify-center"
												style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
												<CheckCircle2 className="size-3.5 text-primary" />
											</div>
										) : (
											<X className="size-4 opacity-25" />
										)
									) : (
										<span className={`text-sm ${i === 1 ? "font-bold" : ""}`} style={i === 1 ? { color: "var(--color-primary)" } : {}}>
											{val}
										</span>
									)}
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ── FAQ ──
function FaqSection() {
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="border-y border-border py-20" style={{ background: "color-mix(in srgb, var(--color-muted) 12%, transparent)" }}>
			<div className="container mx-auto px-4 max-w-2xl">
				<div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<SectionBadge icon={ChevronDown} label="FAQ" />
					<h2 className="text-3xl md:text-4xl font-black text-balance tracking-tight">Frequently asked questions</h2>
				</div>
				<div className="space-y-3">
					{FAQ.map(({ q, a }, i) => {
						const isOpen = openFaq === i;
						return (
							<div
								key={q}
								className={`rounded-2xl border overflow-hidden transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{
									borderColor: isOpen ? "color-mix(in srgb, var(--color-primary) 35%, transparent)" : "var(--color-border)",
									background: "var(--color-card)",
									boxShadow: isOpen ? "0 4px 24px -4px color-mix(in srgb, var(--color-primary) 12%, transparent)" : "none",
									transitionDelay: `${i * 60}ms`,
								}}>
								<button
									onClick={() => setOpenFaq(isOpen ? null : i)}
									className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left text-sm font-bold hover:bg-primary/4 transition-colors duration-200">
									<span>{q}</span>
									<div
										className="size-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
										style={{
											background: isOpen ? "var(--color-primary)" : "color-mix(in srgb, var(--color-muted) 60%, transparent)",
											transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
										}}>
										<ChevronDown
											className="size-3.5"
											style={{ color: isOpen ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)" }}
										/>
									</div>
								</button>
								<div className="overflow-hidden transition-all duration-400" style={{ maxHeight: isOpen ? "200px" : "0px" }}>
									<p className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border">{a}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

// ── Final CTA ──
function PricingCtaSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-24">
			<div
				className={`relative max-w-5xl mx-auto rounded-3xl overflow-hidden p-12 md:p-20 text-center transition-all duration-1000 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
				style={{
					background: "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 75%, var(--color-accent)) 100%)",
					boxShadow: "0 40px 100px -20px color-mix(in srgb, var(--color-primary) 40%, transparent)",
				}}>
				{/* Grid overlay */}
				<div
					className="absolute inset-0 opacity-[0.07] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
				/>
				<div className="absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

				<div className="relative z-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-sm font-medium text-white mb-8">
						<Sparkles className="size-3.5" /> Still have questions?
					</div>
					<h2 className="text-4xl md:text-6xl font-black mb-5 text-white text-balance tracking-tight">Talk to our team</h2>
					<p className="text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
						We'll walk you through the right plan for your team size and support volume. No pressure, no sales scripts.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Button
							size="lg"
							asChild
							className="group h-13 px-8 text-base bg-white hover:bg-white/90 hover:-translate-y-0.5 transition-all duration-300"
							style={{ color: "var(--color-primary)" }}>
							<a href="/contact">
								Talk to sales
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button
							size="lg"
							variant="outline"
							asChild
							className="h-13 px-8 text-base text-white border-white/35 hover:bg-white/10 hover:border-white/60 hover:-translate-y-0.5 transition-all duration-300">
							<a href="/auth/signup">Start free trial</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
