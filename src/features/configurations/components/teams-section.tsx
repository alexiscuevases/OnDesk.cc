"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Agent } from "@/lib/data";
import { type ConfigTeam } from "@/types/index";
import { nextId } from "@/lib/config-data";
import { type TeamFormValues } from "../schemas/config.schema";
import { AddTeamModal } from "../modals/add-team-modal";
import { EditTeamModal } from "../modals/edit-team-modal";
import { DeleteTeamModal } from "../modals/delete-team-modal";

interface TeamsSectionProps {
	teams: ConfigTeam[];
	setTeams: React.Dispatch<React.SetStateAction<ConfigTeam[]>>;
	agents: Agent[];
}

export function TeamsSection({ teams, setTeams, agents }: TeamsSectionProps) {
	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedTeam, setSelectedTeam] = useState<ConfigTeam | null>(null);

	function handleAdd(values: TeamFormValues) {
		const image =
			values.image ||
			values.name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();
		const newTeam: ConfigTeam = {
			id: nextId("t"),
			name: values.name,
			description: values.description || "",
			image,
			leaderId: values.leaderId || "",
			lead: agents.find((a) => a.id === values.leaderId)?.name || "Unassigned",
			memberIds: values.memberIds,
			members: values.memberIds.length,
			autoAssign: values.autoAssign,
		};
		setTeams((prev) => [...prev, newTeam]);
	}

	function handleEdit(values: TeamFormValues) {
		if (!selectedTeam) return;
		const image =
			values.image ||
			values.name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();
		setTeams((prev) =>
			prev.map((t) =>
				t.id === selectedTeam.id
					? {
							...t,
							name: values.name,
							description: values.description || "",
							image,
							leaderId: values.leaderId || "",
							lead: agents.find((a) => a.id === values.leaderId)?.name || t.lead,
							memberIds: values.memberIds,
							members: values.memberIds.length,
							autoAssign: values.autoAssign,
						}
					: t,
			),
		);
	}

	function handleDelete() {
		if (!selectedTeam) return;
		setTeams((prev) => prev.filter((t) => t.id !== selectedTeam.id));
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
						{teams.map((team) => (
							<div key={team.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<Avatar className="size-10 rounded-lg">
									<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-bold">{team.image}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{team.name}</p>
									<p className="text-[11px] text-muted-foreground truncate">{team.description}</p>
								</div>
								<div className="text-center shrink-0">
									<p className="text-sm font-bold">{team.members}</p>
									<p className="text-[10px] text-muted-foreground">members</p>
								</div>
								{team.autoAssign && (
									<Badge variant="secondary" className="text-[10px] rounded-full px-2">
										Auto-assign
									</Badge>
								)}
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
						))}
					</div>
				</CardContent>
			</Card>

			<AddTeamModal open={addOpen} onOpenChange={setAddOpen} agents={agents} onConfirm={handleAdd} />
			<EditTeamModal open={editOpen} onOpenChange={setEditOpen} team={selectedTeam} agents={agents} onConfirm={handleEdit} />
			<DeleteTeamModal open={deleteOpen} onOpenChange={setDeleteOpen} team={selectedTeam} onConfirm={handleDelete} />
		</>
	);
}
