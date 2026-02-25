import { FormModal } from "@/shared/components";
import { TeamForm } from "../forms/team-form";
import { type TeamFormValues } from "../schemas/config.schema";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import { useTeamMembers } from "@/features/teams/hooks/use-team-queries";
import type { Team } from "@/features/teams/api/teams-api";

interface EditTeamModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	team: Team | null;
	agents: WorkspaceMember[];
	onConfirm: (values: TeamFormValues) => void;
}

function EditTeamModalInner({ open, onOpenChange, team, agents, onConfirm }: Omit<EditTeamModalProps, "team"> & { team: Team }) {
	const { data: members = [] } = useTeamMembers(team.id);

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Edit Team"
			description="Update team information"
			maxWidth="sm:max-w-lg">
			<TeamForm
				key={team.id + members.map((m) => m.id).join(",")}
				defaultValues={{
					name: team.name,
					description: team.description ?? "",
					logoUrl: team.logo_url ?? "",
					leaderId: team.leader_id ?? "",
					memberIds: members.map((m) => m.id),
				}}
				agents={agents}
				submitLabel="Save Changes"
				onSubmit={(values) => {
					onConfirm(values);
					onOpenChange(false);
				}}
				onCancel={() => onOpenChange(false)}
			/>
		</FormModal>
	);
}

export function EditTeamModal(props: EditTeamModalProps) {
	if (!props.team) return null;
	return <EditTeamModalInner {...props} team={props.team} />;
}
