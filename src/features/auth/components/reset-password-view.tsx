import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "./auth-layout";
import { ResetPasswordForm } from "../forms/reset-password-form";
import { apiResetPassword } from "../api/auth-api";
import type { ResetPasswordFormValues } from "../schemas/auth.schema";

interface ResetPasswordViewProps {
	token: string;
}

const CTA_BUTTON = "w-full h-12 rounded-none font-mono text-xs tracking-[0.15em] uppercase font-semibold";

export default function ResetPasswordView({ token }: ResetPasswordViewProps) {
	const [done, setDone] = useState(false);

	const resetMutation = useMutation({
		mutationFn: (values: ResetPasswordFormValues) => apiResetPassword(token, values.password),
		onSuccess: () => setDone(true),
	});

	if (!token) {
		return (
			<AuthLayout code="RESET" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
				<div className="mb-8">
					<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-destructive font-bold mb-4">
						✕ ERR — INVALID TOKEN<span className="blink-cursor">_</span>
					</p>
					<div className="inline-flex items-center justify-center size-14 border border-destructive/40 bg-destructive/5 mb-6">
						<AlertCircle className="size-7 text-destructive" />
					</div>
					<h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Invalid link</h1>
					<p className="text-muted-foreground">This password reset link is missing or invalid.</p>
				</div>
				<Button asChild className={CTA_BUTTON} size="lg">
					<Link to="/auth/recover">Request a new link</Link>
				</Button>
			</AuthLayout>
		);
	}

	if (done) {
		return (
			<AuthLayout code="RESET" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
				<div className="mb-8">
					<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-4">
						✓ CREDENTIALS UPDATED<span className="blink-cursor">_</span>
					</p>
					<div className="inline-flex items-center justify-center size-14 border border-accent/40 bg-accent/5 mb-6">
						<CheckCircle2 className="size-7 text-accent" />
					</div>
					<h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Password updated</h1>
					<p className="text-muted-foreground">Your password has been reset successfully.</p>
				</div>
				<Button asChild className={CTA_BUTTON} size="lg">
					<Link to="/auth/signin">Sign in with new password</Link>
				</Button>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout code="RESET" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
			<div className="mb-8">
				<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-3">
					01 — NEW CREDENTIALS<span className="blink-cursor">_</span>
				</p>
				<h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Set new password</h1>
				<p className="text-muted-foreground">Choose a strong password for your account.</p>
			</div>

			<ResetPasswordForm
				onSubmit={(values) => resetMutation.mutate(values)}
				isLoading={resetMutation.isPending}
				error={resetMutation.error?.message ?? null}
			/>
		</AuthLayout>
	);
}
