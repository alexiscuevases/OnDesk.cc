import { ConfirmDeleteModal } from "@/shared/components";

interface DeleteCannedReplyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reply: { id: string; name: string } | null;
	onConfirm: () => void;
}

export function DeleteCannedReplyModal({ open, onOpenChange, reply, onConfirm }: DeleteCannedReplyModalProps) {
	return (
		<ConfirmDeleteModal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Canned Reply?"
			description={<>Are you sure you want to delete &quot;{reply?.name}&quot;? This action cannot be undone.</>}
			confirmLabel="Delete Reply"
			onConfirm={onConfirm}
		/>
	);
}
