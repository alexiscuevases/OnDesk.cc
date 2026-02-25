import { FormModal } from "@/shared/components";
import { CannedReplyForm } from "../forms/canned-reply-form";
import { type CannedReplyFormValues } from "../schemas/config.schema";

interface EditCannedReplyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reply: { id: string; name: string; shortcut: string; content: string } | null;
	onConfirm: (values: CannedReplyFormValues) => void;
}

export function EditCannedReplyModal({ open, onOpenChange, reply, onConfirm }: EditCannedReplyModalProps) {
	if (!reply) return null;

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Edit Canned Reply"
			description="Update the response template"
			maxWidth="sm:max-w-lg">
			<CannedReplyForm
				key={reply.id}
				defaultValues={{ name: reply.name, shortcut: reply.shortcut, content: reply.content }}
				submitLabel="Save Changes"
				onSubmit={(values) => {
					onConfirm(values);
					onOpenChange(false);
				}}
				onCancel={() => onOpenChange(false)}
			/>
		</FormModal>
	);
}
