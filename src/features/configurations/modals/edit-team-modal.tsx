import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamForm } from "../forms/team-form";
import { type TeamFormValues } from "../schemas/config.schema";
import { type Agent } from "@/lib/data";
import { type ConfigTeam } from "@/types/index";

interface EditTeamModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	team: ConfigTeam | null;
	agents: Agent[];
	onConfirm: (values: TeamFormValues) => void;
}

export function EditTeamModal({ open, onOpenChange, team, agents, onConfirm }: EditTeamModalProps) {
	if (!team) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit Team</DialogTitle>
					<DialogDescription>Update team information</DialogDescription>
				</DialogHeader>
				<TeamForm
					key={team.id}
					defaultValues={{
						name: team.name,
						description: team.description,
						image: team.image,
						leaderId: team.leaderId || "",
						memberIds: team.memberIds || [],
						autoAssign: team.autoAssign,
					}}
					agents={agents}
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
