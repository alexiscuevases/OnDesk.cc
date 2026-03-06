import { Link } from "@tanstack/react-router";
import { Mail, Lock, User } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signUpSchema, type SignUpFormValues } from "../schemas/auth.schema";

interface SignUpFormProps {
	onSubmit: (values: SignUpFormValues) => void;
	isLoading?: boolean;
	error?: string | null;
}

export function SignUpForm({ onSubmit, isLoading = false, error = null }: SignUpFormProps) {
	const form = useForm({
		defaultValues: { name: "", email: "", password: "", agreeToTerms: false },
		onSubmit: async ({ value }) => onSubmit(value),
		validators: { onChange: signUpSchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4">
			<form.Field name="name">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="name">Full Name</Label>
						<div className="relative">
							<User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								id="name"
								type="text"
								placeholder="John Doe"
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
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								id="password"
								type="password"
								placeholder="Create a strong password"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								className="pl-10"
							/>
						</div>
						{field.state.meta.errors.length > 0 ? (
							<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
						) : (
							<p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Field name="agreeToTerms">
				{(field) => (
					<div className="space-y-1 pt-2">
						<div className="flex items-start space-x-2">
							<Checkbox
								id="terms"
								checked={field.state.value}
								onCheckedChange={(checked) => field.handleChange(checked as boolean)}
							/>
							<Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
								I agree to the{" "}
								<span className="text-primary hover:text-primary/80 cursor-pointer">Terms of Service</span>
								{" "}and{" "}
								<span className="text-primary hover:text-primary/80 cursor-pointer">Privacy Policy</span>
							</Label>
						</div>
						{field.state.meta.errors.length > 0 && (
							<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
						)}
					</div>
				)}
			</form.Field>

			{error && <p className="text-sm text-destructive text-center">{error}</p>}

			<Button type="submit" className="w-full h-11 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300" size="lg" disabled={isLoading}>
				{isLoading ? "Creating account…" : "Create account"}
			</Button>

			<div className="mt-6 text-center text-sm">
				<span className="text-muted-foreground">Already have an account? </span>
				<Link to="/auth/signin" className="text-primary hover:text-primary/80 font-medium transition-colors">
					Sign in
				</Link>
			</div>
		</form>
	);
}
