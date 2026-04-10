import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, useMouseGlow, SectionBadge, GradientText, CtaDecorations } from "./shared";
import { Button } from "@/components/ui/button";
import {
	ArrowRight,
	Bot,
	Zap,
	Users,
	MessageSquare,
	CheckCircle2,
	Star,
	ChevronRight,
	Ticket,
	Clock,
	TrendingUp,
	Sparkles,
	Play,
	Shield,
	Globe,
	Puzzle,
	Layers,
	UserCheck,
	Building2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ─── types ───────────────────────────────────────────────────────────────────

interface LiveTicket {
	id: string;
	title: string;
	priority: "high" | "medium" | "low";
	status: "open" | "ai-resolving" | "resolved";
	time: string;
	agent: string;
}

// ─── data ────────────────────────────────────────────────────────────────────

const PERSONAS = [
	{
		icon: Users,
		label: "Support Teams",
		href: "/solutions/support-teams",
		desc: "Manage high-volume queues with automation, routing, and real-time analytics.",
	},
	{
		icon: Building2,
		label: "Agencies",
		href: "/solutions/agencies",
		desc: "Run support for multiple clients from a single, organized workspace.",
	},
	{
		icon: UserCheck,
		label: "Solo & Small Teams",
		href: "/solutions/solo-small-teams",
		desc: "Keep every request organized without the complexity. Set up in minutes.",
	},
];

const FEATURES = [
	{
		id: "unification",
		icon: Layers,
		label: "Unification",
		title: "All your channels, one place",
		description: "Email, chat, web widgets — everything lands in a single inbox. No more tab-switching, no more missed messages.",
		bullets: ["Unified inbox for every channel", "Multi-source sync", "Consistent experience everywhere"],
	},
	{
		id: "automation",
		icon: Bot,
		label: "Automation",
		title: "Classify, route, and resolve automatically",
		description: "Pulse handles the heavy lifting. AI intelligently triages incoming tickets, routes them to the right place, and resolves the common ones — instantly.",
		bullets: ["Smart AI classification", "Dynamic routing rules", "End-to-end auto-resolution"],
	},
	{
		id: "marketplace",
		icon: Puzzle,
		label: "Marketplace",
		title: "Extend with the tools you already use",
		description: "Connect your CRM, billing system, or any tool you rely on. A growing ecosystem of integrations, built to fit your workflow.",
		bullets: ["One-click integrations", "Custom app ecosystem", "Extensible API"],
	},
	{
		id: "platform",
		icon: Users,
		label: "Platform",
		title: "Manage people, queues, and workflows",
		description: "Whether it's one person or a hundred, Pulse gives you the controls to stay organized, balance load, and understand what's happening.",
		bullets: ["Team & workload balancing", "Advanced workflow builder", "Performance analytics"],
	},
];

const TESTIMONIALS = [
	{
		quote: "Unifying our channels through Pulse reduced resolution time by 70%. Our team finally has breathing room.",
		author: "Sarah Chen",
		role: "Head of Customer Success",
		company: "Contoso Ltd.",
		segment: "Support Teams",
		rating: 5,
	},
	{
		quote: "Managing 8 clients used to mean 8 different tools. Pulse collapsed it into one. Our clients are happier and we win new business because of how we report on it.",
		author: "James Okafor",
		role: "Operations Lead",
		company: "BrightSupport Agency",
		segment: "Agencies",
		rating: 5,
	},
	{
		quote: "I run support solo for three SaaS products. Pulse is the first tool that didn't feel like it was built for a 50-person team. Setup took 10 minutes.",
		author: "Mia Torres",
		role: "Independent Consultant",
		company: "Torres Digital",
		segment: "Solo & Small Teams",
		rating: 5,
	},
];

const COMPANIES = ["Contoso", "Fabrikam", "Northwind", "Tailwind", "Litware", "Wingtip", "Proseware", "Adventure Works"];

const INITIAL_TICKETS: LiveTicket[] = [
	{ id: "#4821", title: "Invoice not received after payment", priority: "high", status: "ai-resolving", time: "0s ago", agent: "AI Agent" },
	{ id: "#4820", title: "Onboarding support — Acme Inc.", priority: "medium", status: "resolved", time: "42s ago", agent: "AI Agent" },
	{ id: "#4819", title: "Feature request: dark mode toggle", priority: "low", status: "resolved", time: "1m ago", agent: "AI Agent" },
	{ id: "#4818", title: "Can't access my account dashboard", priority: "high", status: "open", time: "2m ago", agent: "Unassigned" },
];

const NEW_TICKETS: LiveTicket[] = [
	{ id: "#4825", title: "Refund request — order #8812", priority: "medium", status: "ai-resolving", time: "just now", agent: "AI Agent" },
	{ id: "#4824", title: "Password reset email not arriving", priority: "low", status: "ai-resolving", time: "just now", agent: "AI Agent" },
	{ id: "#4823", title: "Urgent: client site unreachable", priority: "high", status: "open", time: "just now", agent: "Unassigned" },
];

const PRIORITY_COLORS = {
	high: "bg-destructive/15 text-destructive border-destructive/30",
	medium: "bg-warning/15 text-warning border-warning/30",
	low: "bg-success/15 text-success border-success/30",
};

const STATUS_COLORS = {
	open: "text-muted-foreground",
	"ai-resolving": "text-primary",
	resolved: "text-success",
};

// ─── component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
	const mousePos = useMouseGlow();
	const visible = useMountVisible();
	const [activePersona, setActivePersona] = useState(0);
	const [activeFeature, setActiveFeature] = useState(0);
	const [activeTestimonial, setActiveTestimonial] = useState(0);
	const [tickets, setTickets] = useState<LiveTicket[]>(INITIAL_TICKETS);
	const [ticketIdx, setTicketIdx] = useState(0);
	const heroRef = useRef<HTMLDivElement>(null);

	const statsSection = useInView();
	const statsActive = statsSection.inView;
	const c80 = useCounter(80, 1200, statsActive);
	const c50 = useCounter(50, 1400, statsActive);
	const c95 = useCounter(95, 1300, statsActive);

	// Live ticket feed
	useEffect(() => {
		const iv = setInterval(() => {
			if (ticketIdx < NEW_TICKETS.length) {
				setTickets((prev) => [NEW_TICKETS[ticketIdx], ...prev.slice(0, 3)]);
				setTicketIdx((i) => i + 1);
			}
		}, 3200);
		return () => clearInterval(iv);
	}, [ticketIdx]);

	// Auto-rotate testimonials
	useEffect(() => {
		const iv = setInterval(() => setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length), 5000);
		return () => clearInterval(iv);
	}, []);

	const feat = FEATURES[activeFeature];
	const FeatIcon = feat.icon;

	return (
		<SiteLayout>
			{/* ── HERO ── */}
			<section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden">
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-0 bg-linear-to-br from-primary/8 via-background to-accent/5" />
					<div
						className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[100px] transition-all duration-700 ease-out"
						style={{ left: mousePos.x, top: mousePos.y }}
					/>
					<div className="absolute top-20 right-[15%] size-72 rounded-full bg-accent/10 blur-[80px] animate-pulse" style={{ animationDuration: "6s" }} />
					<div className="absolute bottom-10 left-[10%] size-56 rounded-full bg-primary/8 blur-[70px] animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
					<div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
				</div>

				<div className="container mx-auto px-4">
					<div
						ref={heroRef}
						className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>

						{/* Top badge */}
						<div className="flex justify-center mb-8">
							<span
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
								style={{
									background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, transparent), color-mix(in srgb, var(--color-accent) 5%, transparent))",
									borderColor: "color-mix(in srgb, var(--color-primary) 25%, transparent)",
									color: "var(--color-primary)",
								}}>
								<Sparkles className="size-3.5 animate-pulse" style={{ animationDuration: "2s" }} />
								AI-powered support for every kind of business
								<ChevronRight className="size-3.5" />
							</span>
						</div>

						{/* Headline */}
						<h1 className="text-5xl md:text-[5rem] font-black leading-[1.02] tracking-tight text-balance mb-8">
							Support at the <GradientText>speed of AI</GradientText>
						</h1>

						{/* Persona switcher */}
						<div
							className={`flex flex-wrap justify-center gap-2 mb-6 transition-all duration-1000 delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
							{PERSONAS.map(({ label, icon: Icon }, i) => {
								const isActive = activePersona === i;
								return (
									<button
										key={label}
										onClick={() => setActivePersona(i)}
										className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${isActive ? "text-primary-foreground border-primary shadow-md shadow-primary/25 scale-105" : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`}
										style={isActive ? { background: "var(--color-primary)" } : {}}>
										<Icon className="size-3.5" />
										{label}
									</button>
								);
							})}
						</div>

						{/* Dynamic subheadline */}
						<div className={`transition-all duration-1000 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-3 transition-all duration-300">
								{PERSONAS[activePersona].desc}
							</p>
							<a
								href={PERSONAS[activePersona].href}
								className="inline-flex items-center gap-1 text-sm font-medium transition-colors duration-200 mb-10"
								style={{ color: "var(--color-primary)" }}
								onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
								onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
								See how Pulse works for {PERSONAS[activePersona].label.toLowerCase()}
								<ArrowRight className="size-3.5" />
							</a>
						</div>

						{/* CTAs */}
						<div className={`flex flex-col sm:flex-row justify-center gap-3 mb-16 transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
							<Button size="xl" asChild className="group relative overflow-hidden">
								<a href="/auth/signup">
									<span className="relative z-10 flex items-center gap-2">
										Start free — 14 days
										<ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-200" />
									</span>
								</a>
							</Button>
							<Button size="xl" variant="outline" asChild className="group">
								<a href="/pricing">
									<Play className="mr-2 size-4 group-hover:scale-110 transition-transform" />
									See pricing
								</a>
							</Button>
						</div>

						{/* Live ticket feed */}
						<div
							className={`max-w-2xl mx-auto rounded-2xl border overflow-hidden transition-all duration-1000 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{
								background: "color-mix(in srgb, var(--color-card) 85%, transparent)",
								borderColor: "color-mix(in srgb, var(--color-border) 80%, var(--color-primary) 20%)",
								boxShadow: "0 20px 60px -10px color-mix(in srgb, var(--color-primary) 15%, transparent), 0 4px 20px -4px rgba(0,0,0,0.08)",
								backdropFilter: "blur(16px)",
							}}>
							<div
								className="flex items-center gap-2 px-4 py-3 border-b"
								style={{ background: "color-mix(in srgb, var(--color-muted) 40%, transparent)", borderColor: "var(--color-border)" }}>
								<span className="size-3 rounded-full bg-red-400/70" />
								<span className="size-3 rounded-full bg-yellow-400/70" />
								<span className="size-3 rounded-full bg-green-400/70" />
								<span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
									<span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
									Live ticket feed
								</span>
							</div>
							<div className="divide-y divide-border">
								{tickets.map((t, i) => (
									<div
										key={t.id + i}
										className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-500 ${i === 0 ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""}`}
										style={i === 0 ? { background: "color-mix(in srgb, var(--color-primary) 4%, transparent)" } : {}}>
										<Ticket className="size-4 shrink-0 text-muted-foreground" />
										<span className="font-mono text-xs text-muted-foreground w-12 shrink-0">{t.id}</span>
										<span className="flex-1 truncate text-foreground/90">{t.title}</span>
										<span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${PRIORITY_COLORS[t.priority]}`}>
											{t.priority}
										</span>
										<span className={`text-xs font-medium shrink-0 ${STATUS_COLORS[t.status]}`}>
											{t.status === "ai-resolving" ? "⚡ AI resolving" : t.status === "resolved" ? "✓ Resolved" : "Open"}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── LOGOS MARQUEE ── */}
			<div
				className="relative overflow-hidden border-y border-border py-7"
				style={{ background: "color-mix(in srgb, var(--color-muted) 20%, transparent)" }}>
				<p className="text-center text-xs text-muted-foreground mb-5 tracking-[0.2em] uppercase font-medium">
					Trusted by teams, agencies, and freelancers worldwide
				</p>
				<div className="flex gap-14 animate-marquee whitespace-nowrap">
					{[...COMPANIES, ...COMPANIES].map((c, i) => (
						<span
							key={i}
							className="text-muted-foreground/40 font-bold text-sm tracking-wide hover:text-muted-foreground transition-colors duration-300 cursor-default shrink-0 select-none">
							{c}
						</span>
					))}
				</div>
				<div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-background to-transparent pointer-events-none" />
				<div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-background to-transparent pointer-events-none" />
			</div>

			{/* ── STATS ── */}
			<section ref={statsSection.ref as React.RefObject<HTMLElement>} className="container mx-auto px-4 py-20">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
					{[
						{ value: c80, suffix: "%", label: "Faster resolution", icon: Clock, delay: 0 },
						{ value: c50, suffix: "K+", label: "Tickets handled / month", icon: Ticket, delay: 100 },
						{ value: c95, suffix: "%", label: "Customer satisfaction", icon: Star, delay: 200 },
						{ value: null, display: "1 → ∞", label: "Solo to enterprise", icon: UserCheck, delay: 300 },
					].map(({ value, suffix, display, label, icon: Icon, delay }) => (
						<div
							key={label}
							className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-8 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lg cursor-default ${statsActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
							style={{ background: "var(--color-card)", borderColor: "var(--color-border)", transitionDelay: `${delay}ms`, boxShadow: "0 2px 12px -4px rgba(0,0,0,0.06)" }}>
							<div
								className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
								style={{ background: "radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)" }}
							/>
							<Icon className="size-5 text-primary mb-1 group-hover:scale-110 transition-transform duration-300 relative z-10" />
							<div className="text-4xl font-black relative z-10" style={{ fontVariantNumeric: "tabular-nums" }}>
								{display ?? `${value}${suffix}`}
							</div>
							<div className="text-sm text-muted-foreground text-center relative z-10">{label}</div>
						</div>
					))}
				</div>
			</section>

			{/* ── INTERACTIVE FEATURES ── */}
			<section id="features" className="container mx-auto px-4 py-20 md:py-28">
				<div className="text-center mb-14">
					<SectionBadge icon={Sparkles} label="Platform" />
					<h2 className="text-3xl md:text-5xl font-black mb-4 text-balance tracking-tight">Built for how you actually work</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">Click any tab to explore what makes Pulse different.</p>
				</div>

				<div className="flex flex-wrap justify-center gap-2 mb-12">
					{FEATURES.map((f, i) => {
						const Icon = f.icon;
						const isActive = activeFeature === i;
						return (
							<button
								key={f.id}
								onClick={() => setActiveFeature(i)}
								className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 overflow-hidden ${isActive ? "text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105" : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:scale-102"}`}
								style={isActive ? { background: "var(--color-primary)" } : {}}>
								{isActive && (
									<span className="absolute inset-0 animate-pulse rounded-full" style={{ background: "color-mix(in srgb, var(--color-primary) 30%, transparent)" }} />
								)}
								<Icon className="size-4 relative z-10" />
								<span className="relative z-10">{f.label}</span>
							</button>
						);
					})}
				</div>

				<div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
					<div className="order-2 md:order-1 space-y-5 animate-in fade-in slide-in-from-left-6 duration-500" key={feat.id}>
						<div
							className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
							style={{
								background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
								border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
								color: "var(--color-primary)",
							}}>
							<FeatIcon className="size-3.5" />
							{feat.label}
						</div>
						<h3 className="text-3xl md:text-4xl font-black text-balance leading-snug tracking-tight">{feat.title}</h3>
						<p className="text-muted-foreground leading-relaxed text-lg">{feat.description}</p>
						<ul className="space-y-3">
							{feat.bullets.map((b) => (
								<li key={b} className="flex items-center gap-3 text-sm group/bullet">
									<div
										className="size-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 group-hover/bullet:scale-110"
										style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
										<CheckCircle2 className="size-3 text-primary" />
									</div>
									<span className="group-hover/bullet:text-foreground transition-colors text-muted-foreground">{b}</span>
								</li>
							))}
						</ul>
						<Button asChild className="group mt-2">
							<a href="/auth/signup">
								Try {feat.label} free
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
					</div>

					<div className="order-1 md:order-2" key={feat.id + "-visual"}>
						<div
							className="animate-in fade-in zoom-in-95 duration-500 rounded-2xl p-6"
							style={{
								background: "color-mix(in srgb, var(--color-card) 90%, transparent)",
								border: "1px solid color-mix(in srgb, var(--color-border) 80%, var(--color-primary) 20%)",
								boxShadow: "0 24px 64px -12px color-mix(in srgb, var(--color-primary) 12%, transparent), 0 4px 20px -4px rgba(0,0,0,0.06)",
								backdropFilter: "blur(8px)",
							}}>
							{feat.id === "unification" && <WidgetVisual />}
							{feat.id === "automation" && <AIAgentVisual />}
							{feat.id === "marketplace" && <MarketplaceVisual />}
							{feat.id === "platform" && <TeamsVisual />}
						</div>
					</div>
				</div>
			</section>

			{/* ── TESTIMONIALS ── */}
			<TestimonialsSection activeTestimonial={activeTestimonial} setActiveTestimonial={setActiveTestimonial} />

			{/* ── HOW IT WORKS ── */}
			<HowItWorksSection />

			{/* ── TRUST BADGES ── */}
			<TrustSection />

			{/* ── CTA ── */}
			<CtaSection />
		</SiteLayout>
	);
}

