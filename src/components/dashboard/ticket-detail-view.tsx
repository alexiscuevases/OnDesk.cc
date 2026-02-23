"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	tickets,
	getTicketMessages,
	customers,
	agents,
	type TicketStatus,
	type TicketPriority,
	type Customer,
	type Agent,
} from "@/lib/data";
import { TicketDetailHeader } from "@/components/dashboard/ticket-detail/ticket-detail-header";
import { TicketConversation } from "@/components/dashboard/ticket-detail/ticket-conversation";
import { TicketReplyBox } from "@/components/dashboard/ticket-detail/ticket-reply-box";
import { TicketProperties } from "@/components/dashboard/ticket-detail/ticket-properties";
import { TicketDetailDialogs } from "@/components/dashboard/ticket-detail/ticket-detail-dialogs";

export function TicketDetailView({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
	// Modal open states
	const [requesterDialogOpen, setRequesterDialogOpen] = useState(false);
	const [assigneeDialogOpen, setAssigneeDialogOpen] = useState(false);
	const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	const [titleDialogOpen, setTitleDialogOpen] = useState(false);
	const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);
	const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	// Selection states
	const [selectedRequester, setSelectedRequester] = useState<Customer | null>(null);
	const [selectedAssignee, setSelectedAssignee] = useState<Agent | null>(null);
	const [selectedPriority, setSelectedPriority] = useState<TicketPriority>("medium");
	const [selectedStatus, setSelectedStatus] = useState<TicketStatus>("open");
	const [editedTitle, setEditedTitle] = useState("");
	const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
	const [mergeTargetId, setMergeTargetId] = useState("");

	// Search states
	const [requesterSearch, setRequesterSearch] = useState("");
	const [assigneeSearch, setAssigneeSearch] = useState("");
	const [mergeSearch, setMergeSearch] = useState("");

	const ticket = tickets.find((t) => t.id === ticketId);
	const messages = getTicketMessages(ticketId);

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
	const currentAssignee = agents.find((a) => a.name === ticket.assignee);

	const filteredCustomers = customers.filter(
		(c) =>
			c.name.toLowerCase().includes(requesterSearch.toLowerCase()) ||
			c.email.toLowerCase().includes(requesterSearch.toLowerCase()),
	);

	const filteredAgents = agents.filter(
		(a) =>
			a.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
			a.email.toLowerCase().includes(assigneeSearch.toLowerCase()),
	);

	const mergeableTickets = tickets.filter(
		(t) =>
			t.id !== ticketId &&
			(t.id.toLowerCase().includes(mergeSearch.toLowerCase()) ||
				t.subject.toLowerCase().includes(mergeSearch.toLowerCase())),
	);

	function openRequesterDialog() {
		setSelectedRequester(currentRequester || null);
		setRequesterDialogOpen(true);
	}

	function openAssigneeDialog() {
		setSelectedAssignee(currentAssignee || null);
		setAssigneeDialogOpen(true);
	}

	function openPriorityDialog() {
		setSelectedPriority(ticket.priority);
		setPriorityDialogOpen(true);
	}

	function openStatusDialog() {
		setSelectedStatus(ticket.status);
		setStatusDialogOpen(true);
	}

	function openTitleDialog() {
		setEditedTitle(ticket.subject);
		setTitleDialogOpen(true);
	}

	function openTeamsDialog() {
		setSelectedTeams([ticket.team]);
		setTeamsDialogOpen(true);
	}

	function handleSaveRequester() {
		if (selectedRequester) console.log("[v0] Updating requester to:", selectedRequester.email);
		setRequesterDialogOpen(false);
	}

	function handleSaveAssignee() {
		if (selectedAssignee) console.log("[v0] Updating assignee to:", selectedAssignee.name);
		setAssigneeDialogOpen(false);
	}

	function handleSavePriority() {
		console.log("[v0] Updating priority to:", selectedPriority);
		setPriorityDialogOpen(false);
	}

	function handleSaveStatus() {
		console.log("[v0] Updating status to:", selectedStatus);
		setStatusDialogOpen(false);
	}

	function handleSaveTitle() {
		if (editedTitle.trim()) console.log("[v0] Updating title to:", editedTitle);
		setTitleDialogOpen(false);
	}

	function handleSaveTeams() {
		console.log("[v0] Updating teams to:", selectedTeams);
		setTeamsDialogOpen(false);
	}

	function handleMergeTicket() {
		if (mergeTargetId) {
			console.log("[v0] Merging ticket", ticketId, "into", mergeTargetId);
			setMergeDialogOpen(false);
			onBack();
		}
	}

	function handleDeleteTicket() {
		console.log("[v0] Deleting ticket:", ticketId);
		setDeleteDialogOpen(false);
		onBack();
	}

	function handleToggleTeam(teamName: string) {
		setSelectedTeams((prev) =>
			prev.includes(teamName) ? prev.filter((t) => t !== teamName) : [...prev, teamName],
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<TicketDetailHeader
				ticket={ticket}
				onBack={onBack}
				onEditTitle={openTitleDialog}
				onMerge={() => setMergeDialogOpen(true)}
				onDelete={() => setDeleteDialogOpen(true)}
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 flex flex-col gap-4">
					<TicketConversation messages={messages} />
					<TicketReplyBox />
				</div>

				<TicketProperties
					ticket={ticket}
					currentRequester={currentRequester}
					onEditStatus={openStatusDialog}
					onEditPriority={openPriorityDialog}
					onEditAssignee={openAssigneeDialog}
					onEditTeam={openTeamsDialog}
					onEditRequester={openRequesterDialog}
				/>
			</div>

			<TicketDetailDialogs
				ticketId={ticketId}
				requesterOpen={requesterDialogOpen}
				onRequesterOpenChange={setRequesterDialogOpen}
				onRequesterSave={handleSaveRequester}
				selectedRequester={selectedRequester}
				onSelectRequester={setSelectedRequester}
				requesterSearch={requesterSearch}
				onRequesterSearchChange={setRequesterSearch}
				filteredCustomers={filteredCustomers}
				assigneeOpen={assigneeDialogOpen}
				onAssigneeOpenChange={setAssigneeDialogOpen}
				onAssigneeSave={handleSaveAssignee}
				selectedAssignee={selectedAssignee}
				onSelectAssignee={setSelectedAssignee}
				assigneeSearch={assigneeSearch}
				onAssigneeSearchChange={setAssigneeSearch}
				filteredAgents={filteredAgents}
				priorityOpen={priorityDialogOpen}
				onPriorityOpenChange={setPriorityDialogOpen}
				onPrioritySave={handleSavePriority}
				selectedPriority={selectedPriority}
				onSelectPriority={setSelectedPriority}
				statusOpen={statusDialogOpen}
				onStatusOpenChange={setStatusDialogOpen}
				onStatusSave={handleSaveStatus}
				selectedStatus={selectedStatus}
				onSelectStatus={setSelectedStatus}
				teamsOpen={teamsDialogOpen}
				onTeamsOpenChange={setTeamsDialogOpen}
				onTeamsSave={handleSaveTeams}
				selectedTeams={selectedTeams}
				onToggleTeam={handleToggleTeam}
				titleOpen={titleDialogOpen}
				onTitleOpenChange={setTitleDialogOpen}
				onTitleSave={handleSaveTitle}
				editedTitle={editedTitle}
				onEditedTitleChange={setEditedTitle}
				mergeOpen={mergeDialogOpen}
				onMergeOpenChange={setMergeDialogOpen}
				onMergeConfirm={handleMergeTicket}
				mergeTargetId={mergeTargetId}
				onMergeTargetChange={setMergeTargetId}
				mergeSearch={mergeSearch}
				onMergeSearchChange={setMergeSearch}
				mergeableTickets={mergeableTickets}
				deleteOpen={deleteDialogOpen}
				onDeleteOpenChange={setDeleteDialogOpen}
				onDeleteConfirm={handleDeleteTicket}
			/>
		</div>
	);
}
