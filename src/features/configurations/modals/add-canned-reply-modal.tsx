import { FormModal } from "@/shared/components";
import { CannedReplyForm } from "../forms/canned-reply-form";
import { type CannedReplyFormValues } from "../schemas/config.schema";

interface AddCannedReplyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (values: CannedReplyFormValues) => void;
}

export function AddCannedReplyModal({ open, onOpenChange, onConfirm }: AddCannedReplyModalProps) {
	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Add Canned Reply"
			description="Create a reusable response template with variables"
			maxWidth="sm:max-w-lg">
			<CannedReplyForm
				submitLabel="Create Reply"
				onSubmit={(values) => {
					onConfirm(values);
					onOpenChange(false);
				}}
				onCancel={() => onOpenChange(false)}
			/>
		</FormModal>
	);
}
