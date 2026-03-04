import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Phone, CheckCircle2, Clock, MapPin, Zap, Shield, Users, ArrowRight } from "lucide-react";
import { SiteLayout } from "./site-layout";

// -- Hooks --

function useInView(options?: IntersectionObserverInit) {
	const ref = useRef<HTMLDivElement>(null);
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

function useCounter(target: number, duration = 1200, active = false) {
	const [value, setValue] = useState(0);
	useEffect(() => {
		if (!active) return;
		let start = 0;
		const step = target / (duration / 16);
		const id = setInterval(() => {
			start += step;
			if (start >= target) {
				setValue(target);
				clearInterval(id);
			} else setValue(Math.floor(start));
		}, 16);
		return () => clearInterval(id);
	}, [target, duration, active]);
	return value;
}

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

// -- Data --

const CONTACT_OPTIONS = [
	{
		icon: MessageSquare,
		title: "Sales",
		desc: "Talk to our sales team about pricing, plans, and whether SupportDesk 365 is the right fit for your team.",
		detail: "sales@supportdesk365.com",
		badge: "Replies in < 4 hours",
		badgeStyle: {
			background: "color-mix(in srgb, #22c55e 12%, transparent)",
			color: "#16a34a",
			borderColor: "color-mix(in srgb, #22c55e 25%, transparent)",
		} as React.CSSProperties,
	},
	{
		icon: Phone,
		title: "Enterprise",
		desc: "Dedicated support for teams of 50+ with custom contracts, SSO, compliance reviews, and SLA guarantees.",
		detail: "enterprise@supportdesk365.com",
		badge: "Dedicated team",
		badgeStyle: {
			background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
			color: "var(--color-primary)",
			borderColor: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
		} as React.CSSProperties,
	},
	{
		icon: Mail,
		title: "Press",
		desc: "Media inquiries, logo requests, and press kit. We are happy to provide interviews, quotes, and company data.",
		detail: "press@supportdesk365.com",
		badge: "Replies in < 24 hours",
		badgeStyle: {
			background: "color-mix(in srgb, var(--color-muted) 80%, transparent)",
			color: "var(--color-muted-foreground)",
			borderColor: "var(--color-border)",
		} as React.CSSProperties,
	},
];

const OFFICES = [
	{ city: "London", address: "Remote-first HQ  14 countries" },
	{ city: "Seattle", address: "Engineering hub" },
];

const TRUST = [
	{ icon: Clock, stat: "< 4h", label: "Response for sales" },
	{ icon: Shield, stat: "SOC 2", label: "Type II certified" },
	{ icon: Users, stat: "1,200+", label: "Customers worldwide" },
	{ icon: Zap, stat: "99.97%", label: "Uptime SLA" },
];

const REASONS: Record<string, string> = {
	sales: "Tell us your team size, current setup, and what you are hoping to solve.",
	enterprise: "Describe your requirements  SSO, compliance, SLA, or custom contracts.",
	technical: "Share details about the issue or integration you need help with.",
	partnership: "Tell us about your product and the kind of partnership you have in mind.",
	other: "Whatever is on your mind  we read every message.",
};

// -- Sections --

function ContactChannelsSection() {
	const { ref, inView } = useInView();
	return (
		<section className="border-b border-border py-16" ref={ref}>
			<div className="container mx-auto px-4 max-w-5xl">
				<div className="grid md:grid-cols-3 gap-4">
					{CONTACT_OPTIONS.map(({ icon: Icon, title, desc, detail, badge, badgeStyle }, i) => (
						<div
							key={title}
							className={`group relative flex flex-col gap-3 p-6 rounded-xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-1 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{ transitionDelay: `${i * 100}ms` }}>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 70%)",
								}}
							/>
							<div
								className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)" }}
							/>
							<div
								className="size-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
								style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
								<Icon className="size-5" style={{ color: "var(--color-primary)" }} />
							</div>
							<div className="flex items-center gap-2">
								<h3 className="font-semibold">{title}</h3>
								<span className="text-xs px-2 py-0.5 rounded-full border font-medium" style={badgeStyle}>
									{badge}
								</span>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
							<a href={`mailto:${detail}`} className="text-xs mt-auto font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
								{detail}
							</a>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function ContactFormSection({
	submitted,
	setSubmitted,
	reason,
	setReason,
}: {
	submitted: boolean;
	setSubmitted: (v: boolean) => void;
	reason: string;
	setReason: (v: string) => void;
}) {
	const { ref, inView } = useInView();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitted(true);
	}

	const placeholder = reason && REASONS[reason] ? REASONS[reason] : "Tell us how we can help...";

	return (
		<section className="py-16 md:py-24 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4 max-w-5xl">
				<div className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-start">
					{/* Left: Form or Success */}
					<div className={`transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
						{submitted ? (
							<div className="flex flex-col items-center justify-center text-center gap-5 py-16 px-6 rounded-2xl border border-border bg-card">
								<div
									className="size-16 rounded-full flex items-center justify-center"
									style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
									<CheckCircle2 className="size-8" style={{ color: "var(--color-primary)" }} />
								</div>
								<div>
									<h2 className="text-xl font-bold mb-1">Message received</h2>
									<p className="text-sm text-muted-foreground">We will get back to you within 4 business hours during weekdays.</p>
								</div>
								<div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
									<Button variant="outline" className="flex-1 text-sm" onClick={() => setSubmitted(false)}>
										Send another message
									</Button>
									<Button className="flex-1 text-sm" asChild>
										<a href="/help">Browse help center</a>
									</Button>
								</div>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<h2 className="text-2xl font-bold mb-1">Send us a message</h2>
									<p className="text-sm text-muted-foreground">We read every submission and reply within one business day.</p>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label htmlFor="first-name">First name</Label>
										<Input id="first-name" placeholder="Alex" required />
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="last-name">Last name</Label>
										<Input id="last-name" placeholder="Johnson" required />
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="email">Work email</Label>
									<Input id="email" type="email" placeholder="alex@company.com" required />
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label htmlFor="company">Company</Label>
										<Input id="company" placeholder="Acme Corp" />
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="team-size">Team size</Label>
										<Select>
											<SelectTrigger id="team-size">
												<SelectValue placeholder="Select" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1-10">110 agents</SelectItem>
												<SelectItem value="11-50">1150 agents</SelectItem>
												<SelectItem value="51-200">51200 agents</SelectItem>
												<SelectItem value="200+">200+ agents</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="reason">Reason for contact</Label>
									<Select onValueChange={setReason}>
										<SelectTrigger id="reason">
											<SelectValue placeholder="Select a topic" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="sales">Sales inquiry</SelectItem>
											<SelectItem value="enterprise">Enterprise plan</SelectItem>
											<SelectItem value="technical">Technical support</SelectItem>
											<SelectItem value="partnership">Partnership</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="message">Message</Label>
									<Textarea id="message" placeholder={placeholder} rows={5} required className="resize-none" />
								</div>
								<Button
									type="submit"
									className="w-full font-semibold h-11 group"
									style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
									Send message
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
								</Button>
								<p className="text-xs text-center text-muted-foreground">
									By submitting this form you agree to our{" "}
									<a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
										Privacy Policy
									</a>
									.
								</p>
							</form>
						)}
					</div>

					{/* Right: Sidebar */}
					<div
						className={`flex flex-col gap-4 transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
						{/* Offices */}
						<div className="rounded-xl border border-border bg-card p-5">
							<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Offices</p>
							<div className="space-y-3">
								{OFFICES.map(({ city, address }) => (
									<div key={city} className="flex items-start gap-2.5">
										<MapPin className="size-4 mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} />
										<div>
											<p className="text-sm font-medium">{city}</p>
											<p className="text-xs text-muted-foreground">{address}</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Response time */}
						<div className="rounded-xl border border-border bg-card p-5">
							<div className="flex items-center gap-2 mb-2">
								<Clock className="size-4" style={{ color: "var(--color-primary)" }} />
								<p className="text-sm font-semibold">Response times</p>
							</div>
							<ul className="space-y-1.5 text-xs text-muted-foreground">
								<li className="flex justify-between">
									<span>Sales</span>
									<span className="font-medium text-foreground">&lt; 4 hours</span>
								</li>
								<li className="flex justify-between">
									<span>Enterprise</span>
									<span className="font-medium text-foreground">Dedicated CSM</span>
								</li>
								<li className="flex justify-between">
									<span>General</span>
									<span className="font-medium text-foreground">&lt; 1 business day</span>
								</li>
								<li className="flex justify-between">
									<span>Press</span>
									<span className="font-medium text-foreground">&lt; 24 hours</span>
								</li>
							</ul>
						</div>

						{/* Help center promo */}
						<div
							className="rounded-xl p-5 text-sm flex flex-col gap-2"
							style={{
								background: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
								border: "1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)",
							}}>
							<p className="font-semibold" style={{ color: "var(--color-primary)" }}>
								Looking for quick answers?
							</p>
							<p className="text-xs text-muted-foreground">Browse 200+ articles in our help center before reaching out.</p>
							<Button size="sm" variant="outline" className="mt-1 self-start" asChild>
								<a href="/help">
									Help Center <ArrowRight className="ml-1.5 size-3.5" />
								</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// -- Page --

export default function ContactPage() {
	const [heroVisible, setHeroVisible] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
	const [submitted, setSubmitted] = useState(false);
	const [reason, setReason] = useState("");

	useEffect(() => {
		const id = requestAnimationFrame(() => setHeroVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);

	const onMove = useCallback((e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY }), []);
	useEffect(() => {
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, [onMove]);
	const statsRef = useInView();
	const c1200 = useCounter(1200, 1300, statsRef.inView);
	const c9997 = useCounter(9997, 1400, statsRef.inView);

	return (
		<SiteLayout>
			{/* Hero */}
			<section className="relative overflow-hidden py-24 md:py-32 border-b border-border">
				<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
				<div
					className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
					style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
				/>
				<div
					className="absolute inset-0 opacity-[0.025] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
				/>
				<div className="relative container mx-auto px-4 text-center max-w-2xl">
					<div className={`transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<SectionBadge icon={Clock} label="Average response time: 4 business hours" />
					</div>
					<h1
						className={`text-4xl md:text-6xl font-black mb-5 text-balance leading-tight transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						Get{" "}
						<span
							style={{
								background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
							}}>
							in touch
						</span>
					</h1>
					<p
						className={`text-xl text-muted-foreground leading-relaxed text-pretty transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						Whether you are evaluating SupportDesk 365, scaling an existing plan, or just have a question we would love to hear from you.
					</p>

					<div
						ref={statsRef.ref as React.RefObject<HTMLDivElement>}
						className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-12 transition-all duration-1000 delay-400 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						{[
							{ icon: Clock, displayValue: "< 4h", label: "Sales response time" },
							{ icon: Shield, displayValue: "SOC 2", label: "Type II certified" },
							{ icon: Users, displayValue: `${c1200.toLocaleString()}+`, label: "Customers worldwide" },
							{ icon: Zap, displayValue: `${(c9997 / 100).toFixed(2)}%`, label: "Uptime SLA" },
						].map(({ icon: Icon, displayValue, label }, i) => (
							<div
								key={label}
								className={`group relative flex flex-col items-center gap-1.5 py-5 px-3 rounded-2xl border transition-all duration-700 hover:-translate-y-1 hover:shadow-lg overflow-hidden cursor-default ${statsRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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
									className="text-xl font-black relative z-10"
									style={{ color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>
									{displayValue}
								</span>
								<span className="text-xs text-muted-foreground relative z-10 text-center">{label}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			<ContactChannelsSection />
			<ContactFormSection submitted={submitted} setSubmitted={setSubmitted} reason={reason} setReason={setReason} />
		</SiteLayout>
	);
}
