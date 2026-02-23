import type { ReactNode } from "react";
import { Headset, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

type OrbVariant = "left-right" | "right-left" | "center";

const orbPositions: Record<OrbVariant, { orb1: string; orb2: string }> = {
	"left-right": {
		orb1: "top-20 left-20",
		orb2: "bottom-20 right-20",
	},
	"right-left": {
		orb1: "top-20 right-20",
		orb2: "bottom-20 left-20",
	},
	center: {
		orb1: "top-20 left-1/2 -translate-x-1/2",
		orb2: "bottom-20 left-1/2 -translate-x-1/2",
	},
};

interface AuthLayoutProps {
	children: ReactNode;
	backLink?: { to: "/auth/signin" | "/auth/signup" | "/auth/recover"; label: string };
	footer?: ReactNode;
	orbVariant?: OrbVariant;
}

export function AuthLayout({ children, backLink, footer, orbVariant = "left-right" }: AuthLayoutProps) {
	const orbs = orbPositions[orbVariant];

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
			{/* Background grid */}
			<div className="absolute inset-0 opacity-[0.02]">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
						backgroundSize: "64px 64px",
					}}
				/>
			</div>

			{/* Gradient orbs */}
			<div className={`absolute ${orbs.orb1} size-96 bg-primary/20 rounded-full blur-[128px] opacity-30`} />
			<div className={`absolute ${orbs.orb2} size-96 bg-primary/10 rounded-full blur-[128px] opacity-30`} />

			{/* Back link */}
			{backLink && (
				<Link
					to={backLink.to}
					className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
					<ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
					{backLink.label}
				</Link>
			)}

			<div className="relative w-full max-w-md">
				{/* Card */}
				<div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-primary/5">
					{/* Logo */}
					<div className="flex items-center justify-center gap-2 mb-8">
						<div className="size-10 rounded-xl bg-primary flex items-center justify-center">
							<Headset className="size-6 text-primary-foreground" />
						</div>
						<div className="flex flex-col items-start">
							<span className="text-xl font-bold leading-none">SupportDesk</span>
							<span className="text-[10px] text-muted-foreground leading-none">Microsoft 365</span>
						</div>
					</div>

					{children}
				</div>

				{/* Footer */}
				{footer && <div className="mt-8 text-center">{footer}</div>}
			</div>
		</div>
	);
}
