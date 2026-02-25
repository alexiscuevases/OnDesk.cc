import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Add New Team</DialogTitle>
					<DialogDescription>Create a new support team</DialogDescription>
				</DialogHeader>
				<TeamForm
					agents={agents}
					submitLabel="Create Team"
					onSubmit={(values) => onConfirm(values)}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
