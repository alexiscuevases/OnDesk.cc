import type { ReactNode } from "react";
import { Headset, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";

type OrbVariant = "left-right" | "right-left" | "center";

interface AuthLayoutProps {
	children: ReactNode;
	backLink?: { to: "/auth/signin" | "/auth/signup" | "/auth/recover"; label: string };
	footer?: ReactNode;
	orbVariant?: OrbVariant;
}

export function AuthLayout({ children, backLink, footer }: AuthLayoutProps) {
	const [visible, setVisible] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

	useEffect(() => {
		const id = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);

	const onMove = useCallback((e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY }), []);
	useEffect(() => {
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, [onMove]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
			{/* Gradient base */}
			<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4 pointer-events-none" />

			{/* Dot grid — matches landing */}
			<div
				className="absolute inset-0 opacity-[0.025] pointer-events-none"
				style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
			/>

			{/* Mouse glow */}
			<div
				className="absolute size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] transition-all duration-700 pointer-events-none"
				style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
			/>

			{/* Static accent orbs */}
			<div
				className="absolute top-[-80px] right-[-80px] size-[500px] rounded-full blur-[120px] pointer-events-none"
				style={{ background: "color-mix(in srgb, var(--color-primary) 18%, transparent)" }}
			/>
			<div
				className="absolute bottom-[-80px] left-[-80px] size-[400px] rounded-full blur-[100px] pointer-events-none"
				style={{ background: "color-mix(in srgb, var(--color-accent) 14%, transparent)" }}
			/>

			{/* Back link */}
			{backLink && (
				<Link
					to={backLink.to}
					className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 group z-10">
					<ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform duration-200" />
					{backLink.label}
				</Link>
			)}

			{/* Home link top-right */}
			<a href="/" className="absolute top-6 right-6 text-xs text-muted-foreground hover:text-foreground transition-colors z-10 hidden sm:block">
				← Back to site
			</a>

			{/* Card wrapper with entry animation */}
			<div className={`relative w-full max-w-md transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				{/* Card glow ring */}
				<div
					className="absolute -inset-px rounded-[18px] pointer-events-none"
					style={{
						background:
							"linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 30%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))",
						opacity: 0.6,
					}}
				/>

				{/* Card */}
				<div
					className="relative rounded-2xl p-8"
					style={{
						background: "var(--color-card)",
						border: "1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border))",
						boxShadow: "0 32px 80px -12px color-mix(in srgb, var(--color-primary) 18%, transparent), 0 4px 24px -4px rgba(0,0,0,0.1)",
					}}>
					{/* Logo */}
					<div className="flex items-center justify-center gap-2.5 mb-8">
						<div
							className="size-11 rounded-xl flex items-center justify-center shadow-lg"
							style={{
								background: "var(--color-primary)",
								boxShadow: "0 8px 24px -4px color-mix(in srgb, var(--color-primary) 50%, transparent)",
							}}>
							<Headset className="size-6 text-primary-foreground" />
						</div>
						<div className="flex flex-col items-start">
							<span className="text-xl font-bold leading-none">OnDesk</span>
							<span className="text-[10px] text-muted-foreground leading-none mt-0.5">Microsoft 365</span>
						</div>
					</div>

					{children}
				</div>

				{/* Footer */}
				{footer && (
					<div
						className={`mt-6 text-center transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}
