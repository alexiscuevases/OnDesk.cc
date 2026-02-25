import { FormModal } from "@/shared/components";
import { TeamForm } from "../forms/team-form";
import { type TeamFormValues } from "../schemas/config.schema";
import type { WorkspaceMember } from "@/features/users/api/users-api";

interface AddTeamModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agents: WorkspaceMember[];
	onConfirm: (values: TeamFormValues) => void;
}

export function AddTeamModal({ open, onOpenChange, agents, onConfirm }: AddTeamModalProps) {
	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Add New Team"
			description="Create a new support team"
			maxWidth="sm:max-w-lg">
			<TeamForm
				agents={agents}
				submitLabel="Create Team"
				onSubmit={(values) => onConfirm(values)}
				onCancel={() => onOpenChange(false)}
			/>
		</FormModal>
	);
}
