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

export default function ResetPasswordView({ token }: ResetPasswordViewProps) {
	const [done, setDone] = useState(false);

	const resetMutation = useMutation({
		mutationFn: (values: ResetPasswordFormValues) => apiResetPassword(token, values.password),
		onSuccess: () => setDone(true),
	});

	if (!token) {
		return (
			<AuthLayout orbVariant="center" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
				<div className="text-center">
					<div className="inline-flex items-center justify-center size-16 rounded-full bg-destructive/10 mb-6">
						<AlertCircle className="size-8 text-destructive" />
					</div>
					<h1 className="text-3xl font-bold mb-2">Invalid link</h1>
					<p className="text-muted-foreground mb-8">This password reset link is missing or invalid.</p>
					<Button asChild className="w-full" size="lg">
						<Link to="/auth/recover">Request a new link</Link>
					</Button>
				</div>
			</AuthLayout>
		);
	}

	if (done) {
		return (
			<AuthLayout orbVariant="center" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
						<CheckCircle2 className="size-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold mb-2">Password updated</h1>
					<p className="text-muted-foreground">Your password has been reset successfully.</p>
				</div>
				<Button asChild className="w-full h-11 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300" size="lg">
					<Link to="/auth/signin">Sign in with new password</Link>
				</Button>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout orbVariant="center" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Set new password</h1>
				<p className="text-muted-foreground">Choose a strong password for your account</p>
			</div>

			<ResetPasswordForm
				onSubmit={(values) => resetMutation.mutate(values)}
				isLoading={resetMutation.isPending}
				error={resetMutation.error?.message ?? null}
			/>
		</AuthLayout>
	);
}
