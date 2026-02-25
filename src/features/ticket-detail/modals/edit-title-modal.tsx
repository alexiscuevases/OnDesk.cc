import { FormModal } from "@/shared/components";
import { EditTitleForm } from "../forms/edit-title-form";
import type { EditTitleFormValues } from "../schemas/ticket-detail.schema";

interface EditTitleModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentTitle: string;
	onSave: (title: string) => void;
}

export function EditTitleModal({ open, onOpenChange, currentTitle, onSave }: EditTitleModalProps) {
	function handleSubmit(values: EditTitleFormValues) {
		onSave(values.title);
		onOpenChange(false);
	}

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Edit Ticket Title"
			description="Update the title/subject for this ticket"
			maxWidth="sm:max-w-lg">
			<EditTitleForm
				defaultTitle={currentTitle}
				onSubmit={handleSubmit}
				onCancel={() => onOpenChange(false)}
			/>
		</FormModal>
	);
}