// ── HELPER COMPONENTS ──────────────────────────────────────────────────────────

function TestimonialsSection({ activeTestimonial, setActiveTestimonial }: { activeTestimonial: number; setActiveTestimonial: (i: number) => void }) {
	const { ref, inView } = useInView();
	return (
		<section
			ref={ref}
			className="py-24 md:py-32 border-y border-border relative overflow-hidden"
			style={{ background: "color-mix(in srgb, var(--color-muted) 15%, transparent)" }}>
			<div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full blur-[120px] pointer-events-none"
				style={{ background: "color-mix(in srgb, var(--color-primary) 6%, transparent)" }}
			/>
			<div className="container mx-auto px-4 relative">
				<div className={`text-center mb-14 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<SectionBadge icon={Star} label="Testimonials" />
					<h2 className="text-3xl md:text-5xl font-black mb-3 text-balance tracking-tight">What our users are saying</h2>
					<p className="text-muted-foreground">Teams, agencies, and solo operators — all finding their fit.</p>
				</div>
				<div className={`max-w-3xl mx-auto transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<div
						className="relative rounded-3xl p-8 md:p-12 text-center overflow-hidden"
						style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", boxShadow: "0 20px 60px -12px rgba(0,0,0,0.08)" }}>
						<div className="relative min-h-44">
							{TESTIMONIALS.map((t, i) => (
								<div
									key={i}
									className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${i === activeTestimonial ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-98 pointer-events-none"}`}>
									{/* Segment pill */}
									<span
										className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
										style={{
											background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
											color: "var(--color-primary)",
											border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
										}}>
										{t.segment}
									</span>
									<div className="flex gap-1 mb-5">
										{Array.from({ length: t.rating }).map((_, s) => (
											<Star key={s} className="size-5 fill-primary text-primary" />
										))}
									</div>
									<blockquote className="text-xl md:text-2xl font-semibold text-foreground mb-6 text-balance leading-snug">
										"{t.quote}"
									</blockquote>
									<p className="text-sm text-muted-foreground">
										<span className="font-bold text-foreground">{t.author}</span> · {t.role}, {t.company}
									</p>
								</div>
							))}
						</div>
					</div>
					<div className="flex justify-center gap-2 mt-6">
						{TESTIMONIALS.map((_, i) => (
							<button
								key={i}
								onClick={() => setActiveTestimonial(i)}
								className={`rounded-full transition-all duration-300 ${i === activeTestimonial ? "w-8 h-2.5 bg-primary" : "size-2.5 bg-border hover:bg-muted-foreground"}`}
								aria-label={`Testimonial ${i + 1}`}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function HowItWorksSection() {
	const { ref, inView } = useInView();
	const steps = [
		{ step: "01", title: "Connect your channels", desc: "Bring every conversation into one place — email, chat, forms. Takes minutes, not days.", icon: Layers },
		{ step: "02", title: "Let AI do the sorting", desc: "Pulse classifies, prioritizes, and routes every request automatically. No manual triage.", icon: Bot },
		{ step: "03", title: "Resolve faster", desc: "Your team focuses on what actually needs a human. Everything else gets handled.", icon: Sparkles },
	];
	return (
		<section ref={ref} className="container mx-auto px-4 py-24 md:py-32">
			<div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<SectionBadge icon={Zap} label="How it works" />
				<h2 className="text-3xl md:text-5xl font-black mb-4 text-balance tracking-tight">From request to resolved — in seconds</h2>
				<p className="text-xl text-muted-foreground">Three steps. Works for any size.</p>
			</div>
			<div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
				{steps.map(({ step, title, desc, icon: Icon }, i) => (
					<div
						key={step}
						className={`relative group transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
						style={{ transitionDelay: `${i * 120 + 200}ms` }}>
						{i < 2 && (
							<div
								className="hidden md:block absolute top-10 left-full h-px z-0 bg-linear-to-r from-border to-transparent"
								style={{ width: "calc(100% - 1.5rem)", transform: "translateX(0.75rem)" }}
							/>
						)}
						<div
							className="relative z-10 flex flex-col gap-4 p-7 rounded-2xl border transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl overflow-hidden"
							style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "0 2px 16px -4px rgba(0,0,0,0.06)" }}>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 70%)" }}
							/>
							<div className="flex items-center justify-between relative z-10">
								<div
									className="size-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
									style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
									<Icon className="size-6 text-primary" />
								</div>
								<span className="text-5xl font-black" style={{ color: "color-mix(in srgb, var(--color-muted-foreground) 15%, transparent)" }}>
									{step}
								</span>
							</div>
							<h3 className="text-lg font-bold relative z-10">{title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed relative z-10">{desc}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function TrustSection() {
	const { ref, inView } = useInView();
	const items = [
		{ icon: Zap, title: "Setup in 5 minutes", desc: "No IT team required. Connect your channels and you're live." },
		{ icon: Shield, title: "SOC 2 & GDPR", desc: "Enterprise-grade security and data privacy built in." },
		{ icon: Globe, title: "99.9% Uptime SLA", desc: "Reliable for solo operators and large teams alike." },
		{ icon: UserCheck, title: "Works for 1 or 1,000", desc: "From a single freelancer to a global support org." },
	];
	return (
		<section
			ref={ref}
			className="border-y border-border py-16"
			style={{ background: "color-mix(in srgb, var(--color-primary) 3%, var(--color-background))" }}>
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
					{items.map(({ icon: Icon, title, desc }, i) => (
						<div
							key={title}
							className={`flex flex-col items-center text-center gap-3 p-5 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
							style={{ transitionDelay: `${i * 80}ms` }}>
							<div
								className="size-11 rounded-2xl flex items-center justify-center"
								style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
								<Icon className="size-5 text-primary" />
							</div>
							<p className="font-bold text-sm">{title}</p>
							<p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function CtaSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref} className="container mx-auto px-4 py-24">
			<div
				className={`cta-gradient relative max-w-5xl mx-auto rounded-3xl overflow-hidden p-12 md:p-20 text-center transition-all duration-1000 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
				<CtaDecorations />
				<div className="relative z-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-sm font-medium text-white mb-8">
						<TrendingUp className="size-3.5" /> No matter your size — start today
					</div>
					<h2 className="text-4xl md:text-6xl font-black mb-5 text-white text-balance tracking-tight">
						Ready to put support on autopilot?
					</h2>
					<p className="text-xl text-white/75 mb-10 max-w-2xl mx-auto text-pretty leading-relaxed">
						14-day free trial. No credit card. Works for freelancers, agencies, and growing teams.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Button size="xl" asChild className="group bg-white hover:bg-white/90" style={{ color: "var(--color-primary)" }}>
							<a href="/auth/signup">
								Start free trial
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="xl" variant="outline" asChild className="text-white border-white/35 hover:bg-white/10 hover:border-white/60">
							<a href="/pricing">View pricing</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}

// ── FEATURE VISUALS ───────────────────────────────────────────────────────────

function AIAgentVisual() {
	const [step, setStep] = useState(0);
	const steps = [
		{ label: "Ticket received", detail: '"Invoice not received after payment"', color: "text-muted-foreground" },
		{ label: "AI classifying…", detail: "Category: Billing · Priority: High", color: "text-primary" },
		{ label: "Knowledge base search", detail: "Found 2 relevant articles in 0.3s", color: "text-primary" },
		{ label: "Response sent", detail: "Resolution delivered. CSAT request queued.", color: "text-success" },
	];
	useEffect(() => {
		const iv = setInterval(() => setStep((s) => (s + 1) % steps.length), 1800);
		return () => clearInterval(iv);
	}, []);
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 mb-5">
				<div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center">
					<Bot className="size-4 text-primary" />
				</div>
				<div>
					<p className="text-sm font-semibold">AI Agent — processing</p>
					<p className="text-xs text-muted-foreground">Avg. time to resolve: 18s</p>
				</div>
				<span className="ml-auto size-2 rounded-full bg-success animate-pulse" />
			</div>
			{steps.map((s, i) => (
				<div
					key={i}
					className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${i === step ? "bg-primary/5 border-primary/30" : i < step ? "opacity-50 border-border" : "opacity-30 border-border"}`}>
					<div
						className={`mt-0.5 size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${i < step ? "border-success bg-success/20" : i === step ? "border-primary" : "border-muted-foreground/30"}`}>
						{i < step && <CheckCircle2 className="size-3 text-success" />}
						{i === step && <span className="size-1.5 rounded-full bg-primary animate-pulse block" />}
					</div>
					<div>
						<p className={`text-xs font-medium ${i === step ? s.color : "text-muted-foreground"}`}>{s.label}</p>
						<p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
					</div>
				</div>
			))}
		</div>
	);
}

function WidgetVisual() {
	return (
		<div className="relative h-64 w-full bg-linear-to-b from-primary/5 to-transparent rounded-xl border border-dashed border-primary/20 flex items-center justify-center overflow-hidden">
			<div className="absolute top-4 left-4 right-4 flex items-center gap-2 py-2 px-3 rounded-lg bg-card border shadow-sm">
				<Globe className="size-3 text-muted-foreground" />
				<div className="h-1.5 w-24 bg-muted rounded-full" />
			</div>
			<div className="absolute bottom-6 right-6 size-12 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center animate-bounce" style={{ animationDuration: "3s" }}>
				<MessageSquare className="size-5 text-white" />
			</div>
			<div className="absolute bottom-20 right-6 w-40 p-3 rounded-xl bg-card border shadow-xl animate-in fade-in slide-in-from-bottom-4">
				<div className="flex items-center gap-2 mb-2">
					<div className="size-4 rounded-full bg-primary/20" />
					<div className="h-2 w-16 bg-muted rounded-full" />
				</div>
				<div className="space-y-1.5">
					<div className="h-1.5 w-full bg-muted rounded-full" />
					<div className="h-1.5 w-4/5 bg-muted rounded-full" />
				</div>
			</div>
		</div>
	);
}

function MarketplaceVisual() {
	return (
		<div className="grid grid-cols-3 gap-3">
			{[1, 2, 3, 4, 5, 6].map((i) => (
				<div
					key={i}
					className="aspect-square rounded-xl border bg-card p-3 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors shadow-sm">
					<div
						className="size-8 rounded-lg flex items-center justify-center"
						style={{ background: `color-mix(in srgb, var(--color-primary) ${i * 5 + 5}%, transparent)` }}>
						<Puzzle className="size-4 text-primary" />
					</div>
					<div className="h-1.5 w-10 bg-muted rounded-full" />
				</div>
			))}
		</div>
	);
}

function TeamsVisual() {
	const agents = [
		{ name: "Lena M.", tickets: 12, status: "online" },
		{ name: "Carlos R.", tickets: 9, status: "online" },
		{ name: "Priya S.", tickets: 7, status: "busy" },
		{ name: "AI Agent", tickets: 41, status: "online" },
	];
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between mb-2">
				<p className="text-sm font-semibold">Live queue overview</p>
				<span className="text-xs text-muted-foreground">4 active</span>
			</div>
			{agents.map((a) => (
				<div key={a.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors">
					<div className="relative size-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
						{a.name[0]}
						<span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card ${a.status === "online" ? "bg-success" : "bg-warning"}`} />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium">{a.name}</p>
						<p className="text-xs text-muted-foreground">{a.tickets} tickets active</p>
					</div>
					<div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
						<div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (a.tickets / 50) * 100)}%` }} />
					</div>
				</div>
			))}
		</div>
	);
}
