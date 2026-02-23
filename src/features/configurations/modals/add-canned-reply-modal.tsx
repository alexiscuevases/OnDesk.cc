import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CannedReplyForm } from "../forms/canned-reply-form";
import { type CannedReplyFormValues } from "../schemas/config.schema";

interface AddCannedReplyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (values: CannedReplyFormValues) => void;
}

export function AddCannedReplyModal({ open, onOpenChange, onConfirm }: AddCannedReplyModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Add Canned Reply</DialogTitle>
					<DialogDescription>Create a reusable response template with variables</DialogDescription>
				</DialogHeader>
				<CannedReplyForm
					submitLabel="Create Reply"
					onSubmit={(values) => {
						onConfirm(values);
						onOpenChange(false);
					}}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
