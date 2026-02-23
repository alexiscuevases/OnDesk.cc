import { Mail } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recoverSchema, type RecoverFormValues } from "../schemas/auth.schema";

interface RecoverFormProps {
	onSubmit: (values: RecoverFormValues) => void;
}

export function RecoverForm({ onSubmit }: RecoverFormProps) {
	const form = useForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => onSubmit(value),
		validators: { onChange: recoverSchema },
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
						<Label htmlFor="email">Email address</Label>
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

			<Button type="submit" className="w-full" size="lg">
				Send recovery link
			</Button>
		</form>
	);
}
