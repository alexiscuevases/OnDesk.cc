import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Phone, CheckCircle2, Clock, MapPin, Zap, ArrowRight } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, Cross } from "./shared";

// ── Data ──

const CONTACT_OPTIONS = [
	{
		icon: MessageSquare,
		title: "General",
		desc: "New to Pulse, not sure where to start, or just have a quick question? We read every message.",
		detail: "hello@pulse.cc",
		badge: "REPLIES < 8H",
	},
	{
		icon: Mail,
		title: "Sales",
		desc: "Questions about plans, pricing, or whether Pulse is right for you — we're happy to help.",
		detail: "sales@pulse.cc",
		badge: "REPLIES < 4H",
	},
	{
		icon: Phone,
		title: "Enterprise",
		desc: "Custom contracts, SSO, compliance reviews, and SLA guarantees for teams with advanced requirements.",
		detail: "enterprise@pulse.cc",
		badge: "DEDICATED TEAM",
	},
	{
		icon: Zap,
		title: "Press",
		desc: "Media inquiries, logo requests, and press kit. We are happy to provide interviews, quotes, and company data.",
		detail: "press@pulse.cc",
		badge: "REPLIES < 24H",
	},
];

const OFFICES = [
	{ city: "London", address: "Remote-first HQ — 14 countries" },
	{ city: "Seattle", address: "Engineering hub" },
];

const RESPONSE_TIMES = [
	["SALES", "< 4 HOURS"],
	["ENTERPRISE", "DEDICATED CSM"],
	["GENERAL", "< 1 BUSINESS DAY"],
	["PRESS", "< 24 HOURS"],
] as const;

const REASONS: Record<string, string> = {
	general: "Tell us a bit about yourself and what you're trying to do. We'll point you in the right direction.",
	sales: "Tell us your team size, current setup, and what you are hoping to solve.",
	enterprise: "Describe your requirements — SSO, compliance, SLA, or custom contracts.",
	technical: "Share details about the issue or integration you need help with.",
	partnership: "Tell us about your product and the kind of partnership you have in mind.",
	other: "Whatever is on your mind — we read every message.",
};

const INPUT_SQUARE = "rounded-none";

// ── Page ──

export default function ContactPage() {
	const visible = useMountVisible();
	const [submitted, setSubmitted] = useState(false);
	const [reason, setReason] = useState("");
	const { ref: statsRef, inView: statsInView } = useInView();
	const c1200 = useCounter(1200, 1300, statsInView);
	const c9997 = useCounter(9997, 1400, statsInView);

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
								COMMS — AVG RESPONSE 4 BUSINESS HOURS<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Get{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								in touch
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
							We're here to help. Reach out to the right team and we'll get back to you fast.
						</p>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: "< 4h", label: "SALES RESPONSE TIME" },
								{ value: "SOC 2", label: "TYPE II CERTIFIED" },
								{ value: `${c1200.toLocaleString()}+`, label: "CUSTOMERS WORLDWIDE" },
								{ value: `${(c9997 / 100).toFixed(2)}%`, label: "UPTIME SLA" },
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

				{/* ── CHANNELS ── */}
				<ChannelsSection />

				{/* ── TRANSMIT ── */}
				<FormSection submitted={submitted} setSubmitted={setSubmitted} reason={reason} setReason={setReason} />
			</div>
		</SiteLayout>
	);
}

// ── Sections ──

function ChannelsSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">01 — CHANNELS</MonoTag>
				<MonoTag className="hidden sm:block">PICK THE RIGHT FREQUENCY</MonoTag>
			</div>

			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border-b border-border">
				{CONTACT_OPTIONS.map(({ icon: Icon, title, desc, detail, badge }, i) => (
					<div
						key={title}
						className={`group relative bg-background px-6 py-8 flex flex-col transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 80}ms` }}>
						<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
						<div className="flex items-center justify-between mb-6">
							<Icon className="size-5 text-accent" />
							<span className="font-mono text-[9px] tracking-[0.2em] border border-accent/40 text-accent px-2 py-1 font-bold">{badge}</span>
						</div>
						<h3 className="font-black text-lg tracking-tight mb-2">{title}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{desc}</p>
						<a
							href={`mailto:${detail}`}
							className="font-mono text-[11px] text-primary hover:text-accent transition-colors border-t border-border pt-4">
							{detail}
						</a>
					</div>
				))}
			</div>
		</section>
	);
}

