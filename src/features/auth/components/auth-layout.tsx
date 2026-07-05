import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PulseLine } from "@/features/frontend/shared";

type OrbVariant = "left-right" | "right-left" | "center";

interface AuthLayoutProps {
	children: ReactNode;
	backLink?: { to: "/" | "/auth/signin"; label: string };
	/** Kept for call-site compatibility; no longer used by the editorial layout. */
	orbVariant?: OrbVariant;
	/** Mono screen code shown in the panel headers, e.g. `SIGN_IN`. */
	code?: string;
}

const TELEMETRY = [
	["UPTIME", "99.99%"],
	["AI-RESOLVED", "68%"],
	["ENCRYPTION", "TLS 1.3"],
	["LATENCY", "0.3S"],
] as const;

export function AuthLayout({ children, backLink, code = "AUTH" }: AuthLayoutProps) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const id = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);

	return (
		<div className="min-h-screen bg-background flex">
			{/* ── Left: dark console panel ── */}
			<aside
				className="hidden lg:flex flex-col w-[44%] max-w-2xl shrink-0 text-white relative overflow-hidden border-r border-border"
				style={{ background: "var(--pulse-ink)" }}>
				{/* header row */}
				<div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
					<span className="font-mono text-[11px] tracking-[0.2em] text-white/60">
						PULSE://{code}
						<span className="blink-cursor text-(--pulse-lime)">▌</span>
					</span>
					<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest" style={{ color: "var(--pulse-lime)" }}>
						<span className="size-1.5 rounded-full animate-pulse" style={{ background: "var(--pulse-lime)" }} />
						SECURE CHANNEL
					</span>
				</div>

				{/* brand statement */}
				<div className="flex-1 flex flex-col justify-center px-8 xl:px-12">
					<Link to="/" className="inline-block font-black text-3xl tracking-tighter mb-6 w-fit">
						Pulse<span style={{ color: "var(--pulse-lime)" }}>.</span>
					</Link>
					<p className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-balance mb-10 max-w-sm">
						Support that never <span style={{ color: "var(--pulse-lime)" }}>skips a beat.</span>
					</p>

					<div className="max-w-sm" style={{ color: "var(--pulse-lime)" }}>
						<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
					</div>

					{/* telemetry rows */}
					<div className="mt-10 max-w-sm divide-y divide-white/10 border-y border-white/10">
						{TELEMETRY.map(([label, value]) => (
							<div key={label} className="flex items-center justify-between py-2.5 font-mono text-[10px] tracking-[0.2em]">
								<span className="text-white/40">{label}</span>
								<span style={{ color: "var(--pulse-lime)" }}>{value}</span>
							</div>
						))}
					</div>
				</div>

				{/* giant outline wordmark */}
				<div className="overflow-hidden select-none" aria-hidden="true">
					<div
						className="font-black tracking-tighter leading-[0.75] text-[9rem] xl:text-[11rem] -mb-[0.18em] px-6"
						style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.10)" }}>
						PULSE
					</div>
				</div>
			</aside>

			{/* ── Right: form panel ── */}
			<main className="flex-1 flex flex-col relative overflow-hidden">
				{/* faint dot grid */}
				<div
					className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
				/>

				{/* top bar */}
				<div className="relative flex items-center justify-between px-6 md:px-10 py-4 border-b border-border">
					{backLink ? (
						<Link
							to={backLink.to}
							className="group flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-muted-foreground hover:text-primary transition-colors duration-200">
							<ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
							{backLink.label}
						</Link>
					) : (
						<span />
					)}
					<span className="lg:hidden">
						<img src="/logo.png" alt="Pulse Logo" height={300} className="h-7" />
					</span>
					<span className="hidden lg:flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
						<span className="size-1.5 rounded-full bg-accent animate-pulse" />
						{code}
					</span>
				</div>

				{/* content */}
				<div className="relative flex-1 flex items-center justify-center px-6 py-12">
					<div className={`w-full max-w-md transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
						{children}
					</div>
				</div>

				{/* bottom bar */}
				<div className="relative flex items-center justify-between px-6 md:px-10 py-4 border-t border-border font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60">
					<span>© 2026 PULSE — SECURE AUTH</span>
					<span>
						SIG.END<span className="blink-cursor text-accent">▌</span>
					</span>
				</div>
			</main>
		</div>
	);
}
