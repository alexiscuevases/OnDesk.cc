import { ArrowRight, Target, Users, Heart, MapPin, Linkedin, Twitter, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";

// ── Data ──

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
		desc: "We are profitable and growing. No growth-at-all-costs here — we build relationships and infrastructure meant to still be running in 20 years.",
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
	{ name: "Elena Torres", role: "CEO & Co-founder", bio: "Former Microsoft PM. Shipped Teams channels to 280M users. Obsessed with support ops.", location: "London", initials: "ET" },
	{ name: "Daniel Park", role: "CTO & Co-founder", bio: "Ex-Azure. Distributed systems nerd. Has opinions about queues.", location: "Seattle", initials: "DP" },
	{ name: "Aisha Okafor", role: "VP Product", bio: "Built support tooling at Zendesk for 6 years. Believes product is a team sport.", location: "Lagos", initials: "AO" },
	{ name: "Ravi Menon", role: "VP Engineering", bio: "Scaled infra at Stripe. Loves boring technology that actually works.", location: "Singapore", initials: "RM" },
	{ name: "Sophie Laurent", role: "VP Customer Success", bio: "10 years in enterprise SaaS CS. Holds the record for longest customer QBR.", location: "Paris", initials: "SL" },
	{ name: "Marcus Webb", role: "VP Sales", bio: "Sold enterprise software at ServiceNow and Atlassian. Knows when to shut up and listen.", location: "Amsterdam", initials: "MW" },
];

const PRESS = [
	{ quote: "Pulse is the rare support tool that works just as well for a solo consultant as it does for a 500-person enterprise.", source: "TechCrunch" },
	{ quote: "Whether you're running one inbox or fifty, Pulse keeps everything organized without making you feel like you need an IT department.", source: "The Verge" },
	{ quote: "A rare example of a SaaS company that does exactly what it says on the tin.", source: "Forbes" },
];

const INVESTORS = ["Accel", "Sequoia", "Index Ventures", "Microsoft M12"];

const MISSION_CHECKS = ["SOC 2 Type II certified", "GDPR & CCPA compliant", "Plans starting at $9 flat — scales to enterprise", "99.97% uptime SLA"];

// ── Page ──

