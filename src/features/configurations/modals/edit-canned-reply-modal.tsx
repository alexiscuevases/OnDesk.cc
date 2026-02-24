import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CannedReplyForm } from "../forms/canned-reply-form";
import { type CannedReplyFormValues } from "../schemas/config.schema";
interface EditCannedReplyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reply: { id: string; title: string; shortcut: string; content: string } | null;
	onConfirm: (values: CannedReplyFormValues) => void;
}

export function EditCannedReplyModal({ open, onOpenChange, reply, onConfirm }: EditCannedReplyModalProps) {
	if (!reply) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit Canned Reply</DialogTitle>
					<DialogDescription>Update the response template</DialogDescription>
				</DialogHeader>
				<CannedReplyForm
					key={reply.id}
					defaultValues={{ title: reply.title, shortcut: reply.shortcut, content: reply.content }}
					submitLabel="Save Changes"
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