function FormSection({
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
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">02 — TRANSMIT</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					CHANNEL OPEN
				</span>
			</div>

			<div className="grid lg:grid-cols-12 border-b border-border">
				{/* form */}
				<div
					className={`lg:col-span-7 lg:border-r border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<div className="flex items-center justify-between px-6 md:px-12 py-3 border-b border-border">
						<span className="font-mono text-[10px] tracking-[0.25em] text-primary">NEW_MESSAGE</span>
						<span className="font-mono text-[10px] tracking-widest text-muted-foreground/60">ENCRYPTED · TLS 1.3</span>
					</div>

					<div className="px-6 md:px-12 py-10">
						{submitted ? (
							<div className="py-10">
								<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-4">
									✓ TRANSMISSION RECEIVED<span className="blink-cursor">_</span>
								</p>
								<div className="inline-flex items-center justify-center size-14 border border-accent/40 bg-accent/5 mb-6">
									<CheckCircle2 className="size-7 text-accent" />
								</div>
								<h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Message received</h2>
								<p className="text-muted-foreground mb-8">We will get back to you within 4 business hours during weekdays.</p>
								<div className="flex flex-col sm:flex-row gap-3 max-w-md">
									<Button
										variant="outline"
										className="flex-1 h-12 rounded-none font-mono text-xs tracking-[0.15em] uppercase font-semibold"
										onClick={() => setSubmitted(false)}>
										Send another
									</Button>
									<Button asChild className="flex-1 h-12 rounded-none font-mono text-xs tracking-[0.15em] uppercase font-semibold">
										<a href="/help">Help center</a>
									</Button>
								</div>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="mb-8">
									<h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Send us a message</h2>
									<p className="text-sm text-muted-foreground">We read every submission and reply within one business day.</p>
								</div>
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label htmlFor="first-name">First name</Label>
										<Input id="first-name" placeholder="Alex" required className={INPUT_SQUARE} />
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="last-name">Last name</Label>
										<Input id="last-name" placeholder="Johnson" required className={INPUT_SQUARE} />
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="email">Work email</Label>
									<Input id="email" type="email" placeholder="alex@company.com" required className={INPUT_SQUARE} />
								</div>
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label htmlFor="company">Company</Label>
										<Input id="company" placeholder="Acme Corp" className={INPUT_SQUARE} />
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="team-size">Team size</Label>
										<Select>
											<SelectTrigger id="team-size" className={INPUT_SQUARE}>
												<SelectValue placeholder="Select" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1-10">1–10 agents</SelectItem>
												<SelectItem value="11-50">11–50 agents</SelectItem>
												<SelectItem value="51-200">51–200 agents</SelectItem>
												<SelectItem value="200+">200+ agents</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="reason">Reason for contact</Label>
									<Select onValueChange={setReason}>
										<SelectTrigger id="reason" className={INPUT_SQUARE}>
											<SelectValue placeholder="Select a topic" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="general">General question</SelectItem>
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
									<Textarea id="message" placeholder={placeholder} rows={5} required className={`resize-none ${INPUT_SQUARE}`} />
								</div>
								<Button
									type="submit"
									size="lg"
									className="w-full h-12 rounded-none font-mono text-xs tracking-[0.15em] uppercase font-semibold group">
									Send message
									<ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
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
				</div>

				{/* sidebar */}
				<div
					className={`lg:col-span-5 border-t lg:border-t-0 border-border transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					{/* offices */}
					<div className="border-b border-border">
						<div className="px-6 md:px-10 py-3 border-b border-border">
							<span className="font-mono text-[10px] tracking-[0.25em] text-primary">OFFICES</span>
						</div>
						<div className="divide-y divide-border">
							{OFFICES.map(({ city, address }) => (
								<div key={city} className="flex items-start gap-3 px-6 md:px-10 py-4">
									<MapPin className="size-4 text-accent shrink-0 mt-0.5" />
									<div>
										<p className="text-sm font-bold">{city}</p>
										<p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mt-1">{address}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* response times */}
					<div className="border-b border-border">
						<div className="flex items-center gap-2 px-6 md:px-10 py-3 border-b border-border">
							<Clock className="size-3 text-accent" />
							<span className="font-mono text-[10px] tracking-[0.25em] text-primary">RESPONSE_TIMES</span>
						</div>
						<div className="divide-y divide-border">
							{RESPONSE_TIMES.map(([channel, time]) => (
								<div key={channel} className="flex items-center justify-between px-6 md:px-10 py-3 font-mono text-[10px] tracking-[0.2em]">
									<span className="text-muted-foreground">{channel}</span>
									<span className="text-primary font-bold">{time}</span>
								</div>
							))}
						</div>
					</div>

					{/* help center promo */}
					<div className="px-6 md:px-10 py-8">
						<Zap className="size-5 text-accent mb-4" />
						<p className="font-bold text-sm mb-1">Looking for quick answers?</p>
						<p className="text-sm text-muted-foreground leading-relaxed mb-5">
							Browse 200+ articles in our help center before reaching out.
						</p>
						<a
							href="/help"
							className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-primary hover:text-accent transition-colors">
							Help center <ArrowRight className="size-3" />
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
