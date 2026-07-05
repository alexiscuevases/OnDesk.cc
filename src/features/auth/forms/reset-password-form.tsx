import { Lock } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas/auth.schema";

interface ResetPasswordFormProps {
	onSubmit: (values: ResetPasswordFormValues) => void;
	isLoading?: boolean;
	error?: string | null;
}

export function ResetPasswordForm({ onSubmit, isLoading = false, error = null }: ResetPasswordFormProps) {
	const form = useForm({
		defaultValues: { password: "", confirmPassword: "" },
		onSubmit: async ({ value }) => onSubmit(value),
		validators: { onChange: resetPasswordSchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4">
			<form.Field name="password">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="password">New password</Label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								id="password"
								type="password"
								placeholder="At least 8 characters"
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

			<form.Field name="confirmPassword">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm new password</Label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Repeat your password"
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

			{error && <p className="text-sm text-destructive text-center">{error}</p>}

			<Button
				type="submit"
				className="w-full h-12 rounded-none font-mono text-xs tracking-[0.15em] uppercase font-semibold"
				size="lg"
				disabled={isLoading}>
				{isLoading ? "Saving…" : "Set new password"}
			</Button>
		</form>
	);
}
