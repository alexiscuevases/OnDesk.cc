import { Button } from "@/components/ui/button";
import { Headset, ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_LINKS = [
	{ label: "Features", href: "/features" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Integrations", href: "/integrations" },
	{ label: "Changelog", href: "/changelog" },
];

const FOOTER_COLS = [
	{
		heading: "Product",
		links: [
			{ label: "Features", href: "/features" },
			{ label: "Pricing", href: "/pricing" },
			{ label: "Integrations", href: "/integrations" },
			{ label: "Changelog", href: "/changelog" },
		],
	},
	{
		heading: "Resources",
		links: [
			{ label: "Blog", href: "/blog" },
			{ label: "Help Center", href: "/help" },
			{ label: "Customers", href: "/customers" },
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
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const pathname = typeof window !== "undefined" ? window.location.pathname : "";

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
	}, [pathname]);

	return (
		<div className="relative min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
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
				className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"}`}>
				<nav className="container mx-auto px-4 h-16 flex items-center justify-between">
					<a href="/" className="flex items-center gap-2 group shrink-0">
						<div className="size-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
							<Headset className="size-5 text-primary-foreground" />
						</div>
						<div className="flex flex-col leading-none">
							<span className="text-base font-bold">SupportDesk</span>
							<span className="text-[10px] text-muted-foreground">Microsoft 365</span>
						</div>
					</a>

					<div className="hidden md:flex items-center gap-7">
						{NAV_LINKS.map(({ label, href }) => (
							<a
								key={label}
								href={href}
								className={`text-sm transition-colors ${pathname === href ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
								{label}
							</a>
						))}
					</div>

					<div className="hidden md:flex items-center gap-3">
						<Button variant="ghost" size="sm" asChild>
							<a href="/signin">Log in</a>
						</Button>
						<Button size="sm" asChild className="group">
							<a href="/signup">
								Free Trial
								<ArrowRight className="ml-1.5 size-3.5 group-hover:translate-x-0.5 transition-transform" />
							</a>
						</Button>
					</div>

					<button className="md:hidden p-2 -mr-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
						{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					</button>
				</nav>

				{mobileOpen && (
					<div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-4 pb-4 flex flex-col gap-1">
						{NAV_LINKS.map(({ label, href }) => (
							<a
								key={label}
								href={href}
								className={`text-sm py-2.5 border-b border-border/50 last:border-0 transition-colors ${pathname === href ? "text-foreground font-medium" : "text-muted-foreground"}`}>
								{label}
							</a>
						))}
						<div className="flex gap-2 pt-3">
							<Button variant="outline" size="sm" asChild className="flex-1">
								<a href="/signin">Log in</a>
							</Button>
							<Button size="sm" asChild className="flex-1">
								<a href="/signup">Free Trial</a>
							</Button>
						</div>
					</div>
				)}
			</header>

			{/* ── PAGE CONTENT ── */}
			<main className="relative z-10 flex-1 pt-16">{children}</main>

			{/* ── FOOTER ── */}
			<footer className="relative z-10 border-t border-border bg-muted/10">
				<div className="container mx-auto px-4 py-12">
					<div className="grid sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
						<div>
							<div className="flex items-center gap-2 mb-3">
								<div className="size-8 rounded-lg bg-primary flex items-center justify-center">
									<Headset className="size-4 text-primary-foreground" />
								</div>
								<div className="flex flex-col leading-none">
									<span className="text-sm font-bold">SupportDesk</span>
									<span className="text-[10px] text-muted-foreground">Microsoft 365</span>
								</div>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed">AI-powered ticket management built for Microsoft 365 organizations.</p>
						</div>
						{FOOTER_COLS.map((col) => (
							<div key={col.heading}>
								<h4 className="font-semibold text-sm mb-4">{col.heading}</h4>
								<ul className="space-y-2">
									{col.links.map(({ label, href }) => (
										<li key={label}>
											<a
												href={href}
												className={`text-sm transition-colors ${pathname === href ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
												{label}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
					<div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
						<span>© 2024 SupportDesk 365. All rights reserved.</span>
						<span>Microsoft 365 is a trademark of Microsoft Corporation.</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
