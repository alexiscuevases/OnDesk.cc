import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-base">Edit Ticket Title</DialogTitle>
					<DialogDescription className="text-xs">Update the title/subject for this ticket</DialogDescription>
				</DialogHeader>
				<EditTitleForm
					defaultTitle={currentTitle}
					onSubmit={handleSubmit}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
