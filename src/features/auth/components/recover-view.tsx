import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "./auth-layout";
import { RecoverForm } from "../forms/recover-form";
import { apiForgotPassword } from "../api/auth-api";
import type { RecoverFormValues } from "../schemas/auth.schema";

export default function RecoverView() {
	const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

	const forgotMutation = useMutation({
		mutationFn: (email: string) => apiForgotPassword(email),
		onSuccess: (_, email) => setSubmittedEmail(email),
	});

	function handleRecover(values: RecoverFormValues) {
		forgotMutation.mutate(values.email);
	}

	return (
		<AuthLayout code="RECOVER" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
			{!submittedEmail ? (
				<>
					<div className="mb-8">
						<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-3">
							01 — PASSWORD RESET<span className="blink-cursor">_</span>
						</p>
						<h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Reset password</h1>
						<p className="text-muted-foreground">
							Enter your email address and we'll send you a link to reset your password.
						</p>
					</div>

					<RecoverForm
						onSubmit={handleRecover}
						isLoading={forgotMutation.isPending}
						error={forgotMutation.error?.message ?? null}
					/>

					<div className="mt-6 border border-border">
						<div className="px-4 py-2 border-b border-border">
							<span className="font-mono text-[9px] tracking-[0.25em] text-primary">NOTE</span>
						</div>
						<p className="px-4 py-3 text-sm text-muted-foreground">
							We'll send you an email with instructions to reset your password. The link will be valid for 1 hour.
						</p>
					</div>

					<div className="mt-8 pt-5 border-t border-border text-sm">
						<span className="text-muted-foreground">Remember your password? </span>
						<Link to="/auth/signin" className="text-primary hover:text-accent font-semibold transition-colors">
							Sign in
						</Link>
					</div>
				</>
			) : (
				<>
					<div className="mb-8">
						<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-4">
							✓ TRANSMISSION SENT<span className="blink-cursor">_</span>
						</p>
						<div className="inline-flex items-center justify-center size-14 border border-accent/40 bg-accent/5 mb-6">
							<CheckCircle2 className="size-7 text-accent" />
						</div>
						<h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Check your email</h1>
						<p className="text-muted-foreground">We've sent a password reset link to</p>
						<p className="font-mono text-sm text-foreground font-bold mt-2">{submittedEmail}</p>
					</div>

					<div className="border border-border divide-y divide-border mb-6">
						{[
							"Open the email we sent to your inbox",
							"Click the reset link (valid for 1 hour)",
							"Set your new password",
						].map((step, i) => (
							<div key={i} className="flex items-center gap-4 px-4 py-3">
								<span className="font-mono text-[10px] tracking-[0.2em] text-accent font-bold shrink-0">
									0{i + 1}
								</span>
								<p className="text-sm text-muted-foreground">{step}</p>
							</div>
						))}
					</div>

					<p className="text-sm text-muted-foreground mb-6">
						Didn't receive the email?{" "}
						<button
							type="button"
							onClick={() => {
								setSubmittedEmail(null);
								forgotMutation.reset();
							}}
							className="text-primary hover:text-accent font-semibold transition-colors">
							Try again
						</button>
					</p>

					<Button
						asChild
						className="w-full h-12 rounded-none font-mono text-xs tracking-[0.15em] uppercase font-semibold"
						size="lg">
						<Link to="/auth/signin">Back to sign in</Link>
					</Button>
				</>
			)}
		</AuthLayout>
	);
}
