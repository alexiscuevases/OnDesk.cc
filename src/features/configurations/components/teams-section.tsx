import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/context/workspace-context";
import { useTeams } from "@/features/teams/hooks/use-team-queries";
import { useCreateTeamMutation, useUpdateTeamMutation, useDeleteTeamMutation } from "@/features/teams/hooks/use-team-mutations";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";
import { apiGetTeamMembers } from "@/features/teams/api/teams-api";
import type { Team } from "@/features/teams/api/teams-api";
import { type TeamFormValues } from "../schemas/config.schema";
import { AddTeamModal } from "../modals/add-team-modal";
import { EditTeamModal } from "../modals/edit-team-modal";
import { DeleteTeamModal } from "../modals/delete-team-modal";

export function TeamsSection() {
	const { workspace } = useWorkspace();
	const { data: teams = [] } = useTeams(workspace.id);
	const { data: members = [] } = useWorkspaceMembers(workspace.id);
	const createTeam = useCreateTeamMutation(workspace.id);
	const deleteTeam = useDeleteTeamMutation(workspace.id);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

	const updateTeam = useUpdateTeamMutation(selectedTeam?.id ?? "", workspace.id);

	async function handleAdd(values: TeamFormValues) {
		createTeam.mutate(
			{
				workspace_id: workspace.id,
				name: values.name,
				description: values.description || undefined,
				leader_id: values.leaderId || undefined,
				logo_url: values.logoUrl || undefined,
			},
			{
				onSuccess: async (team) => {
					await Promise.all(
						values.memberIds.map((uid) =>
							fetch(`/api/teams/${team.id}?action=add_member&user_id=${uid}`, { method: "POST", credentials: "include" }),
						),
					);
					setAddOpen(false);
				},
			},
		);
	}

	async function handleEdit(values: TeamFormValues) {
		if (!selectedTeam) return;
		updateTeam.mutate({
			name: values.name,
			description: values.description || undefined,
			leader_id: values.leaderId || null,
			logo_url: values.logoUrl || null,
		});

		// Sync members
		const previousMembers = await apiGetTeamMembers(selectedTeam.id);
		const previousIds = previousMembers.map((m) => m.id);
		const toAdd = values.memberIds.filter((id) => !previousIds.includes(id));
		const toRemove = previousIds.filter((id) => !values.memberIds.includes(id));
		await Promise.all([
			...toAdd.map((uid) => fetch(`/api/teams/${selectedTeam.id}?action=add_member&user_id=${uid}`, { method: "POST", credentials: "include" })),
			...toRemove.map((uid) => fetch(`/api/teams/${selectedTeam.id}?action=remove_member&user_id=${uid}`, { method: "POST", credentials: "include" })),
		]);

		setEditOpen(false);
		setSelectedTeam(null);
	}

	function handleDelete() {
		if (!selectedTeam) return;
		deleteTeam.mutate(selectedTeam.id);
		setDeleteOpen(false);
		setSelectedTeam(null);
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Support Teams</CardTitle>
							<CardDescription className="text-xs">{teams.length} teams configured</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={() => setAddOpen(true)}>
							<Plus className="size-3.5" />
							Add Team
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{teams.map((team) => {
							const initials = team.name
								.split(" ")
								.map((w) => w[0])
								.join("")
								.slice(0, 2)
								.toUpperCase();
							return (
								<div key={team.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
									<Avatar className="size-10 rounded-lg">
										<AvatarImage src={team.logo_url ?? undefined} />
										<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium">{team.name}</p>
										{team.description && <p className="text-[11px] text-muted-foreground truncate">{team.description}</p>}
									</div>
									<div className="flex items-center gap-1 shrink-0">
										<Button
											variant="ghost"
											size="icon"
											className="size-7 rounded-lg"
											onClick={() => {
												setSelectedTeam(team);
												setEditOpen(true);
											}}>
											<Pencil className="size-3" />
											<span className="sr-only">Edit team</span>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
											onClick={() => {
												setSelectedTeam(team);
												setDeleteOpen(true);
											}}>
											<Trash2 className="size-3" />
											<span className="sr-only">Delete team</span>
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			<AddTeamModal open={addOpen} onOpenChange={setAddOpen} agents={members} onConfirm={handleAdd} />
			<EditTeamModal open={editOpen} onOpenChange={setEditOpen} team={selectedTeam} agents={members} onConfirm={handleEdit} />
			<DeleteTeamModal open={deleteOpen} onOpenChange={setDeleteOpen} team={selectedTeam} onConfirm={handleDelete} />
		</>
	);
}
