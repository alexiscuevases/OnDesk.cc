import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X, Users, Building2, UserCheck, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const SOLUTIONS = [
	{
		icon: Users,
		label: "Support Teams",
		description: "Manage high-volume support with automation and workflows",
		href: "/solutions/support-teams",
	},
	{
		icon: Building2,
		label: "Agencies",
		description: "Run support for multiple clients from one place",
		href: "/solutions/agencies",
	},
	{
		icon: UserCheck,
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
						style={{ background: `radial-gradient(520px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.18), transparent 60%)` }}
					/>
					<div
						className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
						style={{ backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
					/>
				</>
			)}

			{/* ── NAVBAR ── */}
			<header
				className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "backdrop-blur-xl shadow-lg" : "bg-transparent"}`}
				style={
					scrolled
						? {
								background: "color-mix(in srgb, var(--color-background) 85%, transparent)",
								borderBottom: "1px solid color-mix(in srgb, var(--color-primary) 12%, var(--color-border))",
								boxShadow: "0 4px 24px -4px color-mix(in srgb, var(--color-primary) 8%, transparent)",
							}
						: undefined
				}>
				<nav className="container mx-auto px-4 h-16 flex items-center justify-between">
					{/* Logo */}
					<a href="/" className="flex items-center gap-2.5 group shrink-0">
						<img src="/logo.png" alt="Pulse Logo" height={300} className="h-9" />
					</a>

					{/* Desktop nav */}
					<div className="hidden md:flex items-center gap-1">
						{/* Solutions dropdown */}
						<div ref={solutionsRef} className="relative">
							<button
								onClick={() => setSolutionsOpen((v) => !v)}
								className="relative flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 group"
								style={{ color: solutionsOpen ? "var(--color-foreground)" : "var(--color-muted-foreground)" }}>
								<span
									className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
									style={{ background: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}
								/>
								<span className="relative group-hover:text-foreground transition-colors duration-200">Solutions</span>
								<ChevronDown
									className={`relative size-3.5 transition-transform duration-200 ${solutionsOpen ? "rotate-180" : ""}`}
									style={{ color: "inherit" }}
								/>
							</button>

							{solutionsOpen && (
								<div
									className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-xl border p-2 shadow-xl backdrop-blur-xl"
									style={{
										background: "color-mix(in srgb, var(--color-background) 92%, transparent)",
										borderColor: "color-mix(in srgb, var(--color-primary) 14%, var(--color-border))",
										boxShadow: "0 16px 48px -8px color-mix(in srgb, var(--color-primary) 12%, rgba(0,0,0,0.3))",
									}}>
									{SOLUTIONS.map(({ icon: Icon, label, description, href }) => (
										<a
											key={label}
											href={href}
											onClick={() => setSolutionsOpen(false)}
											className="flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group/item"
											style={{ color: "var(--color-muted-foreground)" }}
											onMouseEnter={(e) => {
												(e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--color-primary) 7%, transparent)";
											}}
											onMouseLeave={(e) => {
												(e.currentTarget as HTMLElement).style.background = "transparent";
											}}>
											<span
												className="mt-0.5 p-1.5 rounded-md shrink-0"
												style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
												<Icon className="size-3.5" style={{ color: "var(--color-primary)" }} />
											</span>
											<span>
												<span className="block text-sm font-medium text-foreground group-hover/item:text-primary transition-colors duration-150">
													{label}
												</span>
												<span className="block text-xs text-muted-foreground mt-0.5 leading-snug">{description}</span>
											</span>
										</a>
									))}
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
									className="relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 group"
									style={isActive ? { color: "var(--color-primary)" } : { color: "var(--color-muted-foreground)" }}>
									<span
										className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
										style={{ background: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}
									/>
									<span className="relative group-hover:text-foreground transition-colors duration-200">{label}</span>
									{isActive && (
										<span
											className="absolute bottom-0 left-1/2 -translate-x-1/2 size-1 rounded-full"
											style={{ background: "var(--color-primary)" }}
										/>
									)}
								</a>
							);
						})}
					</div>

					{/* Desktop CTA */}
					<div className="hidden md:flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-all duration-200">
							<a href="/auth/signin">Log in</a>
						</Button>
						<Button
							size="sm"
							asChild
							className="group shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300">
							<a href="/auth/signup">
								Free Trial
								<ArrowRight className="ml-1.5 size-3.5 group-hover:translate-x-0.5 transition-transform" />
							</a>
						</Button>
					</div>

					{/* Mobile toggle */}
					<button
						className="md:hidden p-2 -mr-2 rounded-lg hover:bg-primary/8 transition-colors"
						onClick={() => setMobileOpen((v) => !v)}
						aria-label="Toggle menu">
						{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					</button>
				</nav>

				{/* Mobile menu */}
				{mobileOpen && (
					<div
						className="md:hidden border-b px-4 pb-5 pt-2 flex flex-col gap-1 backdrop-blur-xl"
						style={{
							background: "color-mix(in srgb, var(--color-background) 95%, transparent)",
							borderColor: "color-mix(in srgb, var(--color-primary) 12%, var(--color-border))",
						}}>
						{/* Solutions section in mobile */}
						<div className="py-2 px-3 border-b border-border/40">
							<p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-primary)" }}>
								Solutions
							</p>
							<div className="flex flex-col gap-1">
								{SOLUTIONS.map(({ icon: Icon, label, href }) => (
									<a
										key={label}
										href={href}
										className="flex items-center gap-2.5 py-1.5 text-sm transition-colors duration-200"
										style={{ color: "var(--color-muted-foreground)" }}>
										<Icon className="size-3.5 shrink-0" style={{ color: "var(--color-primary)" }} />
										{label}
									</a>
								))}
							</div>
						</div>

						{NAV_LINKS.map(({ label, href }) => (
							<a
								key={label}
								href={href}
								className="text-sm py-2.5 px-3 rounded-lg border-b border-border/40 last:border-0 transition-all duration-200"
								style={
									pathname === href
										? {
												color: "var(--color-primary)",
												fontWeight: 500,
												background: "color-mix(in srgb, var(--color-primary) 6%, transparent)",
											}
										: { color: "var(--color-muted-foreground)" }
								}>
								{label}
							</a>
						))}
						<div className="flex gap-2 pt-3">
							<Button variant="outline" size="sm" asChild className="flex-1 hover:border-primary/40 hover:text-primary transition-all">
								<a href="/auth/signin">Log in</a>
							</Button>
							<Button size="sm" asChild className="flex-1 shadow-md shadow-primary/20 hover:shadow-primary/30">
								<a href="/auth/signup">Free Trial</a>
							</Button>
						</div>
					</div>
				)}
			</header>

			{/* ── PAGE CONTENT ── */}
			<main className="relative z-10 flex-1 pt-16">{children}</main>

			{/* ── FOOTER ── */}
			<footer className="relative z-10 overflow-hidden">
				{/* Top border with primary glow */}
				<div
					className="absolute top-0 inset-x-0 h-px"
					style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 35%, transparent), transparent)" }}
				/>

				{/* Background */}
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						background:
							"linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 3%, transparent) 0%, color-mix(in srgb, var(--color-muted) 8%, transparent) 100%)",
					}}
				/>

				{/* Dot grid decoration */}
				<div
					className="absolute inset-0 opacity-[0.015] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
				/>

				{/* Orb top-right */}
				<div
					className="absolute top-0 right-0 size-80 rounded-full blur-[120px] pointer-events-none opacity-40"
					style={{ background: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}
				/>

				<div className="relative container mx-auto px-4 pt-14 pb-10">
					<div className="grid sm:grid-cols-2 md:grid-cols-6 gap-8 mb-12">
						{/* Brand column */}
						<div className="md:col-span-1">
							<a href="/" className="flex items-center gap-2.5 group mb-4 w-fit">
								<img src="/logo.png" alt="Pulse Logo" height={300} className="h-8" />
							</a>
							<p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
								Automate support, resolve faster, and scale effortlessly.
							</p>
						</div>

						{/* Link columns */}
						{FOOTER_COLS.map((col) => (
							<div key={col.heading}>
								<h4 className="font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: "var(--color-primary)" }}>
									{col.heading}
								</h4>
								<ul className="space-y-2.5">
									{col.links.map(({ label, href }) => (
										<li key={label}>
											<a
												href={href}
												className="text-sm transition-all duration-200 hover:translate-x-0.5 inline-block"
												style={
													pathname === href
														? { color: "var(--color-foreground)", fontWeight: 500 }
														: { color: "var(--color-muted-foreground)" }
												}
												onMouseEnter={(e) => {
													(e.currentTarget as HTMLElement).style.color = "var(--color-primary)";
												}}
												onMouseLeave={(e) => {
													(e.currentTarget as HTMLElement).style.color =
														pathname === href ? "var(--color-foreground)" : "var(--color-muted-foreground)";
												}}>
												{label}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					{/* Bottom bar */}
					<div
						className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground"
						style={{ borderTop: "1px solid color-mix(in srgb, var(--color-primary) 10%, var(--color-border))" }}>
						<span>© 2025 Pulse. All rights reserved.</span>
						<span>All trademarks are the property of their respective owners.</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
