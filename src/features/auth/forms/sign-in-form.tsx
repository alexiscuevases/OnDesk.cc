import { Link } from "@tanstack/react-router";
import { Mail, Lock } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signInSchema, type SignInFormValues } from "../schemas/auth.schema";

interface SignInFormProps {
	onSubmit: (values: SignInFormValues) => void;
	isLoading?: boolean;
	error?: string | null;
}

export function SignInForm({ onSubmit, isLoading = false, error = null }: SignInFormProps) {
	const form = useForm({
		defaultValues: { email: "", password: "", rememberMe: false },
		onSubmit: async ({ value }) => onSubmit(value),
		validators: { onChange: signInSchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4">
			<form.Field name="email">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								className="pl-10"
							/>
						</div>
						{field.state.meta.errors.length > 0 && (
							<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Field name="password">
				{(field) => (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Link to="/auth/recover" className="text-sm text-primary hover:text-primary/80 transition-colors">
								Forgot password?
							</Link>
						</div>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								id="password"
								type="password"
								placeholder="Enter your password"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								className="pl-10"
							/>
						</div>
						{field.state.meta.errors.length > 0 && (
							<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Field name="rememberMe">
				{(field) => (
					<div className="flex items-center space-x-2">
						<Checkbox
							id="remember"
							checked={field.state.value}
							onCheckedChange={(checked) => field.handleChange(checked as boolean)}
						/>
						<Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
							Remember me for 30 days
						</Label>
					</div>
				)}
			</form.Field>

			{error && <p className="text-sm text-destructive text-center">{error}</p>}

			<Button type="submit" className="w-full" size="lg" disabled={isLoading}>
				{isLoading ? "Signing in..." : "Sign in"}
			</Button>
		</form>
	);
}