export default function AboutPage() {
	const visible = useMountVisible();
	const { ref: statsRef, inView: statsInView } = useInView();
	const c2022 = useCounter(2022, 1200, statsInView);
	const c47 = useCounter(47, 900, statsInView);
	const c1200 = useCounter(1200, 1300, statsInView);
	const c40 = useCounter(40, 1000, statsInView);

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
								COMPANY_RECORD — EST. 2022<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							We exist to{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								fix customer support
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
							Pulse is a team of 47 people across 14 countries building the autonomous support infrastructure that teams of every size
							actually deserve.
						</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/careers">
								Join the team <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="/contact" variant="outline">
								Get in touch
							</CtaLink>
						</div>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${c2022}`, label: "FOUNDED" },
								{ value: `${c47}`, label: "TEAM MEMBERS" },
								{ value: `${c1200.toLocaleString()}+`, label: "CUSTOMERS" },
								{ value: `${c40}+`, label: "COUNTRIES" },
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

				{/* ── MISSION ── */}
				<MissionSection />

				{/* ── TIMELINE ── */}
				<TimelineSection />

				{/* ── VALUES ── */}
				<ValuesSection />

				{/* ── TEAM ── */}
				<TeamSection />

				{/* ── PRESS & BACKERS ── */}
				<PressSection />

				{/* ── CTA ── */}
				<DarkCta
					tag="06 — JOIN · REMOTE-FIRST / 14 COUNTRIES"
					headline={
						<>
							Come build the future of <span style={{ color: "var(--pulse-lime)" }}>support.</span>
						</>
					}
					desc="We are always looking for extraordinary people who care deeply about the work. Check out our open roles or just say hello."
					primary={{ href: "/careers", label: "View open roles" }}
					secondary={{ href: "/contact", label: "Get in touch" }}
				/>
			</div>
		</SiteLayout>
	);
}

// ── Sections ──

function MissionSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">01 — MISSION</MonoTag>
				<MonoTag className="hidden sm:block">MAKE SUPPORT TEAMS EXTRAORDINARY</MonoTag>
			</div>

			<div className="grid lg:grid-cols-12">
				<div
					className={`lg:col-span-7 px-6 md:px-12 py-12 lg:border-r border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<h2 className="text-3xl md:text-5xl font-black tracking-tight text-balance mb-6">Make support teams extraordinary</h2>
					<p className="text-muted-foreground leading-relaxed mb-5">
						Customer support is one of the most important functions in any company and one of the most underserved by software. We think
						the people doing that work deserve better tools than a shared inbox and a spreadsheet.
					</p>
					<p className="text-muted-foreground leading-relaxed">
						Pulse is built to give support teams of every size the speed and structure they need to actually solve problems through
						autonomous orchestration, without the complexity of legacy platforms.
					</p>
				</div>

				<div
					className={`lg:col-span-5 px-6 md:px-12 py-12 transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<div className="border border-border">
						<div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
							<span className="font-mono text-[10px] tracking-[0.25em] text-primary">COMMITMENTS</span>
							<span className="size-1.5 rounded-full bg-accent animate-pulse" />
						</div>
						<div className="divide-y divide-border">
							{MISSION_CHECKS.map((item) => (
								<div key={item} className="flex items-center gap-3 px-4 py-3.5 text-sm">
									<CheckCircle2 className="size-3.5 text-accent shrink-0" />
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
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="02" label="TIMELINE" title="From zero to global in three years" right="2022 → PRESENT" />
			<div className="h-10" />

			<div className="border-t border-border">
				{TIMELINE.map(({ year, title, desc }, i) => (
					<div
						key={year}
						className={`grid md:grid-cols-12 border-b border-border transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
						style={{ transitionDelay: `${i * 120}ms` }}>
						<div className="md:col-span-3 px-6 md:px-12 pt-8 md:py-8 md:border-r border-border">
							<span className="text-3xl font-black tracking-tighter text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
								{year}
							</span>
						</div>
						<div className="md:col-span-9 px-6 md:px-12 py-8">
							<h3 className="font-bold text-lg mb-1.5">{title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{desc}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function ValuesSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">03 — VALUES</MonoTag>
				<MonoTag className="hidden sm:block">WHAT WE STAND FOR</MonoTag>
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border">
				{VALUES.map(({ icon: Icon, title, desc }, i) => (
					<div
						key={title}
						className={`group relative px-6 md:px-10 py-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 100}ms` }}>
						<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
						<div className="flex items-center justify-between mb-8">
							<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">0{i + 1}</span>
							<Icon className="size-5 text-accent" />
						</div>
						<h3 className="text-xl font-black tracking-tight mb-2.5">{title}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

function TeamSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="04" label="CREW" title="Meet the leadership" right={`${TEAM.length} OPERATORS ON DECK`} />
			<p className="px-6 md:px-12 pb-10 text-lg text-muted-foreground max-w-2xl">
				A small team with deep experience at companies like Microsoft, Stripe, Zendesk, and ServiceNow.
			</p>

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border">
					{TEAM.map(({ name, role, bio, location, initials }, i) => (
						<div
							key={name}
							className={`group relative bg-background px-6 md:px-8 py-8 flex flex-col transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ transitionDelay: `${i * 80}ms` }}>
							<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
							<div className="flex items-start gap-4 mb-5">
								<div className="size-12 shrink-0 flex items-center justify-center font-mono text-sm font-bold text-primary border border-primary/25 bg-primary/5">
									{initials}
								</div>
								<div className="min-w-0">
									<p className="font-bold">{name}</p>
									<p className="font-mono text-[10px] tracking-[0.15em] uppercase text-accent font-semibold mt-1">{role}</p>
								</div>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed flex-1">{bio}</p>
							<div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
								<span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
									<MapPin className="size-3 text-accent" />
									{location}
								</span>
								<div className="flex gap-3">
									<a href="#" aria-label={`${name} on LinkedIn`} className="text-muted-foreground hover:text-primary transition-colors">
										<Linkedin className="size-3.5" />
									</a>
									<a href="#" aria-label={`${name} on Twitter`} className="text-muted-foreground hover:text-primary transition-colors">
										<Twitter className="size-3.5" />
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
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">05 — PRESS & BACKERS</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					ON THE RECORD
				</span>
			</div>

			<div className="grid lg:grid-cols-12">
				{/* press quotes */}
				<div className="lg:col-span-7 lg:border-r border-border divide-y divide-border">
					{PRESS.map(({ quote, source }, i) => (
						<div
							key={source}
							className={`px-6 md:px-12 py-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
							style={{ transitionDelay: `${i * 100}ms` }}>
							<p className="text-base md:text-lg font-medium leading-relaxed mb-4">"{quote}"</p>
							<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold">— {source}</p>
						</div>
					))}
				</div>

				{/* investors */}
				<div className="lg:col-span-5 border-t lg:border-t-0 border-border">
					<div className="px-6 md:px-10 py-4 border-b border-border">
						<MonoTag>BACKED BY</MonoTag>
					</div>
					<div className="grid grid-cols-2 gap-px bg-border">
						{INVESTORS.map((name, i) => (
							<div
								key={name}
								className={`flex items-center justify-center h-28 bg-background transition-all duration-700 ${inView ? "opacity-100" : "opacity-0"}`}
								style={{ transitionDelay: `${200 + i * 80}ms` }}>
								<span className="font-bold text-sm tracking-wide text-muted-foreground">{name}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
