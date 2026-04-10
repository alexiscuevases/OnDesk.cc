import { Link } from "@tanstack/react-router";
import { AuthLayout } from "./auth-layout";
import { AuthOAuthBlock } from "./auth-oauth-block";
import { SignInForm } from "../forms/sign-in-form";
import type { SignInFormValues } from "../schemas/auth.schema";
import { useLoginMutation } from "../hooks/use-auth-mutations";

export default function SignInView() {
	const loginMutation = useLoginMutation();

	function handleSignIn(values: SignInFormValues) {
		loginMutation.mutate({
			email: values.email,
			password: values.password,
			rememberMe: values.rememberMe,
		});
	}

	return (
		<AuthLayout orbVariant="left-right" backLink={{ to: "/", label: "Back to home" }}>
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Welcome back</h1>
				<p className="text-muted-foreground">Sign in to access your support dashboard</p>
			</div>

			<AuthOAuthBlock mode="signin" />

			<SignInForm
				onSubmit={handleSignIn}
				isLoading={loginMutation.isPending}
				error={loginMutation.error?.message ?? null}
			/>

			<div className="mt-6 text-center text-sm">
				<span className="text-muted-foreground">Don't have an account? </span>
				<Link to="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
					Sign up for free
				</Link>
			</div>
		</AuthLayout>
	);
}
