import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchTicketById, fetchTicketMessages as fetchMessages, fetchTickets, fetchCustomers, queryKeys } from "@/lib/queries";
import type { TicketStatus, TicketPriority } from "@/lib/data";
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
import { MergeTicketModal } from "../modals/merge-ticket-modal";
import { DeleteTicketModal } from "../modals/delete-ticket-modal";

export function TicketDetailView({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
	// Only open/close booleans — no selection or search state
	const [titleOpen, setTitleOpen] = useState(false);
	const [requesterOpen, setRequesterOpen] = useState(false);
	const [assigneeOpen, setAssigneeOpen] = useState(false);
	const [priorityOpen, setPriorityOpen] = useState(false);
	const [statusOpen, setStatusOpen] = useState(false);
	const [teamsOpen, setTeamsOpen] = useState(false);
	const [mergeOpen, setMergeOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const { data: ticket } = useQuery({ queryKey: queryKeys.tickets.detail(ticketId), queryFn: () => fetchTicketById(ticketId) });
	const { data: messages = [] } = useQuery({ queryKey: queryKeys.tickets.messages(ticketId), queryFn: () => fetchMessages(ticketId) });
	const { data: allTickets = [] } = useQuery({ queryKey: queryKeys.tickets.all, queryFn: () => fetchTickets() });
	const { data: customers = [] } = useQuery({ queryKey: queryKeys.customers.all, queryFn: fetchCustomers });

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

	const currentRequester = customers.find((c) => c.email === ticket.requester);
	const mergeableTickets = allTickets.filter((t) => t.id !== ticketId);

	function handleSaveTitle(title: string) {
		console.log("[v0] Updating title to:", title);
	}

	function handleSaveRequester(customerId: string) {
		console.log("[v0] Updating requester to:", customerId);
	}

	function handleSaveAssignee(agentId: string) {
		console.log("[v0] Updating assignee to:", agentId);
	}

	function handleSavePriority(priority: TicketPriority) {
		console.log("[v0] Updating priority to:", priority);
	}

	function handleSaveStatus(status: TicketStatus) {
		console.log("[v0] Updating status to:", status);
	}

	function handleSaveTeams(teamNames: string[]) {
		console.log("[v0] Updating teams to:", teamNames);
	}

	function handleMergeConfirm(targetId: string) {
		console.log("[v0] Merging ticket", ticketId, "into", targetId);
		onBack();
	}

	function handleDeleteConfirm() {
		console.log("[v0] Deleting ticket:", ticketId);
		onBack();
	}

	return (
		<div className="flex flex-col gap-6">
			<TicketDetailHeader
				ticket={ticket}
				onBack={onBack}
				onEditTitle={() => setTitleOpen(true)}
				onMerge={() => setMergeOpen(true)}
				onDelete={() => setDeleteOpen(true)}
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 flex flex-col gap-4">
					<TicketConversation messages={messages} />
					<TicketReplyBox />
				</div>

				<TicketProperties
					ticket={ticket}
					currentRequester={currentRequester}
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
				onSave={handleSaveRequester}
			/>
			<ChangeAssigneeModal
				open={assigneeOpen}
				onOpenChange={setAssigneeOpen}
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
				currentTeams={[ticket.team]}
				onSave={handleSaveTeams}
			/>
			<MergeTicketModal
				open={mergeOpen}
				onOpenChange={setMergeOpen}
				mergeableTickets={mergeableTickets}
				onConfirm={handleMergeConfirm}
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
