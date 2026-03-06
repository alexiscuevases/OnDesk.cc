import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Globe, Heart, Zap, TrendingUp, BookOpen, Monitor, Clock, Users, Star, ChevronRight } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, SectionBadge } from "./shared";

// -- Data --

const DEPARTMENTS = [
	{
		name: "Engineering",
		openRoles: [
			{ title: "Senior Backend Engineer  AI Platform", location: "Remote (EU / US)", type: "Full-time", tags: ["Python", "LLMs", "Azure"] },
			{ title: "Frontend Engineer — Design Systems", location: "Remote (EU / US)", type: "Full-time", tags: ["React", "TypeScript", "Tailwind"] },
			{ title: "Staff Engineer  Infrastructure", location: "Remote (EU / US)", type: "Full-time", tags: ["Kubernetes", "Terraform", "GCP"] },
			{ title: "ML Engineer  Ticket Classification", location: "Remote", type: "Full-time", tags: ["NLP", "PyTorch", "Azure OpenAI"] },
		],
	},
	{
		name: "Product & Design",
		openRoles: [
			{ title: "Senior Product Manager  Core Platform", location: "Remote (EU / US)", type: "Full-time", tags: ["B2B SaaS", "Enterprise", "AI"] },
			{ title: "Product Designer  Enterprise UX", location: "Remote", type: "Full-time", tags: ["Figma", "Research", "Design Systems"] },
		],
	},
	{
		name: "Customer Success",
		openRoles: [
			{ title: "Customer Success Manager  Enterprise (EMEA)", location: "London or Remote", type: "Full-time", tags: ["Enterprise", "EMEA", "SaaS"] },
			{ title: "Technical Onboarding Specialist", location: "Remote", type: "Full-time", tags: ["Microsoft 365", "Onboarding", "Technical"] },
		],
	},
	{
		name: "Sales",
		openRoles: [
			{ title: "Account Executive  Mid-Market (EMEA)", location: "London or Remote", type: "Full-time", tags: ["Mid-Market", "EMEA", "SaaS"] },
			{ title: "Sales Engineer", location: "Remote (US)", type: "Full-time", tags: ["Pre-sales", "Microsoft 365", "Technical"] },
		],
	},
];

const PERKS = [
	{ icon: Globe, title: "Fully remote", desc: "Work from wherever you do your best thinking. We have team members across 14 countries." },
	{ icon: TrendingUp, title: "Competitive equity", desc: "Meaningful stock options for every employee  we believe in shared ownership from day one." },
	{ icon: Heart, title: "Health & wellness", desc: "$200/month wellness allowance plus comprehensive medical, dental, and vision." },
	{ icon: BookOpen, title: "Learning budget", desc: "$2,000/year for conferences, courses, and books. No approval required." },
	{ icon: Clock, title: "Generous PTO", desc: "Unlimited PTO with a minimum of 20 days encouraged. We track utilization  we mean it." },
	{ icon: Monitor, title: "Home office stipend", desc: "$1,500 to set up your workspace the way you want it." },
	{ icon: Users, title: "Team retreats", desc: "Two company-wide retreats per year. We have been to Lisbon, Barcelona, and Tokyo." },
	{ icon: Zap, title: "Fast-paced growth", desc: "Tripled ARR in 2024. You will see your work matter and grow with the company." },
];

const PROCESS = [
	{ step: "01", title: "Apply online", desc: "Send your application. We review every submission  no auto-rejections on keywords." },
	{ step: "02", title: "Intro call", desc: "30 minutes with a member of our team to discuss the role and answer your questions." },
	{ step: "03", title: "Technical / work sample", desc: "A focused, paid take-home or live interview relevant to your role. No trick questions." },
	{ step: "04", title: "Final interviews", desc: "Meet 2-3 people you would work with day-to-day. Decision within 5 business days." },
];

const GLASSDOOR = [
	{ quote: "Best company I have worked at. Leadership actually listens, shipping is fast, and the team is world-class.", role: "Senior Engineer" },
	{ quote: "Fully remote done right. Not just tolerated  it is the default. Great async culture.", role: "Product Designer" },
	{ quote: "Unlimited PTO that people actually use. Refreshing for a startup.", role: "Customer Success Manager" },
];

// -- Sections --

function PerksSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-20 md:py-28 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<SectionBadge icon={Heart} label="Benefits" />
					<h2 className="text-3xl md:text-4xl font-bold mb-3">Why work here</h2>
					<p className="text-muted-foreground text-sm max-w-xl mx-auto">
						We compete on culture, not just compensation. Here is what that means in practice.
					</p>
				</div>
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
					{PERKS.map(({ icon: Icon, title, desc }, i) => (
						<div
							key={title}
							className={`group relative flex flex-col gap-3 p-5 rounded-xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-1 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{ transitionDelay: `${i * 60}ms` }}>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 70%)",
								}}
							/>
							<div
								className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)" }}
							/>
							<div
								className="size-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
								style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
								<Icon className="size-5" style={{ color: "var(--color-primary)" }} />
							</div>
							<h3 className="font-semibold text-sm">{title}</h3>
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
		<section
			className="py-16 border-b border-border"
			style={{ background: "color-mix(in srgb, var(--color-muted) 40%, var(--color-background))" }}
			ref={ref}>
			<div className="container mx-auto px-4 max-w-5xl">
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-2xl font-bold">What the team says</h2>
					<div className="flex items-center gap-1.5 text-sm">
						<div className="flex gap-0.5">
							{Array.from({ length: 5 }).map((_, i) => (
								<Star key={i} className="size-3.5 fill-primary text-primary" />
							))}
						</div>
						<span className="font-semibold">4.9</span>
						<span className="text-muted-foreground">on Glassdoor</span>
					</div>
				</div>
				<div className="grid md:grid-cols-3 gap-4">
					{GLASSDOOR.map(({ quote, role }, i) => (
						<div
							key={role}
							className={`group relative flex flex-col gap-3 p-5 rounded-xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-0.5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{ transitionDelay: `${i * 100}ms` }}>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent 70%)",
								}}
							/>
							<div className="flex gap-0.5">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star key={i} className="size-3 fill-primary text-primary" />
								))}
							</div>
							<p className="text-sm text-foreground leading-relaxed italic">"{quote}"</p>
							<p className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border">{role}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function OpenRolesSection({ activeDept, setActiveDept }: { activeDept: string; setActiveDept: (d: string) => void }) {
	const { ref, inView } = useInView();
	const allDepts = ["All", ...DEPARTMENTS.map((d) => d.name)];
	const filtered = activeDept === "All" ? DEPARTMENTS : DEPARTMENTS.filter((d) => d.name === activeDept);
	const totalRoles = DEPARTMENTS.reduce((acc, d) => acc + d.openRoles.length, 0);

	return (
		<section className="py-20 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4 max-w-4xl">
				<div className="text-center mb-10">
					<SectionBadge icon={Zap} label={`${totalRoles} open positions`} />
					<h2 className="text-3xl md:text-4xl font-bold mb-2">Open positions</h2>
					<p className="text-sm text-muted-foreground">
						{totalRoles} roles across {DEPARTMENTS.length} departments
					</p>
				</div>

				{/* Filter pills */}
				<div className="flex flex-wrap justify-center gap-2 mb-10">
					{allDepts.map((dept) => {
						const isActive = activeDept === dept;
						return (
							<button
								key={dept}
								onClick={() => setActiveDept(dept)}
								className={`relative px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-300 overflow-hidden ${isActive
									? "text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105"
									: "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:scale-105"
									}`}
								style={isActive ? { background: "var(--color-primary)" } : {}}>
								{isActive && (
									<span
										className="absolute inset-0 rounded-full animate-pulse"
										style={{ background: "color-mix(in srgb, var(--color-primary) 25%, transparent)" }}
									/>
								)}
								<span className="relative z-10">{dept}</span>
							</button>
						);
					})}
				</div>

				<div className="space-y-10">
					{filtered.map((dept) => (
						<div key={dept.name}>
							<div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
								<h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{dept.name}</h3>
								<span className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
									{dept.openRoles.length} open
								</span>
							</div>
							<div className="space-y-3">
								{dept.openRoles.map((role, i) => (
									<div
										key={role.title}
										className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-0.5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
										style={{ transitionDelay: `${i * 60}ms` }}>
										<div
											className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
											style={{
												background:
													"radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent 70%)",
											}}
										/>
										<div
											className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
											style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)" }}
										/>
										<div className="flex-1 min-w-0 relative z-10">
											<p className="font-semibold group-hover:text-primary transition-colors">{role.title}</p>
											<div className="flex flex-wrap gap-3 mt-1.5 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<MapPin className="size-3.5" /> {role.location}
												</span>
												<span>{role.type}</span>
											</div>
											<div className="flex flex-wrap gap-1.5 mt-2">
												{role.tags.map((tag) => (
													<span
														key={tag}
														className="text-xs px-2 py-0.5 rounded-full border"
														style={{
															background: "color-mix(in srgb, var(--color-primary) 6%, transparent)",
															borderColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
															color: "var(--color-primary)",
														}}>
														{tag}
													</span>
												))}
											</div>
										</div>
										<Button size="sm" variant="outline" asChild className="group/btn shrink-0 relative z-10">
											<a href="/contact">
												Apply
												<ArrowRight className="ml-1.5 size-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
											</a>
										</Button>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function HiringProcessSection() {
	const { ref, inView } = useInView();
	return (
		<section
			className="py-20 border-b border-border"
			style={{ background: "color-mix(in srgb, var(--color-muted) 40%, var(--color-background))" }}
			ref={ref}>
			<div className="container mx-auto px-4 max-w-4xl">
				<div className="text-center mb-12">
					<SectionBadge icon={Clock} label="Process" />
					<h2 className="text-3xl md:text-4xl font-bold mb-3">Our hiring process</h2>
					<p className="text-center text-sm text-muted-foreground">Transparent, fast, and respectful of your time.</p>
				</div>
				<div className="grid md:grid-cols-4 gap-5">
					{PROCESS.map(({ step, title, desc }, i) => (
						<div
							key={step}
							className={`group relative flex flex-col gap-3 p-5 rounded-xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-1 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{ transitionDelay: `${i * 100}ms` }}>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 70%)",
								}}
							/>
							<span className="text-3xl font-black" style={{ color: "color-mix(in srgb, var(--color-primary) 15%, transparent)" }}>
								{step}
							</span>
							<h3 className="font-semibold text-sm">{title}</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function CareersCtaSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-24 md:py-32" ref={ref}>
			<div className="container mx-auto px-4">
				<div
					className={`relative overflow-hidden rounded-3xl p-12 md:p-20 text-center transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
					style={{
						background: "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 75%, var(--color-accent)) 100%)",
						boxShadow: "0 40px 100px -20px color-mix(in srgb, var(--color-primary) 40%, transparent)",
					}}>
					<div
						className="absolute inset-0 pointer-events-none"
						style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.07 }}
					/>
					<div
						className="absolute -top-20 -right-20 size-64 rounded-full blur-3xl pointer-events-none"
						style={{ background: "color-mix(in srgb, var(--color-accent) 30%, transparent)" }}
					/>
					<div
						className="absolute -bottom-20 -left-20 size-64 rounded-full blur-3xl pointer-events-none"
						style={{ background: "color-mix(in srgb, var(--color-primary) 50%, transparent)" }}
					/>
					<div className="relative z-10">
						<p className="text-white/70 text-sm font-semibold tracking-widest uppercase mb-4">General application</p>
						<h2 className="text-3xl md:text-5xl font-black text-white mb-5 text-balance">Don't see your role?</h2>
						<p className="text-white/75 text-lg leading-relaxed max-w-xl mx-auto mb-10">
							We are always interested in meeting exceptional people. Send us a note and tell us how you would contribute.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Button
								size="lg"
								className="h-13 px-8 font-semibold text-base border-0 hover:opacity-90 transition-opacity group"
								style={{ background: "white", color: "var(--color-primary)" }}
								asChild>
								<a href="/contact">
									Send a general application
									<ChevronRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="h-13 px-8 font-semibold text-base text-white border-white/35 hover:bg-white/10 hover:border-white/50 transition-all"
								asChild>
								<a href="/about">About us</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// -- Page --

export default function CareersPage() {
	const [heroVisible, setHeroVisible] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
	const [activeDept, setActiveDept] = useState("All");

	const totalRoles = DEPARTMENTS.reduce((acc, d) => acc + d.openRoles.length, 0);

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
	const c47 = useCounter(47, 900, statsRef.inView);
	const c14 = useCounter(14, 800, statsRef.inView);
	const c49 = useCounter(49, 1200, statsRef.inView);
	const c94 = useCounter(94, 1100, statsRef.inView);

	return (
		<SiteLayout>
			{/* Hero */}
			<section className="relative overflow-hidden py-24 md:py-36 border-b border-border">
				<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
				<div
					className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
					style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
				/>
				<div
					className="absolute inset-0 opacity-[0.025] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
				/>
				<div className="relative container mx-auto px-4 text-center max-w-3xl">
					<div className={`transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<SectionBadge icon={Zap} label={`${totalRoles} open positions`} />
					</div>
					<h1
						className={`text-4xl md:text-6xl font-black mb-6 text-balance leading-tight transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						Build the{" "}
						<span
							style={{
								background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
							}}>
							future of support
						</span>
					</h1>
					<p
						className={`text-xl text-muted-foreground leading-relaxed text-pretty mb-10 transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						We are a remote-first team of 47 people spread across the globe, working to make support teams everywhere faster, happier, and more
						effective.
					</p>
					<div
						className={`flex flex-wrap justify-center gap-4 text-sm text-muted-foreground transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<span className="flex items-center gap-1.5">
							<Globe className="size-4" style={{ color: "var(--color-primary)" }} /> 14 countries
						</span>
						<span className="flex items-center gap-1.5">
							<MapPin className="size-4" style={{ color: "var(--color-primary)" }} /> Fully remote
						</span>
						<span className="flex items-center gap-1.5">
							<Star className="size-4 fill-primary" style={{ color: "var(--color-primary)" }} /> 4.9 / 5 Glassdoor
						</span>
					</div>

					<div
						ref={statsRef.ref as React.RefObject<HTMLDivElement>}
						className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 transition-all duration-1000 delay-400 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						{[
							{ icon: Users, displayValue: `${c47}`, label: "Team members" },
							{ icon: Globe, displayValue: `${c14}`, label: "Countries" },
							{ icon: Star, displayValue: `${(c49 / 10).toFixed(1)}/5`, label: "Glassdoor rating" },
							{ icon: Heart, displayValue: `${c94}%`, label: "Would recommend" },
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
			<PerksSection />
			<GlassdoorSection />
			<OpenRolesSection activeDept={activeDept} setActiveDept={setActiveDept} />
			<HiringProcessSection />
			<CareersCtaSection />
		</SiteLayout>
	);
}
