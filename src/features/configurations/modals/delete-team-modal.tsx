import { ConfirmDeleteModal } from "@/shared/components";

interface DeleteTeamModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	team: { id: string; name: string } | null;
	onConfirm: () => void;
}

export function DeleteTeamModal({ open, onOpenChange, team, onConfirm }: DeleteTeamModalProps) {
	return (
		<ConfirmDeleteModal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Team?"
			description={<>Are you sure you want to delete {team?.name}? Existing tickets will need to be reassigned.</>}
			confirmLabel="Delete Team"
			onConfirm={onConfirm}
		/>
	);
}
