import { AuthLayout } from "./auth-layout";
import { AuthOAuthBlock } from "./auth-oauth-block";
import { SignUpForm } from "../forms/sign-up-form";
import type { SignUpFormValues } from "../schemas/auth.schema";

export default function SignUpView() {
	function handleSignUp(values: SignUpFormValues) {
		console.log("[v0] Sign up attempt:", values);
	}

	return (
		<AuthLayout
			orbVariant="right-left"
			backLink={{ to: "/auth/signin", label: "Back to sign in" }}
			footer={
				<div className="space-y-2">
					<p className="text-sm text-muted-foreground">Join 50,000+ teams delivering exceptional support</p>
					<p className="text-xs text-muted-foreground">Secured by Microsoft 365 • Enterprise-grade encryption</p>
				</div>
			}>
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Start your free trial</h1>
				<p className="text-muted-foreground">14 days free. No credit card required.</p>
			</div>

			<AuthOAuthBlock mode="signup" />

			<SignUpForm onSubmit={handleSignUp} />
		</AuthLayout>
	);
}
