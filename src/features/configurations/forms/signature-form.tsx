import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { signatureSchema, type SignatureFormValues } from "../schemas/config.schema";

interface SignatureFormProps {
	defaultValues?: Partial<SignatureFormValues>;
	onSubmit: (values: SignatureFormValues) => void;
	onCancel: () => void;
	submitLabel: string;
}

export function SignatureForm({ defaultValues, onSubmit, onCancel, submitLabel }: SignatureFormProps) {
	const form = useForm({
		defaultValues: {
			name: defaultValues?.name ?? "",
			content: defaultValues?.content ?? "",
			isDefault: defaultValues?.isDefault ?? false,
		},
		onSubmit: async ({ value }) => onSubmit(value),
		validators: { onChange: signatureSchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}>
			<div className="grid gap-4 py-4">
				<form.Field name="name">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="sig-name" className="text-xs font-medium">
								Signature Name
							</Label>
							<Input
								id="sig-name"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								className="h-9 rounded-lg"
							/>
							{field.state.meta.errors[0] && (
								<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="content">
					{(field) => (
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Signature Content</Label>
							<TiptapEditor
								content={field.state.value}
								onChange={field.handleChange}
								placeholder="Enter your signature..."
								minHeight="min-h-[128px]"
							/>
							{field.state.meta.errors[0] && (
								<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="isDefault">
					{(field) => (
						<div className="flex items-center gap-2">
							<Checkbox
								id="sig-default"
								checked={field.state.value}
								onCheckedChange={(checked) => field.handleChange(checked as boolean)}
							/>
							<Label htmlFor="sig-default" className="text-xs font-medium cursor-pointer">
								Set as default signature
							</Label>
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
