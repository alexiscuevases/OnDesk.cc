"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWorkspace } from "@/context/workspace-context";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";
import { useUpdateMemberRoleMutation, useRemoveMemberMutation } from "@/features/users/hooks/use-user-mutations";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import { EditAgentModal } from "../modals/edit-agent-modal";
import { DeleteAgentModal } from "../modals/delete-agent-modal";

export function AgentsSection() {
	const { workspace } = useWorkspace();
	const { data: members = [] } = useWorkspaceMembers(workspace.id);
	const updateRole = useUpdateMemberRoleMutation(workspace.id);
	const removeMember = useRemoveMemberMutation(workspace.id);

	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);

	function handleEditRole(role: string) {
		if (!selectedMember) return;
		updateRole.mutate({ userId: selectedMember.id, role });
		setEditOpen(false);
	}

	function handleDelete() {
		if (!selectedMember) return;
		removeMember.mutate(selectedMember.id);
		setSelectedMember(null);
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Support Agents</CardTitle>
							<CardDescription className="text-xs">{members.length} agents in your workspace</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{members.map((member) => {
							const initials = member.name
								.split(" ")
								.map((w) => w[0])
								.join("")
								.slice(0, 2)
								.toUpperCase();
							return (
								<div key={member.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
									<Avatar className="size-9 rounded-lg">
										<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[11px] font-bold">
											{initials}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium">{member.name}</p>
										<p className="text-[11px] text-muted-foreground">{member.email}</p>
									</div>
									<Badge variant="secondary" className="text-[10px] rounded-full px-2">
										{member.workspace_role}
									</Badge>
									<div className="flex items-center gap-1 shrink-0">
										<Button
											variant="ghost"
											size="icon"
											className="size-7 rounded-lg"
											onClick={() => {
												setSelectedMember(member);
												setEditOpen(true);
											}}>
											<Pencil className="size-3" />
											<span className="sr-only">Edit agent</span>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
											onClick={() => {
												setSelectedMember(member);
												setDeleteOpen(true);
											}}>
											<Trash2 className="size-3" />
											<span className="sr-only">Remove agent</span>
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			<EditAgentModal
				open={editOpen}
				onOpenChange={setEditOpen}
				agent={selectedMember ? { id: selectedMember.id, email: selectedMember.email, role: selectedMember.workspace_role } : null}
				onConfirm={(values) => handleEditRole(values.role)}
			/>
			<DeleteAgentModal
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				agent={selectedMember ? { id: selectedMember.id, name: selectedMember.name } : null}
				onConfirm={handleDelete}
			/>
		</>
	);
}
