import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ArrowRight,
	Bot,
	Zap,
	Users,
	BarChart3,
	MessageSquare,
	CheckCircle2,
	Star,
	ChevronRight,
	Ticket,
	Clock,
	TrendingUp,
	Sparkles,
	Play,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ---------- types ----------
interface LiveTicket {
	id: string;
	title: string;
	priority: "high" | "medium" | "low";
	status: "open" | "ai-resolving" | "resolved";
	time: string;
	agent: string;
}

// ---------- data ----------
const FEATURES = [
	{
		id: "ai",
		icon: Bot,
		label: "AI Agents",
		title: "AI that resolves tickets before your team wakes up",
		description: "Intelligent agents triage, categorize, and auto-reply to 80% of incoming tickets 24/7, escalating only what truly needs a human.",
		bullets: ["Auto-classification & routing", "Context-aware AI replies", "Smart escalation rules"],
	},
	{
		id: "speed",
		icon: Zap,
		label: "Speed",
		title: "First response in under 30 seconds",
		description: "Automated workflows kick in the moment a ticket lands. SLAs tracked in real time, alerts fire before breaches happen.",
		bullets: ["Automated SLA tracking", "Real-time breach alerts", "Priority queue management"],
	},
	{
		id: "teams",
		icon: Users,
		label: "Teams",
		title: "One dashboard for your entire support org",
		description: "Agents, supervisors, and admins all work from a single pane of glass. Roles, permissions, and workload balancing built in.",
		bullets: ["Role-based access control", "Live workload heatmaps", "Shift scheduling integration"],
	},
	{
		id: "analytics",
		icon: BarChart3,
		label: "Analytics",
		title: "Know your support health at a glance",
		description: "Real-time dashboards surface ticket volume trends, CSAT scores, and agent productivity without needing a BI team.",
		bullets: ["CSAT & NPS tracking", "Agent performance reports", "Volume forecast models"],
	},
];

const TESTIMONIALS = [
	{
		quote: "SupportDesk 365 cut our average resolution time from 4 hours to 18 minutes. The AI agents are genuinely impressive.",
		author: "Sarah Chen",
		role: "Head of Customer Success",
		company: "Contoso Ltd.",
		rating: 5,
	},
	{
		quote: "The Microsoft 365 integration was seamless. Our team was fully onboarded in a single afternoon.",
		author: "Marcus Rivera",
		role: "IT Director",
		company: "Fabrikam Inc.",
		rating: 5,
	},
	{
		quote: "We handle 12,000 tickets a month. Before SupportDesk we needed 22 agents. Now we need 9 — and they're happier.",
		author: "Priya Patel",
		role: "VP Operations",
		company: "Northwind Traders",
		rating: 5,
	},
];

const COMPANIES = ["Microsoft", "Contoso", "Fabrikam", "Northwind", "Tailwind", "Adventure Works", "Wingtip", "Litware"];

const INITIAL_TICKETS: LiveTicket[] = [
	{ id: "#4821", title: "Cannot access SharePoint after password reset", priority: "high", status: "ai-resolving", time: "0s ago", agent: "AI Agent" },
	{ id: "#4820", title: "Outlook not syncing on mobile device", priority: "medium", status: "resolved", time: "42s ago", agent: "AI Agent" },
	{ id: "#4819", title: "Teams meeting recording missing from channel", priority: "low", status: "resolved", time: "1m ago", agent: "AI Agent" },
	{ id: "#4818", title: "VPN connection drops intermittently", priority: "high", status: "open", time: "2m ago", agent: "Unassigned" },
];

