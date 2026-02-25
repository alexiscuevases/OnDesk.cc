import { useState } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { useTickets } from "../hooks/use-ticket-queries";
import { useDeleteTicketMutation } from "../hooks/use-ticket-mutations";
import { apiUpdateTicket } from "../api/tickets-api";
import { useQueryClient } from "@tanstack/react-query";
import { ticketQueryKeys } from "../hooks/use-ticket-queries";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";
import { useTeams } from "@/features/teams/hooks/use-team-queries";
import { TicketsFilters } from "./tickets-filters";
import { TicketsBulkActions } from "./tickets-bulk-actions";
import { TicketsTable } from "./tickets-table";
import { DeleteTicketModal } from "../modals/delete-ticket-modal";
import { AssignAgentModal } from "../modals/assign-agent-modal";
import { AssignTeamModal } from "../modals/assign-team-modal";
import { MergeTicketModal } from "../modals/merge-ticket-modal";
import type { TicketStatus } from "../api/tickets-api";

export function TicketsView({ onOpenTicket }: { onOpenTicket: (id: string) => void }) {
	const { workspace } = useWorkspace();
	const workspaceId = workspace.id;
	const queryClient = useQueryClient();

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

	const [deleteOpen, setDeleteOpen] = useState(false);
	const [mergeOpen, setMergeOpen] = useState(false);
	const [assignAgentOpen, setAssignAgentOpen] = useState(false);
	const [assignTeamOpen, setAssignTeamOpen] = useState(false);

	const apiFilters = statusFilter !== "all" ? { status: statusFilter as TicketStatus } : {};
	const { data: tickets = [], isLoading } = useTickets(workspaceId, apiFilters);
	const { data: allTickets = [] } = useTickets(workspaceId, {});
	const { data: members = [] } = useWorkspaceMembers(workspaceId);
	const { data: teams = [] } = useTeams(workspaceId);

	const deleteTicket = useDeleteTicketMutation(workspaceId);

	// Client-side search + priority filter (API only filters by status/assignee/team)
	const filteredTickets = tickets.filter((t) => {
		const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
		if (!matchesPriority) return false;
		if (!search) return true;
		const q = search.toLowerCase();
		return t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
	});

	const mergeableTickets = filteredTickets.filter((t) => !selectedTickets.includes(t.id));

	function handleSelectAll(checked: boolean) {
		setSelectedTickets(checked ? filteredTickets.map((t) => t.id) : []);
	}

	function handleSelectTicket(ticketId: string, checked: boolean) {
		setSelectedTickets((prev) => (checked ? [...prev, ticketId] : prev.filter((id) => id !== ticketId)));
	}

	async function handleDeleteConfirm() {
		await Promise.all(selectedTickets.map((id) => deleteTicket.mutateAsync(id)));
		setSelectedTickets([]);
		setDeleteOpen(false);
	}

	function handleDeleteSingle(id: string) {
		setSelectedTickets([id]);
		setDeleteOpen(true);
	}

	async function handleAssignTeamConfirm(teamId: string) {
		await Promise.all(selectedTickets.map((id) => apiUpdateTicket(id, { team_id: teamId })));
		queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all(workspaceId) });
		setSelectedTickets([]);
		setAssignTeamOpen(false);
	}

	async function handleAssignAgentConfirm(agentId: string) {
		await Promise.all(selectedTickets.map((id) => apiUpdateTicket(id, { assignee_id: agentId })));
		queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all(workspaceId) });
		setSelectedTickets([]);
		setAssignAgentOpen(false);
	}

	function handleMergeConfirm(_targetTicketId: string) {
		// TODO: implement merge API when available
		setSelectedTickets([]);
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
					{ label: "Open", count: allTickets.filter((t) => t.status === "open").length, color: "bg-chart-1" },
					{ label: "Pending", count: allTickets.filter((t) => t.status === "pending").length, color: "bg-warning" },
					{ label: "Resolved", count: allTickets.filter((t) => t.status === "resolved").length, color: "bg-success" },
					{ label: "Closed", count: allTickets.filter((t) => t.status === "closed").length, color: "bg-muted-foreground" },
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
					onAssignTeam={() => setAssignTeamOpen(true)}
					onAssignAgent={() => setAssignAgentOpen(true)}
					onMerge={() => setMergeOpen(true)}
					onDelete={() => setDeleteOpen(true)}
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
				tickets={filteredTickets}
				totalCount={allTickets.length}
				selectedTickets={selectedTickets}
				onSelectAll={handleSelectAll}
				onSelectTicket={handleSelectTicket}
				onOpenTicket={onOpenTicket}
				onDeleteSingle={handleDeleteSingle}
				isLoading={isLoading}
				members={members}
				teams={teams}
			/>

			<DeleteTicketModal
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				selectedCount={selectedTickets.length}
				onConfirm={handleDeleteConfirm}
			/>
			<AssignAgentModal
				open={assignAgentOpen}
				onOpenChange={setAssignAgentOpen}
				selectedCount={selectedTickets.length}
				workspaceId={workspaceId}
				onConfirm={handleAssignAgentConfirm}
			/>
			<AssignTeamModal
				open={assignTeamOpen}
				onOpenChange={setAssignTeamOpen}
				selectedCount={selectedTickets.length}
				workspaceId={workspaceId}
				onConfirm={handleAssignTeamConfirm}
			/>
			<MergeTicketModal
				open={mergeOpen}
				onOpenChange={setMergeOpen}
				selectedCount={selectedTickets.length}
				mergeableTickets={mergeableTickets}
				onConfirm={handleMergeConfirm}
			/>
		</div>
	);
}
