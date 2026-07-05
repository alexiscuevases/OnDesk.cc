import { PulseLine } from "./shared";
import { ArrowRight, ArrowUpRight, Menu, X, Users, Building2, UserCheck, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const SOLUTIONS = [
	{
		icon: Users,
		index: "01",
		label: "Support Teams",
		description: "Manage high-volume support with automation and workflows",
		href: "/solutions/support-teams",
	},
	{
		icon: Building2,
		index: "02",
		label: "Agencies",
		description: "Run support for multiple clients from one place",
		href: "/solutions/agencies",
	},
	{
		icon: UserCheck,
		index: "03",
		label: "Solo & Small Teams",
		description: "Keep requests organized without complexity",
		href: "/solutions/solo-small-teams",
	},
];

const NAV_LINKS = [
	{ label: "Features", href: "/features" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Integrations", href: "/integrations" },
];

const FOOTER_COLS = [
	{
		heading: "Solutions",
		links: [
			{ label: "Support Teams", href: "/solutions/support-teams" },
			{ label: "Agencies", href: "/solutions/agencies" },
			{ label: "Solo & Small Teams", href: "/solutions/solo-small-teams" },
		],
	},
	{
		heading: "Platform",
		links: [
			{ label: "Features", href: "/features" },
			{ label: "Integrations", href: "/integrations" },
			{ label: "Changelog", href: "/changelog" },
		],
	},
	{
		heading: "Resources",
		links: [
			{ label: "Blog", href: "/blog" },
			{ label: "Help Center", href: "/help" },
			{ label: "Case Studies", href: "/customers" },
			{ label: "Status", href: "/status" },
		],
	},
	{
		heading: "Company",
		links: [
			{ label: "About", href: "/about" },
			{ label: "Security", href: "/security" },
			{ label: "Careers", href: "/careers" },
			{ label: "Contact", href: "/contact" },
		],
	},
	{
		heading: "Legal",
		links: [
			{ label: "Privacy", href: "/privacy" },
			{ label: "Terms", href: "/terms" },
		],
	},
];

interface SiteLayoutProps {
	children: React.ReactNode;
	/** Show the mouse-glow + dot-grid background (default: false) */
	withBackground?: boolean;
}

export function SiteLayout({ children, withBackground = false }: SiteLayoutProps) {
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [solutionsOpen, setSolutionsOpen] = useState(false);
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const pathname = typeof window !== "undefined" ? window.location.pathname : "";
	const solutionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		if (!withBackground) return;
		const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, [withBackground]);

	// Close mobile menu on route change
	useEffect(() => {
		setMobileOpen(false);
		setSolutionsOpen(false);
	}, [pathname]);

	// Close solutions dropdown on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) {
				setSolutionsOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className="relative min-h-screen bg-background text-foreground overflow-x-clip flex flex-col">
			{withBackground && (
				<>
					<div
						className="pointer-events-none fixed inset-0 z-0 opacity-25"
						style={{
							background: `radial-gradient(520px circle at ${mousePos.x}px ${mousePos.y}px, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 60%)`,
						}}
					/>
					<div
						className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
					/>
				</>
			)}

			{/* ── NAVBAR ── */}
			<header
				className={`fixed top-0 inset-x-0 z-50 border-b border-border backdrop-blur-xl transition-shadow duration-300 ${scrolled ? "shadow-[0_8px_30px_-12px_rgba(0,34,25,0.15)]" : ""}`}
				style={{ background: "color-mix(in srgb, var(--color-background) 88%, transparent)" }}>
				{/* editorial rails aligned with page content */}
				<nav className="mx-auto max-w-350 border-x border-border h-16 px-6 md:px-12 flex items-center justify-between">
					{/* Logo + telemetry tag */}
					<div className="flex items-center gap-4 shrink-0">
						<a href="/" className="flex items-center gap-2.5">
							<img src="/logo.png" alt="Pulse Logo" height={300} className="h-9" />
						</a>
						<span className="hidden xl:flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground border-l border-border pl-4">
							<span className="size-1.5 rounded-full bg-accent animate-pulse" />
							SUPPORT_OS
						</span>
					</div>

					{/* Desktop nav */}
					<div className="hidden md:flex items-center h-full">
						{/* Solutions dropdown */}
						<div ref={solutionsRef} className="relative h-full">
							<button
								onClick={() => setSolutionsOpen((v) => !v)}
								className={`h-full flex items-center gap-1.5 px-4 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${solutionsOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
								Solutions
								<ChevronDown className={`size-3 transition-transform duration-200 ${solutionsOpen ? "rotate-180" : ""}`} />
							</button>

							{solutionsOpen && (
								<div className="absolute top-full left-0 w-88 border border-border bg-background shadow-[0_24px_60px_-16px_rgba(0,34,25,0.25)] animate-in fade-in slide-in-from-top-1 duration-200">
									<div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
										<span className="font-mono text-[10px] tracking-[0.25em] text-primary">SOLUTIONS_INDEX</span>
										<span className="font-mono text-[10px] tracking-widest text-muted-foreground/60">3 ENTRIES</span>
									</div>
									<div className="divide-y divide-border">
										{SOLUTIONS.map(({ icon: Icon, index, label, description, href }) => (
											<a
												key={label}
												href={href}
												onClick={() => setSolutionsOpen(false)}
												className="group flex items-start gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-accent/5">
												<span className="font-mono text-[10px] text-muted-foreground/50 pt-1 group-hover:text-accent transition-colors">
													{index}
												</span>
												<span className="flex-1">
													<span className="flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
														<Icon className="size-3.5 text-accent" />
														{label}
													</span>
													<span className="block text-xs text-muted-foreground mt-1 leading-snug">{description}</span>
												</span>
												<ArrowUpRight className="size-3.5 text-muted-foreground/0 group-hover:text-accent transition-colors mt-1" />
											</a>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Rest of nav links */}
						{NAV_LINKS.map(({ label, href }) => {
							const isActive = pathname === href;
							return (
								<a
									key={label}
									href={href}
									className={`relative h-full flex items-center px-4 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
									{label}
									{isActive && <span className="absolute bottom-0 inset-x-4 h-0.5 bg-accent" />}
								</a>
							);
						})}
					</div>

					{/* Desktop CTA */}
					<div className="hidden md:flex items-center gap-4">
						<a
							href="/auth/signin"
							className="font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-muted-foreground hover:text-primary transition-colors duration-200">
							Log in
						</a>
						<a
							href="/auth/signup"
							className="group relative inline-flex items-center gap-2 overflow-hidden bg-primary px-4 py-2.5 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-primary-foreground">
							<span
								className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
								style={{ background: "var(--pulse-lime)" }}
							/>
							<span className="relative z-10 flex items-center gap-1.5 group-hover:text-[var(--pulse-ink-deep)] transition-colors duration-300">
								Free Trial
								<ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
							</span>
						</a>
					</div>

					{/* Mobile toggle */}
					<button
						className="md:hidden p-2 -mr-2 border border-transparent hover:border-border transition-colors"
						onClick={() => setMobileOpen((v) => !v)}
						aria-label="Toggle menu">
						{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					</button>
				</nav>

				{/* Mobile menu */}
				{mobileOpen && (
					<div className="md:hidden border-t border-border bg-background">
						{/* Solutions section */}
						<div className="px-6 py-4 border-b border-border">
							<p className="font-mono text-[10px] tracking-[0.25em] text-primary mb-3">SOLUTIONS_INDEX</p>
							<div className="flex flex-col">
								{SOLUTIONS.map(({ icon: Icon, index, label, href }) => (
									<a key={label} href={href} className="flex items-center gap-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
										<span className="font-mono text-[10px] text-muted-foreground/50">{index}</span>
										<Icon className="size-3.5 text-accent shrink-0" />
										{label}
									</a>
								))}
							</div>
						</div>

						{NAV_LINKS.map(({ label, href }) => (
							<a
								key={label}
								href={href}
								className={`flex items-center justify-between px-6 py-3.5 border-b border-border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors ${pathname === href ? "text-primary bg-accent/5" : "text-muted-foreground hover:text-foreground"}`}>
								{label}
								<ArrowUpRight className="size-3.5 text-muted-foreground/40" />
							</a>
						))}

						<div className="flex gap-3 px-6 py-5">
							<a
								href="/auth/signin"
								className="flex-1 inline-flex items-center justify-center border border-foreground/25 px-4 py-3 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-foreground hover:border-primary hover:text-primary transition-colors">
								Log in
							</a>
							<a
								href="/auth/signup"
								className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary px-4 py-3 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-primary-foreground">
								Free Trial
								<ArrowRight className="size-3" />
							</a>
						</div>
					</div>
				)}
			</header>

			{/* ── PAGE CONTENT ── */}
			<main className="relative z-10 flex-1 pt-16">{children}</main>

			{/* ── FOOTER ── */}
			<footer className="relative z-10 text-white" style={{ background: "var(--pulse-ink)" }}>
				{/* EKG strip */}
				<div className="border-b border-white/10 px-6 md:px-12 py-2" style={{ color: "var(--pulse-lime)" }}>
					<PulseLine className="w-full h-8 block" strokeWidth={1.2} />
				</div>

				<div className="mx-auto max-w-350 border-x border-white/10">
					{/* header row */}
					<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
						<span className="font-mono text-[10px] tracking-[0.25em] text-white/40">PULSE://INDEX</span>
						<span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--pulse-lime)" }}>
							<span className="size-1.5 rounded-full animate-pulse" style={{ background: "var(--pulse-lime)" }} />
							ALL SYSTEMS OPERATIONAL
						</span>
					</div>

					{/* columns */}
					<div className="grid sm:grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-10 px-6 md:px-12 py-12">
						{/* Brand column */}
						<div className="md:col-span-1">
							<a href="/" className="inline-block font-black text-2xl tracking-tighter mb-4">
								Pulse<span style={{ color: "var(--pulse-lime)" }}>.</span>
							</a>
							<p className="text-sm text-white/45 leading-relaxed max-w-[200px]">
								Automate support, resolve faster, and scale effortlessly.
							</p>
						</div>

						{/* Link columns */}
						{FOOTER_COLS.map((col) => (
							<div key={col.heading}>
								<h4 className="font-mono text-[10px] tracking-[0.25em] uppercase mb-5" style={{ color: "var(--pulse-lime)" }}>
									{col.heading}
								</h4>
								<ul className="space-y-3">
									{col.links.map(({ label, href }) => (
										<li key={label}>
											<a
												href={href}
												className={`group inline-flex items-center gap-1.5 text-sm transition-colors duration-200 ${pathname === href ? "text-white font-medium" : "text-white/55 hover:text-white"}`}>
												{label}
												<ArrowUpRight className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" style={{ color: "var(--pulse-lime)" }} />
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					{/* giant outline wordmark */}
					<div className="overflow-hidden border-t border-white/10 select-none" aria-hidden="true">
						<div
							className="text-center font-black tracking-tighter leading-[0.75] text-[26vw] md:text-[16rem] -mb-[0.18em]"
							style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.10)" }}>
							PULSE
						</div>
					</div>

					{/* bottom bar */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 md:px-12 py-5 border-t border-white/10 font-mono text-[10px] tracking-[0.2em] text-white/35">
						<span>© 2026 PULSE — ALL RIGHTS RESERVED</span>
						<span>
							SIG.END<span className="blink-cursor" style={{ color: "var(--pulse-lime)" }}>▌</span>
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
