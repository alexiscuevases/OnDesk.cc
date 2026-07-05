import { useState } from "react";
import { ArrowRight, ArrowUpRight, MapPin, Globe, Heart, Zap, TrendingUp, BookOpen, Monitor, Clock, Users, Star } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";

// ── Data ──

const DEPARTMENTS = [
	{
		name: "Intelligence & Infrastructure",
		openRoles: [
			{ title: "Senior Intelligence Engineer — Pulse Core", location: "Remote (EU / US)", type: "Full-time", tags: ["Python", "LLMs", "Azure"] },
			{ title: "Frontend Engineer — Design Systems", location: "Remote (EU / US)", type: "Full-time", tags: ["React", "TypeScript", "Tailwind"] },
			{ title: "Staff Engineer — Infrastructure", location: "Remote (EU / US)", type: "Full-time", tags: ["Kubernetes", "Terraform", "GCP"] },
			{ title: "ML Engineer — Ticket Classification", location: "Remote", type: "Full-time", tags: ["NLP", "PyTorch", "Azure OpenAI"] },
		],
	},
	{
		name: "Product & Design",
		openRoles: [
			{ title: "Senior Product Manager — Core Platform", location: "Remote (EU / US)", type: "Full-time", tags: ["B2B SaaS", "Enterprise", "AI"] },
			{ title: "Product Designer — Enterprise UX", location: "Remote", type: "Full-time", tags: ["Figma", "Research", "Design Systems"] },
			{ title: "Product Manager — Starter & SMB", location: "Remote", type: "Full-time", tags: ["SMB", "Self-serve", "Growth"] },
		],
	},
	{
		name: "Customer Success",
		openRoles: [
			{ title: "Customer Success Manager — Enterprise (EMEA)", location: "London or Remote", type: "Full-time", tags: ["Enterprise", "EMEA", "SaaS"] },
			{ title: "Technical Onboarding Specialist", location: "Remote", type: "Full-time", tags: ["Onboarding", "Technical", "SMB"] },
		],
	},
	{
		name: "Sales",
		openRoles: [
			{ title: "Account Executive — Mid-Market (EMEA)", location: "London or Remote", type: "Full-time", tags: ["Mid-Market", "EMEA", "SaaS"] },
			{ title: "Sales Engineer", location: "Remote (US)", type: "Full-time", tags: ["Pre-sales", "Technical", "Integrations"] },
			{ title: "SMB Account Executive", location: "Remote (US / LATAM)", type: "Full-time", tags: ["SMB", "Self-serve", "SaaS"] },
		],
	},
];

const PERKS = [
	{ icon: Globe, title: "Fully remote", desc: "Work from wherever you do your best thinking. We have team members across 14 countries." },
	{ icon: TrendingUp, title: "Competitive equity", desc: "Meaningful stock options for every employee — we believe in shared ownership from day one." },
	{ icon: Heart, title: "Health & wellness", desc: "$200/month wellness allowance plus comprehensive medical, dental, and vision." },
	{ icon: BookOpen, title: "Learning budget", desc: "$2,000/year for conferences, courses, and books. No approval required." },
	{ icon: Clock, title: "Generous PTO", desc: "Unlimited PTO with a minimum of 20 days encouraged. We track utilization — we mean it." },
	{ icon: Monitor, title: "Home office stipend", desc: "$1,500 to set up your workspace the way you want it." },
	{ icon: Users, title: "Team retreats", desc: "Two company-wide retreats per year. We have been to Lisbon, Barcelona, and Tokyo." },
	{ icon: Zap, title: "Fast-paced growth", desc: "Tripled ARR in 2024. You will see your work matter and grow with the company." },
];

const PROCESS = [
	{ step: "01", title: "Apply online", desc: "Send your application. We review every submission — no auto-rejections on keywords." },
	{ step: "02", title: "Intro call", desc: "30 minutes with a member of our team to discuss the role and answer your questions." },
	{ step: "03", title: "Technical / work sample", desc: "A focused, paid take-home or live interview relevant to your role. No trick questions." },
	{ step: "04", title: "Final interviews", desc: "Meet 2-3 people you would work with day-to-day. Decision within 5 business days." },
];

