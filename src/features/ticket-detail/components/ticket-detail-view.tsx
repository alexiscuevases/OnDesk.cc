import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/workspace-context";
import { useTicket, useTicketMessages } from "@/features/tickets/hooks/use-ticket-queries";
import { useUpdateTicketMutation, useDeleteTicketMutation } from "@/features/tickets/hooks/use-ticket-mutations";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";
import { useTeams } from "@/features/teams/hooks/use-team-queries";
import { useContacts } from "@/features/contacts/hooks/use-contact-queries";
import type { TicketStatus, TicketPriority } from "@/features/tickets/api/tickets-api";
import { TicketDetailHeader } from "./ticket-detail-header";
import { TicketConversation } from "./ticket-conversation";
import { TicketReplyBox } from "./ticket-reply-box";
import { TicketProperties } from "./ticket-properties";
import { EditTitleModal } from "../modals/edit-title-modal";
import { ChangeRequesterModal } from "../modals/change-requester-modal";
import { ChangeAssigneeModal } from "../modals/change-assignee-modal";
import { ChangePriorityModal } from "../modals/change-priority-modal";
import { ChangeStatusModal } from "../modals/change-status-modal";
import { ManageTeamsModal } from "../modals/manage-teams-modal";
import { DeleteTicketModal } from "../modals/delete-ticket-modal";

export function TicketDetailView({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
	const { workspace } = useWorkspace();
	const workspaceId = workspace.id;

	const [titleOpen, setTitleOpen] = useState(false);
	const [requesterOpen, setRequesterOpen] = useState(false);
	const [assigneeOpen, setAssigneeOpen] = useState(false);
	const [priorityOpen, setPriorityOpen] = useState(false);
	const [statusOpen, setStatusOpen] = useState(false);
	const [teamsOpen, setTeamsOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const { data: ticket, isLoading } = useTicket(ticketId);
	const { data: messages = [] } = useTicketMessages(ticketId);
	const { data: members = [] } = useWorkspaceMembers(workspaceId);
	const { data: teams = [] } = useTeams(workspaceId);
	const { data: contacts = [] } = useContacts(workspaceId);

	const updateTicket = useUpdateTicketMutation(ticketId, workspaceId);
	const deleteTicket = useDeleteTicketMutation(workspaceId);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-3">
				<p className="text-muted-foreground">Loading ticket...</p>
			</div>
		);
	}

	if (!ticket) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-3">
				<p className="text-muted-foreground">Ticket not found</p>
				<Button variant="outline" onClick={onBack}>
					Go Back
				</Button>
			</div>
		);
	}

	const assignee = members.find((m) => m.id === ticket.assignee_id) ?? null;
	const team = teams.find((t) => t.id === ticket.team_id) ?? null;
	const contact = contacts.find((c) => c.id === ticket.contact_id) ?? null;

	async function handleSaveTitle(title: string) {
		await updateTicket.mutateAsync({ subject: title });
		setTitleOpen(false);
	}

	async function handleSaveRequester(contactId: string) {
		await updateTicket.mutateAsync({ contact_id: contactId });
		setRequesterOpen(false);
	}

	async function handleSaveAssignee(agentId: string) {
		await updateTicket.mutateAsync({ assignee_id: agentId });
		setAssigneeOpen(false);
	}

	async function handleSavePriority(priority: TicketPriority) {
		await updateTicket.mutateAsync({ priority });
		setPriorityOpen(false);
	}

	async function handleSaveStatus(status: TicketStatus) {
		await updateTicket.mutateAsync({ status });
		setStatusOpen(false);
	}

	async function handleSaveTeam(teamId: string | null) {
		await updateTicket.mutateAsync({ team_id: teamId });
		setTeamsOpen(false);
	}

	async function handleDeleteConfirm() {
		await deleteTicket.mutateAsync(ticketId);
		onBack();
	}

	return (
		<div className="flex flex-col gap-6">
			<TicketDetailHeader
				ticket={ticket}
				onBack={onBack}
				onEditTitle={() => setTitleOpen(true)}
				onDelete={() => setDeleteOpen(true)}
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 flex flex-col gap-4">
					<TicketConversation messages={messages} members={members} contact={contact} />
					<TicketReplyBox ticketId={ticketId} members={members} />
				</div>

				<TicketProperties
					ticket={ticket}
					assignee={assignee}
					team={team}
					contact={contact}
					onEditStatus={() => setStatusOpen(true)}
					onEditPriority={() => setPriorityOpen(true)}
					onEditAssignee={() => setAssigneeOpen(true)}
					onEditTeam={() => setTeamsOpen(true)}
					onEditRequester={() => setRequesterOpen(true)}
				/>
			</div>

			<EditTitleModal
				open={titleOpen}
				onOpenChange={setTitleOpen}
				currentTitle={ticket.subject}
				onSave={handleSaveTitle}
			/>
			<ChangeRequesterModal
				open={requesterOpen}
				onOpenChange={setRequesterOpen}
				workspaceId={workspaceId}
				onSave={handleSaveRequester}
			/>
			<ChangeAssigneeModal
				open={assigneeOpen}
				onOpenChange={setAssigneeOpen}
				workspaceId={workspaceId}
				onSave={handleSaveAssignee}
			/>
			<ChangePriorityModal
				open={priorityOpen}
				onOpenChange={setPriorityOpen}
				currentPriority={ticket.priority}
				onSave={handleSavePriority}
			/>
			<ChangeStatusModal
				open={statusOpen}
				onOpenChange={setStatusOpen}
				currentStatus={ticket.status}
				onSave={handleSaveStatus}
			/>
			<ManageTeamsModal
				open={teamsOpen}
				onOpenChange={setTeamsOpen}
				currentTeamId={ticket.team_id}
				workspaceId={workspaceId}
				onSave={handleSaveTeam}
			/>
			<DeleteTicketModal
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				ticketId={ticketId}
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	);
}
