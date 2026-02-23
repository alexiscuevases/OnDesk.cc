import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { cannedReplySchema, type CannedReplyFormValues } from "../schemas/config.schema";

interface CannedReplyFormProps {
	defaultValues?: Partial<CannedReplyFormValues>;
	onSubmit: (values: CannedReplyFormValues) => void;
	onCancel: () => void;
	submitLabel: string;
}

export function CannedReplyForm({ defaultValues, onSubmit, onCancel, submitLabel }: CannedReplyFormProps) {
	const form = useForm({
		defaultValues: {
			title: defaultValues?.title ?? "",
			shortcut: defaultValues?.shortcut ?? "",
			content: defaultValues?.content ?? "",
		},
		onSubmit: async ({ value }) => onSubmit(value),
		validators: { onChange: cannedReplySchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}>
			<div className="grid gap-4 py-4">
				<form.Field name="title">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="reply-title" className="text-xs font-medium">
								Title
							</Label>
							<Input
								id="reply-title"
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

				<form.Field name="shortcut">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="reply-shortcut" className="text-xs font-medium">
								Shortcut
							</Label>
							<Input
								id="reply-shortcut"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="/ack"
								className="h-9 rounded-lg font-mono"
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
							<Label className="text-xs font-medium">Content</Label>
							<TiptapEditor
								content={field.state.value}
								onChange={field.handleChange}
								placeholder="Enter the canned reply content..."
								minHeight="min-h-[128px]"
							/>
							{field.state.meta.errors[0] && (
								<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
							)}
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
