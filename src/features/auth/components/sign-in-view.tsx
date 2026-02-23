import { Link } from "@tanstack/react-router";
import { AuthLayout } from "./auth-layout";
import { AuthOAuthBlock } from "./auth-oauth-block";
import { SignInForm } from "../forms/sign-in-form";
import type { SignInFormValues } from "../schemas/auth.schema";

export default function SignInView() {
	function handleSignIn(values: SignInFormValues) {
		console.log("[v0] Sign in attempt:", values);
	}

	return (
		<AuthLayout
			orbVariant="left-right"
			backLink={{ to: "/auth/signin", label: "Back to home" }}
			footer={<p className="text-sm text-muted-foreground">Secured by Microsoft 365 • Enterprise-grade encryption</p>}>
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Welcome back</h1>
				<p className="text-muted-foreground">Sign in to access your support dashboard</p>
			</div>

			<AuthOAuthBlock mode="signin" />

			<SignInForm onSubmit={handleSignIn} />

			<div className="mt-6 text-center text-sm">
				<span className="text-muted-foreground">Don't have an account? </span>
				<Link to="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
					Sign up for free
				</Link>
			</div>
		</AuthLayout>
	);
}
