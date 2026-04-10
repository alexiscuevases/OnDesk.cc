import { AuthLayout } from "./auth-layout";
import { AuthOAuthBlock } from "./auth-oauth-block";
import { SignUpForm } from "../forms/sign-up-form";
import type { SignUpFormValues } from "../schemas/auth.schema";
import { useRegisterMutation } from "../hooks/use-auth-mutations";

export default function SignUpView() {
	const registerMutation = useRegisterMutation();

	function handleSignUp(values: SignUpFormValues) {
		registerMutation.mutate({
			name: values.name,
			email: values.email,
			password: values.password,
		});
	}

	return (
		<AuthLayout orbVariant="right-left" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Start your free trial</h1>
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
