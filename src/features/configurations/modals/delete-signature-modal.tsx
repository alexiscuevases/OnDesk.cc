import { ConfirmDeleteModal } from "@/shared/components";

interface DeleteSignatureModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	signature: { id: string; name: string } | null;
	onConfirm: () => void;
}

export function DeleteSignatureModal({ open, onOpenChange, signature, onConfirm }: DeleteSignatureModalProps) {
	return (
		<ConfirmDeleteModal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Signature?"
			description={<>Are you sure you want to delete &quot;{signature?.name}&quot;? This action cannot be undone.</>}
			confirmLabel="Delete Signature"
			onConfirm={onConfirm}
		/>
	);
}