const NEW_TICKETS: LiveTicket[] = [
	{ id: "#4825", title: "Excel macro blocked by security policy", priority: "medium", status: "ai-resolving", time: "just now", agent: "AI Agent" },
	{ id: "#4824", title: "OneDrive sync conflict on shared folder", priority: "low", status: "ai-resolving", time: "just now", agent: "AI Agent" },
	{ id: "#4823", title: "MFA prompt looping on sign-in", priority: "high", status: "open", time: "just now", agent: "Unassigned" },
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

// ---------- component ----------
export default function LandingPage() {
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [activeFeature, setActiveFeature] = useState(0);
	const [activeTestimonial, setActiveTestimonial] = useState(0);
	const [tickets, setTickets] = useState<LiveTicket[]>(INITIAL_TICKETS);
	const [ticketIdx, setTicketIdx] = useState(0);
	const [visible, setVisible] = useState(false);
	const heroRef = useRef<HTMLElement>(null);

	// Mount animation
	useEffect(() => {
		setVisible(true);
	}, []);

	// Sticky nav — handled by SiteLayout

	// Mouse parallax
	useEffect(() => {
		const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, []);

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

	// Auto-rotate features
	useEffect(() => {
		const iv = setInterval(() => setActiveFeature((i) => (i + 1) % FEATURES.length), 4000);
		return () => clearInterval(iv);
	}, []);

	const feat = FEATURES[activeFeature];
	const FeatIcon = feat.icon;

	return (
		<SiteLayout>
			{/* ── HERO ── */}
			<section ref={heroRef} className="relative pt-16 pb-20 md:pt-28 md:pb-28 container mx-auto px-4">
				<div className={`max-w-5xl mx-auto transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
					{/* Badge */}
					<div className="flex justify-center mb-8">
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-sm font-medium text-primary animate-in fade-in slide-in-from-bottom-3 duration-700">
							<Sparkles className="size-3.5" />
							Now with AI Agents — resolve 80% of tickets automatically
							<ChevronRight className="size-3.5" />
						</span>
					</div>

					{/* Headline */}
					<h1 className="text-center text-5xl md:text-[4.5rem] font-bold leading-[1.05] text-balance mb-6">
						Support at the speed of{" "}
						<span className="relative inline-block text-primary">
							AI
							<span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full opacity-60" />
						</span>
					</h1>

					<p className="text-center text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10 text-pretty">
						SupportDesk 365 combines intelligent AI agents with Microsoft 365 to triage, route, and resolve customer tickets before your team even
						clocks in.
					</p>

					<div className="flex flex-col sm:flex-row justify-center gap-3 mb-16">
						<Button size="lg" asChild className="group h-12 px-8 text-base">
							<a href="/signup">
								Start free — 14 days
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="group h-12 px-8 text-base">
							<a href="#demo">
								<Play className="mr-2 size-4" />
								Watch demo
							</a>
						</Button>
					</div>

					{/* Live ticket feed */}
					<div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden shadow-xl shadow-primary/5">
						{/* Window chrome */}
						<div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border">
							<span className="size-3 rounded-full bg-destructive/60" />
							<span className="size-3 rounded-full bg-warning/60" />
							<span className="size-3 rounded-full bg-success/60" />
							<span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
								<span className="size-1.5 rounded-full bg-success animate-pulse" />
								Live ticket feed
							</span>
						</div>
						{/* Ticket rows */}
						<div className="divide-y divide-border">
							{tickets.map((t, i) => (
								<div
									key={t.id + i}
									className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-500 ${i === 0 ? "bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-500" : ""}`}>
									<Ticket className="size-4 shrink-0 text-muted-foreground" />
									<span className="font-mono text-xs text-muted-foreground w-12 shrink-0">{t.id}</span>
									<span className="flex-1 truncate text-foreground/90">{t.title}</span>
									<span
										className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${PRIORITY_COLORS[t.priority]}`}>
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
			</section>

			{/* ── LOGOS MARQUEE ── */}
			<div className="relative overflow-hidden border-y border-border bg-muted/20 py-6">
				<p className="text-center text-xs text-muted-foreground mb-4 tracking-widest uppercase">Trusted by leading organizations</p>
				<div className="flex gap-12 animate-marquee whitespace-nowrap">
					{[...COMPANIES, ...COMPANIES].map((c, i) => (
						<span
							key={i}
							className="text-muted-foreground/50 font-semibold text-sm tracking-wide hover:text-muted-foreground transition-colors cursor-default shrink-0">
							{c}
						</span>
					))}
				</div>
			</div>

			{/* ── STATS ── */}
			<section className="container mx-auto px-4 py-20">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden max-w-5xl mx-auto shadow-sm">
					{[
						{ value: "80%", label: "Faster resolution", icon: Clock },
						{ value: "50K+", label: "Tickets/month handled", icon: Ticket },
						{ value: "95%", label: "Customer satisfaction", icon: Star },
						{ value: "24 / 7", label: "AI always online", icon: Bot },
					].map(({ value, label, icon: Icon }) => (
						<div key={label} className="flex flex-col items-center justify-center gap-2 bg-card p-8 group hover:bg-primary/5 transition-colors">
							<Icon className="size-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
							<div className="text-4xl font-bold">{value}</div>
							<div className="text-sm text-muted-foreground text-center">{label}</div>
						</div>
					))}
				</div>
			</section>

			{/* ── INTERACTIVE FEATURES ── */}
			<section id="features" className="container mx-auto px-4 py-20 md:py-28">
				<div className="text-center mb-14">
					<h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Built for every part of your support team</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">Click any tab to explore what makes SupportDesk 365 different.</p>
				</div>
				{/* Tab bar */}
				<div className="flex flex-wrap justify-center gap-2 mb-12">
					{FEATURES.map((f, i) => {
						const Icon = f.icon;
						return (
							<button
								key={f.id}
								onClick={() => setActiveFeature(i)}
								className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${activeFeature === i ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`}>
								<Icon className="size-4" />
								{f.label}
							</button>
						);
					})}
				</div>

				{/* Feature panel */}
				<div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
					<div className="order-2 md:order-1 space-y-5 animate-in fade-in slide-in-from-left-4 duration-500" key={feat.id}>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
							<FeatIcon className="size-3.5" />
							{feat.label}
						</div>
						<h3 className="text-3xl font-bold text-balance leading-snug">{feat.title}</h3>
						<p className="text-muted-foreground leading-relaxed text-lg">{feat.description}</p>
						<ul className="space-y-2.5">
							{feat.bullets.map((b) => (
								<li key={b} className="flex items-center gap-2.5 text-sm">
									<CheckCircle2 className="size-4 text-primary shrink-0" />
									{b}
								</li>
							))}
						</ul>
						<Button asChild className="group mt-2">
							<a href="/signup">
								Try {feat.label} free
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
					</div>

					{/* Animated visual */}
					<div className="order-1 md:order-2" key={feat.id + "-visual"}>
						<div className="animate-in fade-in zoom-in-95 duration-500 rounded-2xl border border-border bg-card/80 p-6 shadow-xl shadow-primary/5">
							{feat.id === "ai" && <AIAgentVisual />}
							{feat.id === "speed" && <SpeedVisual />}
							{feat.id === "teams" && <TeamsVisual />}
							{feat.id === "analytics" && <AnalyticsVisual />}
						</div>
					</div>
				</div>
			</section>

			{/* ── TESTIMONIALS ── */}
			<section className="py-20 md:py-28 bg-muted/20 border-y border-border">
				<div className="container mx-auto px-4">
					<h2 className="text-center text-3xl md:text-4xl font-bold mb-14 text-balance">What support leaders are saying</h2>
					<div className="max-w-3xl mx-auto text-center">
						<div className="relative overflow-hidden min-h-[160px]">
							{TESTIMONIALS.map((t, i) => (
								<div
									key={i}
									className={`absolute inset-0 flex flex-col items-center transition-all duration-500 ${i === activeTestimonial ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
									<div className="flex gap-1 mb-4">
										{Array.from({ length: t.rating }).map((_, s) => (
											<Star key={s} className="size-4 fill-primary text-primary" />
										))}
									</div>
									<blockquote className="text-xl md:text-2xl font-medium text-foreground mb-5 text-balance">"{t.quote}"</blockquote>
									<p className="text-sm text-muted-foreground">
										<span className="font-semibold text-foreground">{t.author}</span> · {t.role}, {t.company}
									</p>
								</div>
							))}
						</div>

						{/* Dots */}
						<div className="flex justify-center gap-2 mt-8">
							{TESTIMONIALS.map((_, i) => (
								<button
									key={i}
									onClick={() => setActiveTestimonial(i)}
									className={`rounded-full transition-all duration-200 ${i === activeTestimonial ? "w-6 h-2 bg-primary" : "size-2 bg-border hover:bg-muted-foreground"}`}
									aria-label={`Testimonial ${i + 1}`}
								/>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── HOW IT WORKS ── */}
			<section className="container mx-auto px-4 py-20 md:py-28">
				<div className="text-center mb-14">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">From ticket to resolution in seconds</h2>
					<p className="text-xl text-muted-foreground">Three steps. Zero overhead.</p>
				</div>
				<div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
					{[
						{ step: "01", title: "Ticket arrives", desc: "From email, chat, or Teams. Any channel, instantly captured.", icon: MessageSquare },
						{
							step: "02",
							title: "AI analyzes & acts",
							desc: "Classifies priority, retrieves context, and drafts or sends a resolution.",
							icon: Bot,
						},
						{
							step: "03",
							title: "Human review (if needed)",
							desc: "Complex cases are flagged and routed to the right agent automatically.",
							icon: CheckCircle2,
						},
					].map(({ step, title, desc, icon: Icon }, i) => (
						<div key={step} className="relative group">
							{/* Connector line */}
							{i < 2 && (
								<div
									className="hidden md:block absolute top-8 left-full w-full h-px bg-border z-0 -translate-y-px"
									style={{ width: "calc(100% - 2rem)" }}
								/>
							)}
							<div className="relative z-10 flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group-hover:-translate-y-1">
								<div className="flex items-center justify-between">
									<div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
										<Icon className="size-6 text-primary" />
									</div>
									<span className="text-4xl font-black text-muted-foreground/20">{step}</span>
								</div>
								<h3 className="text-lg font-semibold">{title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ── CTA ── */}
			<section className="container mx-auto px-4 pb-24">
				<div className="relative max-w-5xl mx-auto rounded-3xl border border-primary/20 bg-card overflow-hidden p-12 md:p-16 text-center shadow-xl shadow-primary/5">
					{/* Subtle glow blobs */}
					<div className="absolute -top-20 -right-20 size-64 rounded-full bg-primary/20 blur-3xl opacity-40 pointer-events-none" />
					<div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-primary/10 blur-3xl opacity-40 pointer-events-none" />

					<div className="relative">
						<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
							<TrendingUp className="size-3.5" /> Start resolving tickets smarter
						</div>
						<h2 className="text-4xl md:text-5xl font-bold mb-5 text-balance">Ready to put support on autopilot?</h2>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
							14-day free trial. No credit card. Full Microsoft 365 integration from day one.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-3">
							<Button size="lg" asChild className="group h-12 px-8 text-base">
								<a href="/signup">
									Start free trial
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
							<Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
								<a href="/signin">Sign in to your account</a>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}

// ── FEATURE VISUALS ──

function AIAgentVisual() {
	const [step, setStep] = useState(0);
	const steps = [
		{ label: "Ticket received", detail: '"Can\'t log into Teams after the update"', color: "text-muted-foreground" },
		{ label: "AI classifying…", detail: "Category: Authentication · Priority: High", color: "text-primary" },
		{ label: "Knowledge base search", detail: "Found 3 relevant KB articles in 0.4s", color: "text-primary" },
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

function SpeedVisual() {
	const [progress, setProgress] = useState(0);
	useEffect(() => {
		const iv = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 4)), 60);
		return () => clearInterval(iv);
	}, []);
	const slas = [
		{ label: "Critical", target: "15m", current: "8m", pct: 53 },
		{ label: "High", target: "2h", current: "34m", pct: 28 },
		{ label: "Medium", target: "8h", current: "1.2h", pct: 15 },
	];
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between mb-2">
				<p className="text-sm font-semibold">SLA Compliance</p>
				<Badge variant="secondary" className="text-success border-success/30 bg-success/10 text-xs">
					All healthy
				</Badge>
			</div>
			{slas.map((s) => (
				<div key={s.label} className="space-y-1.5">
					<div className="flex justify-between text-xs">
						<span className="font-medium">{s.label}</span>
						<span className="text-muted-foreground">
							{s.current} / {s.target} target
						</span>
					</div>
					<div className="h-2 bg-muted rounded-full overflow-hidden">
						<div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${s.pct}%` }} />
					</div>
				</div>
			))}
			<div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-center">
				<span className="font-bold text-primary text-lg">{Math.round(progress * 0.36)}s</span>
				<span className="text-muted-foreground ml-2">avg. first response today</span>
			</div>
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
				<p className="text-sm font-semibold">Live agent workload</p>
				<span className="text-xs text-muted-foreground">4 online</span>
			</div>
			{agents.map((a) => (
				<div key={a.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors">
					<div className="relative size-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
						{a.name[0]}
						<span
							className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card ${a.status === "online" ? "bg-success" : "bg-warning"}`}
						/>
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

function AnalyticsVisual() {
	const bars = [42, 68, 55, 80, 73, 91, 87];
	const days = ["M", "T", "W", "T", "F", "S", "S"];
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm font-semibold">Tickets resolved / day</p>
				<div className="flex items-center gap-1 text-xs text-success font-medium">
					<TrendingUp className="size-3" /> +14% this week
				</div>
			</div>
			<div className="flex items-end gap-1.5 h-28">
				{bars.map((h, i) => (
					<div key={i} className="flex-1 flex flex-col items-center gap-1">
						<div
							className="w-full rounded-t-md bg-primary transition-all duration-700 hover:bg-primary/80"
							style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
						/>
						<span className="text-[10px] text-muted-foreground">{days[i]}</span>
					</div>
				))}
			</div>
			<div className="grid grid-cols-3 gap-2 text-center">
				{[
					{ v: "96%", l: "CSAT" },
					{ v: "4.2m", l: "Avg resolve" },
					{ v: "287", l: "This week" },
				].map(({ v, l }) => (
					<div key={l} className="rounded-lg bg-muted/40 p-2">
						<div className="text-base font-bold">{v}</div>
						<div className="text-xs text-muted-foreground">{l}</div>
					</div>
				))}
			</div>
		</div>
	);
}
