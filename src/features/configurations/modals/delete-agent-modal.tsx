import { ConfirmDeleteModal } from "@/shared/components";

interface DeleteAgentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: { id: string; name: string } | null;
	onConfirm: () => void;
}

export function DeleteAgentModal({ open, onOpenChange, agent, onConfirm }: DeleteAgentModalProps) {
	return (
		<ConfirmDeleteModal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Agent?"
			description={<>Are you sure you want to remove {agent?.name}? This will unassign their tickets and remove their access.</>}
			confirmLabel="Delete Agent"
			onConfirm={onConfirm}
		/>
	);
}