const GLASSDOOR = [
	{ quote: "Best company I have worked at. Leadership actually listens, shipping is fast, and the team is world-class.", role: "Senior Engineer" },
	{ quote: "Fully remote done right. Not just tolerated — it is the default. Great async culture.", role: "Product Designer" },
	{ quote: "Unlimited PTO that people actually use. Refreshing for a startup.", role: "Customer Success Manager" },
];

const TOTAL_ROLES = DEPARTMENTS.reduce((acc, d) => acc + d.openRoles.length, 0);

// ── Page ──

export default function CareersPage() {
	const visible = useMountVisible();
	const [activeDept, setActiveDept] = useState("All");
	const { ref: statsRef, inView: statsInView } = useInView();
	const c47 = useCounter(47, 900, statsInView);
	const c14 = useCounter(14, 800, statsInView);
	const c49 = useCounter(49, 1200, statsInView);
	const c94 = useCounter(94, 1100, statsInView);

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
								HIRING — {TOTAL_ROLES} POSITIONS OPEN<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Build the{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								autonomous service
							</span>
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
							We are a remote-first team of 47 people spread across the globe, building support infrastructure that works for solo
							founders and enterprise teams alike.
						</p>

						<div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-10">
							<span>
								<span className="text-accent mr-2">●</span>14 COUNTRIES
							</span>
							<span>
								<span className="text-accent mr-2">●</span>FULLY REMOTE
							</span>
							<span>
								<span className="text-accent mr-2">●</span>4.9 / 5 GLASSDOOR
							</span>
						</div>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="#roles">
								View open positions <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="/about" variant="outline">
								About us
							</CtaLink>
						</div>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${c47}`, label: "TEAM MEMBERS" },
								{ value: `${c14}`, label: "COUNTRIES" },
								{ value: `${(c49 / 10).toFixed(1)}/5`, label: "GLASSDOOR RATING" },
								{ value: `${c94}%`, label: "WOULD RECOMMEND" },
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

				{/* ── BENEFITS ── */}
				<PerksSection />

				{/* ── CREW REPORTS ── */}
				<GlassdoorSection />

				{/* ── OPEN POSITIONS ── */}
				<OpenRolesSection activeDept={activeDept} setActiveDept={setActiveDept} />

				{/* ── PROCESS — dark band ── */}
				<ProcessBand />

				{/* ── CTA ── */}
				<DarkCta
					tag="EOF — GENERAL APPLICATION"
					headline={
						<>
							Don't see your <span style={{ color: "var(--pulse-lime)" }}>role?</span>
						</>
					}
					desc="We are always interested in meeting exceptional people. Send us a note and tell us how you would contribute."
					primary={{ href: "/contact", label: "Send a general application" }}
					secondary={{ href: "/about", label: "About us" }}
				/>
			</div>
		</SiteLayout>
	);
}

// ── Sections ──

function PerksSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="01" label="BENEFITS" title="Why work here" right="CULTURE > COMPENSATION" />
			<p className="px-6 md:px-12 pb-10 text-lg text-muted-foreground max-w-2xl">
				We compete on culture, not just compensation. Here is what that means in practice.
			</p>

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border-b border-border">
					{PERKS.map(({ icon: Icon, title, desc }, i) => (
						<div
							key={title}
							className={`group relative bg-background px-6 py-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ transitionDelay: `${i * 60}ms` }}>
							<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
							<div className="flex items-center justify-between mb-6">
								<span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/60">0{i + 1}</span>
								<Icon className="size-4 text-accent" />
							</div>
							<h3 className="font-bold text-sm mb-2">{title}</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function GlassdoorSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">02 — CREW REPORTS</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<Star className="size-3 fill-accent text-accent" />
					4.9 / 5 ON GLASSDOOR
				</span>
			</div>

			<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
				{GLASSDOOR.map(({ quote, role }, i) => (
					<div
						key={role}
						className={`flex flex-col px-6 md:px-10 py-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 100}ms` }}>
						<span className="font-mono text-[10px] tracking-[0.25em] text-accent font-bold mb-6">LOG_0{i + 1}</span>
						<p className="text-base font-medium leading-relaxed flex-1 mb-8">"{quote}"</p>
						<div className="font-mono text-[11px] tracking-wider text-muted-foreground border-t border-border pt-4">
							{role.toUpperCase()} — VERIFIED EMPLOYEE
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function OpenRolesSection({ activeDept, setActiveDept }: { activeDept: string; setActiveDept: (d: string) => void }) {
	const { ref, inView } = useInView();
	const allDepts = ["All", ...DEPARTMENTS.map((d) => d.name)];
	const filtered = activeDept === "All" ? DEPARTMENTS : DEPARTMENTS.filter((d) => d.name === activeDept);

	return (
		<section id="roles" ref={ref as React.RefObject<HTMLElement>} className="scroll-mt-16">
			<SectionRule index="03" label="OPEN POSITIONS" title="Join the crew" right={`${TOTAL_ROLES} ROLES / ${DEPARTMENTS.length} DEPARTMENTS`} />
			<div className="h-6" />

			{/* mono filter buttons */}
			<div className="flex flex-wrap gap-2 px-6 md:px-12 pb-10">
				{allDepts.map((dept) => {
					const isActive = activeDept === dept;
					return (
						<button
							key={dept}
							onClick={() => setActiveDept(dept)}
							className={`px-4 py-2 border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
								isActive
									? "bg-primary text-primary-foreground border-primary"
									: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
							}`}>
							{dept}
						</button>
					);
				})}
			</div>

			<div key={activeDept} className={`animate-in fade-in duration-300 ${inView ? "" : "opacity-0"}`}>
				{filtered.map((dept, di) => (
					<div key={dept.name}>
						{/* department header row */}
						<div className="flex items-center gap-4 px-6 md:px-12 py-4 border-t border-border">
							<span className="font-mono text-[11px] tracking-[0.25em] text-primary font-semibold uppercase">
								DEPT_0{DEPARTMENTS.findIndex((d) => d.name === dept.name) + 1} / {dept.name}
							</span>
							<span className="ml-auto font-mono text-[10px] tracking-widest text-accent shrink-0">{dept.openRoles.length} OPEN</span>
						</div>

						{/* role rows */}
						<div className="border-t border-border divide-y divide-border">
							{dept.openRoles.map((role, i) => (
								<a
									key={role.title}
									href="/contact"
									className={`group grid sm:grid-cols-12 gap-3 sm:gap-4 items-center px-6 md:px-12 py-5 transition-colors duration-200 hover:bg-accent/5 ${inView ? "opacity-100" : "opacity-0"}`}
									style={{ transitionDelay: `${di * 60 + i * 40}ms` }}>
									<div className="sm:col-span-6 min-w-0">
										<p className="font-bold group-hover:text-primary transition-colors">{role.title}</p>
										<div className="flex flex-wrap gap-1.5 mt-2">
											{role.tags.map((tag) => (
												<span key={tag} className="font-mono text-[9px] tracking-[0.15em] uppercase border border-border px-1.5 py-0.5 text-muted-foreground">
													{tag}
												</span>
											))}
										</div>
									</div>
									<div className="sm:col-span-3 flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
										<MapPin className="size-3 text-accent shrink-0" />
										{role.location}
									</div>
									<div className="sm:col-span-2 font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">{role.type}</div>
									<div className="sm:col-span-1 flex sm:justify-end">
										<span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.15em] uppercase font-bold text-primary group-hover:text-accent transition-colors">
											APPLY <ArrowUpRight className="size-3" />
										</span>
									</div>
								</a>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function ProcessBand() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white border-y border-border" style={{ background: "var(--pulse-ink)" }}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
				<span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: "var(--pulse-lime)" }}>
					04 — PROCESS
				</span>
				<span className="hidden sm:block font-mono text-[11px] tracking-[0.25em] text-white/40">APPLY → OFFER IN ~2 WEEKS</span>
			</div>

			<div className={`px-6 md:px-12 pt-14 pb-4 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance max-w-3xl mb-3">
					Transparent, fast, <span style={{ color: "var(--pulse-lime)" }}>respectful.</span>
				</h2>
				<p className="text-white/50 text-lg">Four steps. No trick questions. Paid work samples.</p>
			</div>

			<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
			</div>

			<div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10">
				{PROCESS.map(({ step, title, desc }, i) => (
					<div
						key={step}
						className={`px-6 md:px-10 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 120 + 150}ms` }}>
						<span className="font-mono text-5xl font-black text-white/15 block mb-8">/{step}</span>
						<h3 className="text-lg font-bold mb-3">{title}</h3>
						<p className="text-sm text-white/50 leading-relaxed">{desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}
