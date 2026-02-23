"use client";

import { useState } from "react";
import { tickets as initialTickets, agents, type Agent } from "@/lib/data";
import { TicketsFilters } from "@/components/dashboard/tickets/tickets-filters";
import { TicketsBulkActions } from "@/components/dashboard/tickets/tickets-bulk-actions";
import { TicketsTable } from "@/components/dashboard/tickets/tickets-table";
import { TicketsDialogs } from "@/components/dashboard/tickets/tickets-dialogs";

export function TicketsView({ onOpenTicket }: { onOpenTicket: (id: string) => void }) {
	const [tickets, setTickets] = useState(initialTickets);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

	// Modal states
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
	const [assignAgentDialogOpen, setAssignAgentDialogOpen] = useState(false);
	const [assignTeamDialogOpen, setAssignTeamDialogOpen] = useState(false);

	// Modal selection states
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
	const [selectedTeam, setSelectedTeam] = useState<string>("");
	const [mergeTargetId, setMergeTargetId] = useState("");
	const [mergeSearch, setMergeSearch] = useState("");
	const [agentSearch, setAgentSearch] = useState("");

	const filtered = tickets.filter((t) => {
		const matchSearch =
			t.subject.toLowerCase().includes(search.toLowerCase()) ||
			t.id.toLowerCase().includes(search.toLowerCase()) ||
			t.requester.toLowerCase().includes(search.toLowerCase());
		const matchStatus = statusFilter === "all" || t.status === statusFilter;
		const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
		return matchSearch && matchStatus && matchPriority;
	});

	const mergeableTickets = tickets.filter(
		(t) =>
			!selectedTickets.includes(t.id) &&
			(t.id.toLowerCase().includes(mergeSearch.toLowerCase()) ||
				t.subject.toLowerCase().includes(mergeSearch.toLowerCase())),
	);

	const filteredAgents = agents.filter(
		(a) =>
			a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
			a.email.toLowerCase().includes(agentSearch.toLowerCase()),
	);

	function handleSelectAll(checked: boolean) {
		setSelectedTickets(checked ? filtered.map((t) => t.id) : []);
	}

	function handleSelectTicket(ticketId: string, checked: boolean) {
		setSelectedTickets((prev) => (checked ? [...prev, ticketId] : prev.filter((id) => id !== ticketId)));
	}

	function handleDeleteTickets() {
		setTickets((prev) => prev.filter((t) => !selectedTickets.includes(t.id)));
		setSelectedTickets([]);
		setDeleteDialogOpen(false);
	}

	function handleDeleteSingle(id: string) {
		setSelectedTickets([id]);
		setDeleteDialogOpen(true);
	}

	function handleAssignTeam() {
		if (selectedTeam) {
			setTickets((prev) =>
				prev.map((t) => (selectedTickets.includes(t.id) ? { ...t, team: selectedTeam } : t)),
			);
			setSelectedTickets([]);
			setAssignTeamDialogOpen(false);
			setSelectedTeam("");
		}
	}

	function handleAssignAgent() {
		if (selectedAgent) {
			setTickets((prev) =>
				prev.map((t) => (selectedTickets.includes(t.id) ? { ...t, assignee: selectedAgent.name } : t)),
			);
			setSelectedTickets([]);
			setAssignAgentDialogOpen(false);
			setSelectedAgent(null);
			setAgentSearch("");
		}
	}

	function handleMergeTickets() {
		if (mergeTargetId) {
			console.log("[v0] Merging tickets:", selectedTickets, "into", mergeTargetId);
			setMergeDialogOpen(false);
			setMergeTargetId("");
			setMergeSearch("");
			setSelectedTickets([]);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-balance">Tickets</h1>
				<p className="text-sm text-muted-foreground mt-1">Manage and track all customer support tickets</p>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-4 gap-3">
				{[
					{ label: "Open", count: tickets.filter((t) => t.status === "open").length, color: "bg-chart-1" },
					{ label: "In Progress", count: tickets.filter((t) => t.status === "in-progress").length, color: "bg-warning" },
					{ label: "Resolved", count: tickets.filter((t) => t.status === "resolved").length, color: "bg-success" },
					{ label: "Closed", count: tickets.filter((t) => t.status === "closed").length, color: "bg-muted-foreground" },
				].map((stat) => (
					<div key={stat.label} className="flex items-center gap-3 rounded-xl bg-card p-3.5 shadow-sm">
						<div className={`size-2.5 rounded-full ${stat.color}`} />
						<div>
							<p className="text-lg font-bold">{stat.count}</p>
							<p className="text-[11px] text-muted-foreground">{stat.label}</p>
						</div>
					</div>
				))}
			</div>

			{selectedTickets.length > 0 && (
				<TicketsBulkActions
					selectedCount={selectedTickets.length}
					onAssignTeam={() => setAssignTeamDialogOpen(true)}
					onAssignAgent={() => setAssignAgentDialogOpen(true)}
					onMerge={() => setMergeDialogOpen(true)}
					onDelete={() => setDeleteDialogOpen(true)}
				/>
			)}

			<TicketsFilters
				search={search}
				onSearchChange={setSearch}
				statusFilter={statusFilter}
				onStatusFilterChange={setStatusFilter}
				priorityFilter={priorityFilter}
				onPriorityFilterChange={setPriorityFilter}
			/>

			<TicketsTable
				tickets={filtered}
				totalCount={tickets.length}
				selectedTickets={selectedTickets}
				onSelectAll={handleSelectAll}
				onSelectTicket={handleSelectTicket}
				onOpenTicket={onOpenTicket}
				onDeleteSingle={handleDeleteSingle}
			/>

			<TicketsDialogs
				selectedCount={selectedTickets.length}
				deleteOpen={deleteDialogOpen}
				onDeleteOpenChange={setDeleteDialogOpen}
				onDeleteConfirm={handleDeleteTickets}
				assignAgentOpen={assignAgentDialogOpen}
				onAssignAgentOpenChange={setAssignAgentDialogOpen}
				onAssignAgentConfirm={handleAssignAgent}
				selectedAgent={selectedAgent}
				onSelectAgent={setSelectedAgent}
				agentSearch={agentSearch}
				onAgentSearchChange={setAgentSearch}
				filteredAgents={filteredAgents}
				assignTeamOpen={assignTeamDialogOpen}
				onAssignTeamOpenChange={setAssignTeamDialogOpen}
				onAssignTeamConfirm={handleAssignTeam}
				selectedTeam={selectedTeam}
				onSelectTeam={setSelectedTeam}
				mergeOpen={mergeDialogOpen}
				onMergeOpenChange={setMergeDialogOpen}
				onMergeConfirm={handleMergeTickets}
				mergeTargetId={mergeTargetId}
				onMergeTargetChange={setMergeTargetId}
				mergeSearch={mergeSearch}
				onMergeSearchChange={setMergeSearch}
				mergeableTickets={mergeableTickets}
			/>
		</div>
	);
}
