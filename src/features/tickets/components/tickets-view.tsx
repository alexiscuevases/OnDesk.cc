import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { useTickets, useTicketCounts } from "../hooks/use-ticket-queries";
import { useDeleteTicketMutation } from "../hooks/use-ticket-mutations";
import { apiUpdateTicket, apiMergeTickets } from "../api/tickets-api";
import { useQueryClient } from "@tanstack/react-query";
import { ticketQueryKeys } from "../hooks/use-ticket-queries";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";
import { useTeams } from "@/features/teams/hooks/use-team-queries";
import { useContacts } from "@/features/contacts/hooks/use-contact-queries";
import { useCompanies } from "@/features/companies/hooks/use-company-queries";
import { TicketsFilters } from "./tickets-filters";
import { TicketsBulkActions } from "./tickets-bulk-actions";
import { TicketsTable } from "./tickets-table";
import { DeleteTicketModal } from "../modals/delete-ticket-modal";
import { AssignAgentModal } from "../modals/assign-agent-modal";
import { AssignTeamModal } from "../modals/assign-team-modal";
import { MergeTicketModal } from "../modals/merge-ticket-modal";
import { NewTicketModal } from "../modals/new-ticket-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { TicketStatus, TicketPriority, TicketListFilters } from "../api/tickets-api";

export function TicketsView({
	onOpenTicket,
	initialAssigneeId,
	initialRequesterId,
}: {
	onOpenTicket: (id: string) => void;
	initialAssigneeId?: string;
	initialRequesterId?: string;
}) {
	const { workspace } = useWorkspace();
	const workspaceId = workspace.id;
	const queryClient = useQueryClient();

	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [assigneeFilter, setAssigneeFilter] = useState<string>(initialAssigneeId ?? "all");
	const [requesterFilter, setRequesterFilter] = useState<string>(initialRequesterId ?? "all");
	const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	const [newTicketOpen, setNewTicketOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [mergeOpen, setMergeOpen] = useState(false);
	const [assignAgentOpen, setAssignAgentOpen] = useState(false);
	const [assignTeamOpen, setAssignTeamOpen] = useState(false);

	useEffect(() => {
		setAssigneeFilter(initialAssigneeId ?? "all");
	}, [initialAssigneeId]);

	useEffect(() => {
		setRequesterFilter(initialRequesterId ?? "all");
	}, [initialRequesterId]);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(id);
	}, [search]);

	const apiFilters: TicketListFilters = useMemo(() => {
		const f: TicketListFilters = {};
		if (statusFilter !== "all") f.status = statusFilter as TicketStatus;
		if (priorityFilter !== "all") f.priority = priorityFilter as TicketPriority;
		if (assigneeFilter !== "all") f.assignee_id = assigneeFilter;
		if (requesterFilter !== "all") f.contact_id = requesterFilter;
		if (debouncedSearch.trim()) f.search = debouncedSearch.trim();
		return f;
	}, [statusFilter, priorityFilter, assigneeFilter, requesterFilter, debouncedSearch]);

	// Reset to page 1 whenever filters change
	useEffect(() => {
		setPage(1);
		setSelectedTickets([]);
	}, [apiFilters, pageSize]);

	const { data: ticketPage, isLoading, isFetching } = useTickets(workspaceId, apiFilters, { page, pageSize });
	const tickets = ticketPage?.tickets ?? [];
	const totalTickets = ticketPage?.total ?? 0;
	const { data: counts } = useTicketCounts(workspaceId);
	const { data: members = [] } = useWorkspaceMembers(workspaceId);
	const { data: teams = [] } = useTeams(workspaceId);
	const { data: contacts = [] } = useContacts(workspaceId);
	const { data: companies = [] } = useCompanies(workspaceId);

	const deleteTicket = useDeleteTicketMutation(workspaceId);

	const mergeableTickets = tickets.filter((t) => !selectedTickets.includes(t.id));

	function handleSelectAll(checked: boolean) {
		setSelectedTickets(checked ? tickets.map((t) => t.id) : []);
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

	async function handleMergeConfirm(targetTicketId: string) {
		await apiMergeTickets(targetTicketId, selectedTickets);
		queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all(workspaceId) });
		setSelectedTickets([]);
		setMergeOpen(false);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-balance">Tickets</h1>
					<p className="text-sm text-muted-foreground mt-1">Manage and track all customer support tickets</p>
				</div>
				<Button onClick={() => setNewTicketOpen(true)}>
					<Plus className="size-4" />
					New Ticket
				</Button>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-4 gap-3">
				{[
					{ label: "Open", count: counts?.open ?? 0, color: "bg-chart-1" },
					{ label: "Pending", count: counts?.pending ?? 0, color: "bg-warning" },
					{ label: "Resolved", count: counts?.resolved ?? 0, color: "bg-success" },
					{ label: "Closed", count: counts?.closed ?? 0, color: "bg-muted-foreground" },
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
				assigneeFilter={assigneeFilter}
				onAssigneeFilterChange={setAssigneeFilter}
				requesterFilter={requesterFilter}
				onRequesterFilterChange={setRequesterFilter}
				members={members}
				contacts={contacts}
			/>

			<TicketsTable
				tickets={tickets}
				totalCount={totalTickets}
				page={page}
				pageSize={pageSize}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
				selectedTickets={selectedTickets}
				onSelectAll={handleSelectAll}
				onSelectTicket={handleSelectTicket}
				onOpenTicket={onOpenTicket}
				onDeleteSingle={handleDeleteSingle}
				isLoading={isLoading || isFetching}
				members={members}
				teams={teams}
				contacts={contacts}
				companies={companies}
			/>

			<NewTicketModal open={newTicketOpen} onOpenChange={setNewTicketOpen} />
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
