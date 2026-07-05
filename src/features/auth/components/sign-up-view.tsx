import { AuthLayout } from "./auth-layout";
import { AuthOAuthBlock } from "./auth-oauth-block";
import { SignUpForm } from "../forms/sign-up-form";
import type { SignUpFormValues } from "../schemas/auth.schema";
import { useRegisterMutation } from "../hooks/use-auth-mutations";
import { useOAuthErrorToast } from "../hooks/use-oauth-error-toast";

export default function SignUpView() {
	const registerMutation = useRegisterMutation();
	useOAuthErrorToast();

	function handleSignUp(values: SignUpFormValues) {
		registerMutation.mutate({
			name: values.name,
			email: values.email,
			password: values.password,
		});
	}

	return (
		<AuthLayout code="SIGN_UP" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
			<div className="mb-8">
				<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-3">
					01 — DEPLOY · 14 DAYS FREE / NO CARD<span className="blink-cursor">_</span>
				</p>
				<h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Start your free trial</h1>
				<p className="text-muted-foreground">14 days free. No credit card required.</p>
			</div>

			<AuthOAuthBlock mode="signup" />

			<SignUpForm
				onSubmit={handleSignUp}
				isLoading={registerMutation.isPending}
				error={registerMutation.error?.message ?? null}
			/>
		</AuthLayout>
	);
}
