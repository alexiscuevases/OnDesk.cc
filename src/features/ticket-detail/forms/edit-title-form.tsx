import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { editTitleSchema, type EditTitleFormValues } from "../schemas/ticket-detail.schema";

interface EditTitleFormProps {
	defaultTitle: string;
	onSubmit: (values: EditTitleFormValues) => void;
	onCancel: () => void;
}

export function EditTitleForm({ defaultTitle, onSubmit, onCancel }: EditTitleFormProps) {
	const form = useForm({
		defaultValues: { title: defaultTitle },
		onSubmit: async ({ value }) => onSubmit(value),
		validators: { onChange: editTitleSchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}>
			<div className="grid gap-4 py-2">
				<form.Field name="title">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="ticket-title" className="text-xs font-medium">
								Title
							</Label>
							<Input
								id="ticket-title"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="Enter ticket title..."
								className="h-9 rounded-lg"
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
							)}
						</div>
					)}
				</form.Field>
			</div>
			<DialogFooter className="gap-2">
				<Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
					Cancel
				</Button>
				<form.Subscribe selector={(s) => s.canSubmit}>
					{(canSubmit) => (
						<Button type="submit" disabled={!canSubmit} className="rounded-lg">
							Save Title
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
