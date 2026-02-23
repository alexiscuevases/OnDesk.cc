import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { agentSchema, type AgentFormValues } from "../schemas/config.schema";

interface AgentFormProps {
	defaultValues?: Partial<AgentFormValues>;
	emailDisabled?: boolean;
	onSubmit: (values: AgentFormValues) => void;
	onCancel: () => void;
	submitLabel: string;
}

export function AgentForm({ defaultValues, emailDisabled, onSubmit, onCancel, submitLabel }: AgentFormProps) {
	const form = useForm({
		defaultValues: {
			email: defaultValues?.email ?? "",
			role: defaultValues?.role ?? ("Agent" as const),
		},
		onSubmit: async ({ value }) => onSubmit(value as AgentFormValues),
		validators: { onChange: agentSchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}>
			<div className="grid gap-4 py-4">
				<form.Field name="email">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="agent-email" className="text-xs font-medium">
								Email Address
							</Label>
							<Input
								id="agent-email"
								type="email"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								disabled={emailDisabled}
								className="h-9 rounded-lg"
							/>
							{field.state.meta.errors[0] && (
								<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="role">
					{(field) => (
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Role</Label>
							<Select value={field.state.value} onValueChange={(v) => field.handleChange(v as AgentFormValues["role"])}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Admin">Admin</SelectItem>
									<SelectItem value="Senior Agent">Senior Agent</SelectItem>
									<SelectItem value="Agent">Agent</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}
				</form.Field>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel} className="rounded-lg text-xs">
					Cancel
				</Button>
				<form.Subscribe selector={(s) => s.canSubmit}>
					{(canSubmit) => (
						<Button type="submit" disabled={!canSubmit} className="rounded-lg text-xs font-semibold">
							{submitLabel}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
