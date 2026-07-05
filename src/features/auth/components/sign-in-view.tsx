import { Link } from "@tanstack/react-router";
import { AuthLayout } from "./auth-layout";
import { AuthOAuthBlock } from "./auth-oauth-block";
import { SignInForm } from "../forms/sign-in-form";
import type { SignInFormValues } from "../schemas/auth.schema";
import { useLoginMutation } from "../hooks/use-auth-mutations";
import { useOAuthErrorToast } from "../hooks/use-oauth-error-toast";

export default function SignInView() {
	const loginMutation = useLoginMutation();
	useOAuthErrorToast();

	function handleSignIn(values: SignInFormValues) {
		loginMutation.mutate({
			email: values.email,
			password: values.password,
			rememberMe: values.rememberMe,
		});
	}

	return (
		<AuthLayout code="SIGN_IN" backLink={{ to: "/", label: "Back to home" }}>
			<div className="mb-8">
				<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-3">
					01 — AUTHENTICATE<span className="blink-cursor">_</span>
				</p>
				<h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Welcome back</h1>
				<p className="text-muted-foreground">Sign in to access your support dashboard.</p>
			</div>

			<AuthOAuthBlock mode="signin" />

			<SignInForm
				onSubmit={handleSignIn}
				isLoading={loginMutation.isPending}
				error={loginMutation.error?.message ?? null}
			/>

			<div className="mt-8 pt-5 border-t border-border text-sm">
				<span className="text-muted-foreground">Don't have an account? </span>
				<Link to="/auth/signup" className="text-primary hover:text-accent font-semibold transition-colors">
					Sign up for free
				</Link>
			</div>
		</AuthLayout>
	);
}
