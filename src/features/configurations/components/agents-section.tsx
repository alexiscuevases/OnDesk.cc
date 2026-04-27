import { useState } from "react";
import { Pencil, Trash2, X, UserPlus, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/context/workspace-context";
import { useWorkspaceMembers, useWorkspaceInvitations } from "@/features/users/hooks/use-user-queries";
import {
	useUpdateMemberRoleMutation,
	useRemoveMemberMutation,
	useInviteAgentMutation,
	useCancelInvitationMutation,
} from "@/features/users/hooks/use-user-mutations";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import { EditAgentModal } from "../modals/edit-agent-modal";
import { DeleteAgentModal } from "../modals/delete-agent-modal";
import { AddAgentModal } from "../modals/add-agent-modal";
import type { AgentFormValues } from "../schemas/config.schema";

export function AgentsSection() {
	const { workspace } = useWorkspace();
	const { data: members = [] } = useWorkspaceMembers(workspace.id);
	const { data: invitations = [] } = useWorkspaceInvitations(workspace.id);
	const updateRole = useUpdateMemberRoleMutation(workspace.id);
	const removeMember = useRemoveMemberMutation(workspace.id);
	const inviteAgent = useInviteAgentMutation(workspace.id);
	const cancelInvitation = useCancelInvitationMutation(workspace.id);

	const [addOpen, setAddOpen] = useState(false);
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

	function handleInvite(values: AgentFormValues) {
		inviteAgent.mutate(
			{ email: values.email, role: values.role.toLowerCase() },
			{
				onSuccess: (data) => {
					if (data.added) {
						toast.success("Agent added to workspace");
					} else {
						toast.success(`Invitation sent to ${data.email ?? values.email}`);
					}
					setAddOpen(false);
				},
				onError: (err) => {
					toast.error(err.message);
				},
			},
		);
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
						<Button size="sm" className="rounded-lg text-xs gap-1.5" onClick={() => setAddOpen(true)}>
							<UserPlus className="size-3.5" />
							Invite Agent
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{members.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-8 text-center">
							<div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
								<Users className="size-5 text-muted-foreground" />
							</div>
							<p className="text-sm font-medium">No agents yet</p>
							<p className="text-[11px] text-muted-foreground max-w-xs">
								Invite your team members to start collaborating on support tickets.
							</p>
						</div>
					) : (
					<div className="space-y-2">
						{members.map((member) => {
							const initials = member.name
								.split(" ")
								.map((w) => w[0])
								.join("")
								.slice(0, 2)
								.toUpperCase();
							return (
								<div
									key={member.id}
									className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
									<Avatar className="size-9 rounded-lg">
										<AvatarImage src={member.logo_url ?? workspace.logo_url ?? undefined} className="object-cover rounded-lg" />
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
					)}

					{invitations.length > 0 && (
						<div className="mt-4 space-y-2">
							<p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
								<Clock className="size-3" />
								Pending Invitations
							</p>
							{invitations.map((invite) => (
								<div key={invite.id} className="flex items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-3.5">
									<Avatar className="size-9 rounded-lg">
										<AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-[11px] font-bold">
											{invite.email[0].toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">{invite.email}</p>
										<p className="text-[11px] text-muted-foreground">Expires {new Date(invite.expires_at * 1000).toLocaleDateString()}</p>
									</div>
									<Badge variant="outline" className="text-[10px] rounded-full px-2 capitalize">
										{invite.role}
									</Badge>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
										onClick={() =>
											cancelInvitation.mutate(invite.id, {
												onSuccess: () => toast.success("Invitation cancelled"),
												onError: (err) => toast.error(err.message),
											})
										}>
										<X className="size-3" />
										<span className="sr-only">Cancel invitation</span>
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<AddAgentModal open={addOpen} onOpenChange={setAddOpen} onConfirm={handleInvite} />
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
