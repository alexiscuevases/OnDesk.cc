import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, Heart, MapPin, Globe, Linkedin, Twitter, CheckCircle2, Sparkles } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMouseGlow, SectionBadge, CtaDecorations } from "./shared";



//  Data

const VALUES = [
	{
		icon: Target,
		title: "Customer-obsessed",
		desc: "Every feature starts with a real support team problem. We do 20+ customer interviews a month and ship what we learn.",
	},
	{
		icon: Users,
		title: "Transparent by default",
		desc: "We share our roadmap publicly, post our status page in real time, and tell customers when we ship something that affects them.",
	},
	{
		icon: Heart,
		title: "Built to last",
		desc: "We are profitable and growing. No growth-at-all-costs here  we build relationships and infrastructure meant to still be running in 20 years.",
	},
];

const TIMELINE = [
	{
		year: "2022",
		title: "Founded",
		desc: "Three engineers leave Microsoft frustrated by the state of enterprise support tooling. Pulse (launched as OnDesk) ships its first beta to 12 teams.",
	},
	{
		year: "2023",
		title: "Native integrations launch",
		desc: "Deep integrations with Microsoft 365 and Google Workspace go live. First 100 paying customers in 90 days.",
	},
	{
		year: "2024",
		title: "AI Agents GA",
		desc: "General availability of AI-assisted routing, ticket summarization, and suggested replies. ARR triples.",
	},
	{
		year: "2025",
		title: "Global scale",
		desc: "1,200+ customers across 40 countries. EU and APAC data residency regions open. Series B announced.",
	},
];

const TEAM = [
	{
		name: "Elena Torres",
		role: "CEO & Co-founder",
		bio: "Former Microsoft PM. Shipped Teams channels to 280M users. Obsessed with support ops.",
		location: "London",
		initials: "ET",
		linkedin: "#",
		twitter: "#",
	},
	{
		name: "Daniel Park",
		role: "CTO & Co-founder",
		bio: "Ex-Azure. Distributed systems nerd. Has opinions about queues.",
		location: "Seattle",
		initials: "DP",
		linkedin: "#",
		twitter: "#",
	},
	{
		name: "Aisha Okafor",
		role: "VP Product",
		bio: "Built support tooling at Zendesk for 6 years. Believes product is a team sport.",
		location: "Lagos",
		initials: "AO",
		linkedin: "#",
		twitter: "#",
	},
	{
		name: "Ravi Menon",
		role: "VP Engineering",
		bio: "Scaled infra at Stripe. Loves boring technology that actually works.",
		location: "Singapore",
		initials: "RM",
		linkedin: "#",
		twitter: "#",
	},
	{
		name: "Sophie Laurent",
		role: "VP Customer Success",
		bio: "10 years in enterprise SaaS CS. Holds the record for longest customer QBR.",
		location: "Paris",
		initials: "SL",
		linkedin: "#",
		twitter: "#",
	},
	{
		name: "Marcus Webb",
		role: "VP Sales",
		bio: "Sold enterprise software at ServiceNow and Atlassian. Knows when to shut up and listen.",
		location: "Amsterdam",
		initials: "MW",
		linkedin: "#",
		twitter: "#",
	},
];

const PRESS = [
	{
		quote: "Pulse is the rare support tool that works just as well for a solo consultant as it does for a 500-person enterprise.",
		source: "TechCrunch",
	},
	{
		quote: "Whether you're running one inbox or fifty, Pulse keeps everything organized without making you feel like you need an IT department.",
		source: "The Verge",
	},
	{
		quote: "A rare example of a SaaS company that does exactly what it says on the tin.",
		source: "Forbes",
	},
];

const INVESTORS = ["Accel", "Sequoia", "Index Ventures", "Microsoft M12"];

const MISSION_CHECKS = ["SOC 2 Type II certified", "GDPR & CCPA compliant", "Plans starting at $9 flat — scales to enterprise", "99.97% uptime SLA"];

//  Sections

function MissionSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-20 md:py-28 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4 max-w-5xl">
				<div className="grid md:grid-cols-2 gap-14 items-center">
					<div className={`transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
						<SectionBadge icon={Globe} label="Our mission" />
						<h2 className="text-3xl md:text-4xl font-bold mb-5 text-balance">Make support teams extraordinary</h2>
						<p className="text-muted-foreground leading-relaxed mb-5">
							Customer support is one of the most important functions in any company and one of the most underserved by software. We think the
							people doing that work deserve better tools than a shared inbox and a spreadsheet.
						</p>
						<p className="text-muted-foreground leading-relaxed">
							Pulse is built to give support teams of every size the speed and structure they need to actually solve problems through autonomous orchestration, without the
							complexity of legacy platforms.
						</p>
					</div>
					<div className={`transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
						<div
							className="rounded-2xl border p-8 space-y-4"
							style={{
								background: "color-mix(in srgb, var(--color-primary) 4%, var(--color-card))",
								borderColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
							}}>
							<p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
								Our commitments
							</p>
							{MISSION_CHECKS.map((item, i) => (
								<div
									key={item}
									className={`flex items-center gap-3 text-sm transition-all duration-500 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
									style={{ transitionDelay: `${300 + i * 80}ms` }}>
									<CheckCircle2 className="size-4 shrink-0" style={{ color: "var(--color-primary)" }} />
									<span className="text-foreground">{item}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function TimelineSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-20 md:py-28 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4 max-w-3xl">
				<div className="text-center mb-14">
					<SectionBadge icon={Sparkles} label="Our story" />
					<h2 className="text-3xl md:text-4xl font-bold">From zero to global in three years</h2>
				</div>
				<div className="relative pl-10">
					<div className="absolute left-3 top-0 w-px bg-border transition-all duration-1000" style={{ height: inView ? "100%" : "0%" }} />
					<div className="space-y-10">
						{TIMELINE.map(({ year, title, desc }, i) => (
							<div
								key={year}
								className={`relative transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
								style={{ transitionDelay: `${200 + i * 120}ms` }}>
								<div
									className="absolute -left-[29px] top-1 size-3.5 rounded-full ring-4 ring-background"
									style={{ background: "var(--color-primary)" }}
								/>
								<p className="text-xs font-bold mb-1 tracking-wider uppercase" style={{ color: "var(--color-primary)" }}>
									{year}
								</p>
								<h3 className="font-bold text-base mb-1">{title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function ValuesSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-20 md:py-28 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<SectionBadge icon={Heart} label="What we stand for" />
					<h2 className="text-3xl md:text-4xl font-bold">Our values</h2>
				</div>
				<div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
					{VALUES.map(({ icon: Icon, title, desc }, i) => (
						<div
							key={title}
							className={`group relative flex flex-col gap-5 p-7 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-1 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{ transitionDelay: `${i * 100}ms` }}>
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
							<div
								className="size-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
								style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
								<Icon className="size-5" style={{ color: "var(--color-primary)" }} />
							</div>
							<h3 className="font-bold text-lg">{title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function TeamSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-20 md:py-28 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<SectionBadge icon={Users} label="The team" />
					<h2 className="text-3xl md:text-4xl font-bold">Meet the leadership</h2>
					<p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm leading-relaxed">
						A small team with deep experience at companies like Microsoft, Stripe, Zendesk, and ServiceNow.
					</p>
				</div>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
					{TEAM.map(({ name, role, bio, location, initials, linkedin, twitter }, i) => (
						<div
							key={name}
							className={`group relative flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-1 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{ transitionDelay: `${i * 80}ms` }}>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 70%)",
								}}
							/>
							<div
								className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)" }}
							/>
							<div className="flex items-start gap-3">
								<div
									className="size-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-300"
									style={{
										background: "color-mix(in srgb, var(--color-primary) 15%, var(--color-muted))",
										color: "var(--color-primary)",
									}}>
									{initials}
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-bold">{name}</p>
									<p className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
										{role}
									</p>
								</div>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
							<div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
								<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<MapPin className="size-3.5" />
									{location}
								</span>
								<div className="flex gap-1.5">
									<a
										href={linkedin}
										className="size-7 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
										style={{ background: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}>
										<Linkedin className="size-3.5" style={{ color: "var(--color-primary)" }} />
									</a>
									<a
										href={twitter}
										className="size-7 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
										style={{ background: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}>
										<Twitter className="size-3.5" style={{ color: "var(--color-primary)" }} />
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function PressSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-20 md:py-28 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4 max-w-6xl">
				<div className="grid md:grid-cols-2 gap-14">
					<div>
						<SectionBadge icon={Globe} label="Press" />
						<h2 className="text-2xl font-bold mb-8">What they say about us</h2>
						<div className="space-y-4">
							{PRESS.map(({ quote, source }, i) => (
								<div
									key={source}
									className={`group relative p-6 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-0.5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
									style={{ transitionDelay: `${i * 100}ms` }}>
									<div
										className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
										style={{
											background:
												"radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent 70%)",
										}}
									/>
									<div
										className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
										style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)" }}
									/>
									<p className="text-sm leading-relaxed text-foreground mb-3 italic">"{quote}"</p>
									<p className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
										{source}
									</p>
								</div>
							))}
						</div>
					</div>
					<div>
						<SectionBadge icon={Target} label="Backed by" />
						<h2 className="text-2xl font-bold mb-8">Our investors</h2>
						<div className="grid grid-cols-2 gap-4">
							{INVESTORS.map((name, i) => (
								<div
									key={name}
									className={`group relative flex items-center justify-center h-24 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-1 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
									style={{ transitionDelay: `${100 + i * 80}ms` }}>
									<div
										className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
										style={{
											background:
												"radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 70%)",
										}}
									/>
									<div
										className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
										style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)" }}
									/>
									<span className="font-bold text-sm relative z-10">{name}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function AboutCtaSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-24 md:py-32" ref={ref}>
			<div className="container mx-auto px-4">
				<div
					className={`cta-gradient relative overflow-hidden rounded-3xl p-12 md:p-20 text-center transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
					<CtaDecorations />
					<div className="relative z-10">
						<p className="text-white/70 text-sm font-semibold tracking-widest uppercase mb-4">Come build with us</p>
						<h2 className="text-3xl md:text-5xl font-black text-white mb-5 text-balance">Come build the future of support</h2>
						<p className="text-white/75 text-lg leading-relaxed max-w-xl mx-auto mb-10">
							We are always looking for extraordinary people who care deeply about the work. Check out our open roles or just say hello.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Button
								size="xl"
								className="font-semibold border-0 hover:opacity-90 transition-opacity group"
								style={{ background: "white", color: "var(--color-primary)" }}
								asChild>
								<a href="/careers">
									View open roles
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
							<Button
								size="xl"
								variant="outline"
								className="font-semibold text-white border-white/35 hover:bg-white/10 hover:border-white/50"
								asChild>
								<a href="/contact">Get in touch</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// --- Page ---------------------------------------------------------------------

export default function AboutPage() {
	const [heroVisible, setHeroVisible] = useState(false);
	useEffect(() => {
		const id = requestAnimationFrame(() => setHeroVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);
	const mousePos = useMouseGlow();
	const statsRef = useInView();
	const c2022 = useCounter(2022, 1200, statsRef.inView);
	const c47 = useCounter(47, 900, statsRef.inView);
	const c1200 = useCounter(1200, 1300, statsRef.inView);
	const c40 = useCounter(40, 1000, statsRef.inView);

	return (
		<SiteLayout>
			{/*  Hero  */}
			<section className="relative overflow-hidden py-24 md:py-36 border-b border-border">
				<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
				<div
					className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
					style={{
						left: mousePos.x,
						top: mousePos.y,
						background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
					}}
				/>
				<div
					className="absolute inset-0 opacity-[0.025] pointer-events-none"
					style={{
						backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)",
						backgroundSize: "40px 40px",
					}}
				/>
				<div className="relative container mx-auto px-4 text-center max-w-3xl">
					<div className={`transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<SectionBadge icon={Globe} label="About us" />
					</div>
					<h1
						className={`text-4xl md:text-6xl font-black mb-6 text-balance leading-tight transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						We exist to{" "}
						<span
							style={{
								background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
							}}>
							fix customer support
						</span>
					</h1>
					<p
						className={`text-xl text-muted-foreground leading-relaxed text-pretty mb-10 transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						Pulse is a team of 47 people across 14 countries building the autonomous support infrastructure that teams of every size actually
						deserve.
					</p>
					<div
						className={`flex flex-col sm:flex-row justify-center gap-3 transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<Button
							size="xl"
							asChild
							className="group">
							<a href="/careers">
								Join the team
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button
							size="xl"
							variant="outline"
							asChild
							className="">
							<a href="/contact">Get in touch</a>
						</Button>
					</div>

					<div
						ref={statsRef.ref as React.RefObject<HTMLDivElement>}
						className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 transition-all duration-1000 delay-400 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						{[
							{ icon: Sparkles, displayValue: `${c2022}`, label: "Founded" },
							{ icon: Users, displayValue: `${c47}`, label: "Team members" },
							{ icon: CheckCircle2, displayValue: `${c1200.toLocaleString()}+`, label: "Customers" },
							{ icon: Globe, displayValue: `${c40}+`, label: "Countries" },
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
			<MissionSection />
			<TimelineSection />
			<ValuesSection />
			<TeamSection />
			<PressSection />
			<AboutCtaSection />
		</SiteLayout>
	);
}
