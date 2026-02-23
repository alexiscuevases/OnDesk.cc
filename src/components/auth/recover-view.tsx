import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Headset, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export default function RecoverView() {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("[v0] Password recovery requested for:", email);
		setIsSubmitted(true);
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
			{/* Background decoration */}
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
			<div className="absolute top-20 left-1/2 -translate-x-1/2 size-96 bg-primary/20 rounded-full blur-[128px] opacity-30" />
			<div className="absolute bottom-20 left-1/2 -translate-x-1/2 size-96 bg-primary/10 rounded-full blur-[128px] opacity-30" />

			{/* Back to sign in */}
			<Link
				to="/auth/signin"
				className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
				<ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
				Back to sign in
			</Link>

			{/* Recovery card */}
			<div className="relative w-full max-w-md">
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

					{!isSubmitted ? (
						<>
							{/* Header */}
							<div className="text-center mb-8">
								<h1 className="text-3xl font-bold mb-2">Reset password</h1>
								<p className="text-muted-foreground">Enter your email address and we'll send you a link to reset your password</p>
							</div>

							{/* Recovery form */}
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email">Email address</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
										<Input
											id="email"
											type="email"
											placeholder="you@example.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="pl-10"
											required
										/>
									</div>
								</div>

								<Button type="submit" className="w-full" size="lg">
									Send recovery link
								</Button>
							</form>

							{/* Additional info */}
							<div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
								<p className="text-sm text-muted-foreground">
									We'll send you an email with instructions to reset your password. The link will be valid for 1 hour.
								</p>
							</div>
						</>
					) : (
						<>
							{/* Success state */}
							<div className="text-center mb-8">
								<div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
									<CheckCircle2 className="size-8 text-primary" />
								</div>
								<h1 className="text-3xl font-bold mb-2">Check your email</h1>
								<p className="text-muted-foreground">We've sent a password recovery link to</p>
								<p className="text-foreground font-medium mt-2">{email}</p>
							</div>

							{/* Instructions */}
							<div className="space-y-4 mb-6">
								<div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
									<div className="flex gap-3">
										<div className="flex-shrink-0 size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
											1
										</div>
										<p className="text-sm text-muted-foreground">Open the email we sent to your inbox</p>
									</div>
									<div className="flex gap-3">
										<div className="flex-shrink-0 size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
											2
										</div>
										<p className="text-sm text-muted-foreground">Click the recovery link (valid for 1 hour)</p>
									</div>
									<div className="flex gap-3">
										<div className="flex-shrink-0 size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
											3
										</div>
										<p className="text-sm text-muted-foreground">Set your new password</p>
									</div>
								</div>

								<p className="text-center text-sm text-muted-foreground">
									Didn't receive the email?{" "}
									<button
										type="button"
										onClick={() => setIsSubmitted(false)}
										className="text-primary hover:text-primary/80 font-medium transition-colors">
										Try again
									</button>
								</p>
							</div>

							<Button asChild className="w-full" size="lg">
								<Link to="/auth/signin">Back to sign in</Link>
							</Button>
						</>
					)}

					{/* Sign in link (only on initial form) */}
					{!isSubmitted && (
						<div className="mt-6 text-center text-sm">
							<span className="text-muted-foreground">Remember your password? </span>
							<Link to="/auth/signin" className="text-primary hover:text-primary/80 font-medium transition-colors">
								Sign in
							</Link>
						</div>
					)}
				</div>

				{/* Trust indicators */}
				<div className="mt-8 text-center text-sm text-muted-foreground">
					<p>Secured by Microsoft 365 • Your data is protected</p>
				</div>
			</div>
		</div>
	);
}
