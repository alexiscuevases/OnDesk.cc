import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTickets, queryKeys } from "@/lib/queries";
import { TicketsFilters } from "./tickets-filters";
import { TicketsBulkActions } from "./tickets-bulk-actions";
import { TicketsTable } from "./tickets-table";
import { DeleteTicketModal } from "../modals/delete-ticket-modal";
import { AssignAgentModal } from "../modals/assign-agent-modal";
import { AssignTeamModal } from "../modals/assign-team-modal";
import { MergeTicketModal } from "../modals/merge-ticket-modal";
import type { Ticket } from "@/lib/data";

export function TicketsView({ onOpenTicket }: { onOpenTicket: (id: string) => void }) {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

	// Modal open/close states only
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [mergeOpen, setMergeOpen] = useState(false);
	const [assignAgentOpen, setAssignAgentOpen] = useState(false);
	const [assignTeamOpen, setAssignTeamOpen] = useState(false);

	const { data: tickets = [], isLoading } = useQuery({
		queryKey: queryKeys.tickets.list({ search, status: statusFilter as Ticket["status"] | "all", priority: priorityFilter as Ticket["priority"] | "all" }),
		queryFn: () => fetchTickets({ search, status: statusFilter as Ticket["status"] | "all", priority: priorityFilter as Ticket["priority"] | "all" }),
	});

	// Para stats usamos todos los tickets sin filtros
	const { data: allTickets = [] } = useQuery({
		queryKey: queryKeys.tickets.all,
		queryFn: () => fetchTickets(),
	});

	const mergeableTickets = tickets.filter((t) => !selectedTickets.includes(t.id));

	function handleSelectAll(checked: boolean) {
		setSelectedTickets(checked ? tickets.map((t) => t.id) : []);
	}

	function handleSelectTicket(ticketId: string, checked: boolean) {
		setSelectedTickets((prev) => (checked ? [...prev, ticketId] : prev.filter((id) => id !== ticketId)));
	}

	function handleDeleteConfirm() {
		// Optimistic update: elimina de la cache
		queryClient.setQueryData<Ticket[]>(queryKeys.tickets.all, (prev = []) =>
			prev.filter((t) => !selectedTickets.includes(t.id)),
		);
		queryClient.setQueryData<Ticket[]>(
			queryKeys.tickets.list({ search, status: statusFilter as Ticket["status"] | "all", priority: priorityFilter as Ticket["priority"] | "all" }),
			(prev = []) => prev.filter((t) => !selectedTickets.includes(t.id)),
		);
		setSelectedTickets([]);
		setDeleteOpen(false);
	}

	function handleDeleteSingle(id: string) {
		setSelectedTickets([id]);
		setDeleteOpen(true);
	}

	function handleAssignTeamConfirm(teamName: string) {
		// Optimistic update: actualiza el equipo en la cache
		const updater = (prev: Ticket[] = []) =>
			prev.map((t) => (selectedTickets.includes(t.id) ? { ...t, team: teamName } : t));
		queryClient.setQueryData<Ticket[]>(queryKeys.tickets.all, updater);
		queryClient.setQueryData<Ticket[]>(
			queryKeys.tickets.list({ search, status: statusFilter as Ticket["status"] | "all", priority: priorityFilter as Ticket["priority"] | "all" }),
			updater,
		);
		setSelectedTickets([]);
	}

	function handleAssignAgentConfirm(agentId: string) {
		console.log("[v0] Assigning agent:", agentId, "to tickets:", selectedTickets);
		setSelectedTickets([]);
	}

	function handleMergeConfirm(targetTicketId: string) {
		console.log("[v0] Merging tickets:", selectedTickets, "into", targetTicketId);
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
					{ label: "In Progress", count: allTickets.filter((t) => t.status === "in-progress").length, color: "bg-warning" },
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
				tickets={tickets}
				totalCount={allTickets.length}
				selectedTickets={selectedTickets}
				onSelectAll={handleSelectAll}
				onSelectTicket={handleSelectTicket}
				onOpenTicket={onOpenTicket}
				onDeleteSingle={handleDeleteSingle}
				isLoading={isLoading}
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
				onConfirm={handleAssignAgentConfirm}
			/>
			<AssignTeamModal
				open={assignTeamOpen}
				onOpenChange={setAssignTeamOpen}
				selectedCount={selectedTickets.length}
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
