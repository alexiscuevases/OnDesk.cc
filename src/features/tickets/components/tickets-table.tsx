import { useMemo } from "react";
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	MoreHorizontal,
	Eye,
	Trash2,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronDown,
	ChevronsUpDown,
	Inbox,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/shared/components/status-badge";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { TicketAiStatusBadge } from "@/shared/components/ticket-ai-status-badge";
import type { Ticket } from "@/features/tickets/api/tickets-api";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import type { Team } from "@/features/teams/api/teams-api";
import type { Contact } from "@/features/contacts/api/contacts-api";
import type { Company } from "@/features/companies/api/companies-api";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

interface TicketsTableProps {
	tickets: Ticket[];
	totalCount: number;
	page: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	sorting: SortingState;
	onSortingChange: (sorting: SortingState) => void;
	selectedTickets: string[];
	onSelectAll: (checked: boolean) => void;
	onSelectTicket: (id: string, checked: boolean) => void;
	onOpenTicket: (id: string) => void;
	onDeleteSingle: (id: string) => void;
	isLoading?: boolean;
	members: WorkspaceMember[];
	teams: Team[];
	contacts: Contact[];
	companies: Company[];
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function TicketsTable({
	tickets,
	totalCount,
	page,
	pageSize,
	onPageChange,
	onPageSizeChange,
	sorting,
	onSortingChange,
	selectedTickets,
	onSelectAll,
	onSelectTicket,
	onOpenTicket,
	onDeleteSingle,
	isLoading,
	members,
	teams,
	contacts,
	companies,
}: TicketsTableProps) {
	const { workspace } = useWorkspace();

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const pageStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
	const pageEnd = Math.min(page * pageSize, totalCount);

	const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
	const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
	const contactMap = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);
	const companyMap = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

	const allChecked = tickets.length > 0 && tickets.every((t) => selectedTickets.includes(t.id));

	const columns = useMemo<ColumnDef<Ticket>[]>(
		() => [
			{
				id: "select",
				header: () => (
					<Checkbox checked={allChecked} onCheckedChange={(c) => onSelectAll(Boolean(c))} />
				),
				cell: ({ row }) => (
					<Checkbox
						checked={selectedTickets.includes(row.original.id)}
						onCheckedChange={(c) => onSelectTicket(row.original.id, Boolean(c))}
					/>
				),
				enableSorting: false,
				size: 48,
			},
			{
				id: "number",
				accessorKey: "number",
				header: "ID",
				enableSorting: true,
				size: 96,
				cell: ({ row }) => (
					<span className="font-mono text-xs font-semibold text-primary/70">
						<span className="text-muted-foreground">#</span>
						{row.original.number}
					</span>
				),
			},
			{
				id: "subject",
				accessorKey: "subject",
				header: "Details",
				enableSorting: true,
				cell: ({ row }) => {
					const ticket = row.original;
					const contact = ticket.contact_id ? contactMap.get(ticket.contact_id) ?? null : null;
					const company = contact?.company_id ? companyMap.get(contact.company_id) ?? null : null;
					return (
						<div className="flex items-center gap-2.5 max-w-70 lg:max-w-95">
							<Avatar className="size-7 rounded-lg shrink-0">
								<AvatarImage src={company?.logo_url ?? undefined} className="object-cover rounded-lg" />
								<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
									{contact ? getInitials(contact.name) : "?"}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="text-sm font-medium truncate">{ticket.subject}</p>
								{contact && (
									<p className="text-[11px] text-muted-foreground truncate">{contact.name}</p>
								)}
							</div>
						</div>
					);
				},
			},
			{
				id: "team",
				header: "Team",
				enableSorting: false,
				cell: ({ row }) => {
					const team = row.original.team_id ? teamMap.get(row.original.team_id) ?? null : null;
					if (!team) return <span className="text-xs text-muted-foreground">—</span>;
					return (
						<div className="flex items-center gap-2">
							<Avatar className="size-7">
								<AvatarImage src={team.logo_url ?? undefined} className="object-cover" />
								<AvatarFallback className="text-[10px] bg-accent/80 text-accent-foreground font-semibold">
									{getInitials(team.name)}
								</AvatarFallback>
							</Avatar>
							<span className="text-xs">{team.name}</span>
						</div>
					);
				},
				meta: { hideOnSmall: true },
			},
			{
				id: "assignee",
				header: "Assignee",
				enableSorting: false,
				cell: ({ row }) => {
					const assignee = row.original.assignee_id ? memberMap.get(row.original.assignee_id) ?? null : null;
					if (!assignee) return <span className="text-xs text-muted-foreground">—</span>;
					return (
						<div className="flex items-center gap-2">
							<Avatar className="size-7">
								<AvatarImage src={assignee.logo_url ?? workspace.logo_url ?? undefined} className="object-cover" />
								<AvatarFallback className="text-[10px] bg-accent/80 text-accent-foreground font-semibold">
									{getInitials(assignee.name)}
								</AvatarFallback>
							</Avatar>
							<span className="text-xs">{assignee.name}</span>
						</div>
					);
				},
				meta: { hideOnSmall: true },
			},
			{
				id: "priority",
				accessorKey: "priority",
				header: "Priority",
				enableSorting: true,
				cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
			},
			{
				id: "ai",
				header: "AI",
				enableSorting: false,
				cell: ({ row }) => (
					<TicketAiStatusBadge ticket={row.original} className="text-[10px] px-2 py-0.5" />
				),
			},
			{
				id: "status",
				accessorKey: "status",
				header: "Status",
				enableSorting: true,
				cell: ({ row }) => <StatusBadge status={row.original.status} />,
			},
			{
				id: "actions",
				header: "",
				enableSorting: false,
				size: 48,
				cell: ({ row }) => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="size-8 rounded-lg">
								<MoreHorizontal className="size-4" />
								<span className="sr-only">Actions</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onOpenTicket(row.original.id)}>
								<Eye className="size-3.5 mr-2" />
								View
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onDeleteSingle(row.original.id)}>
								<Trash2 className="size-3.5 mr-2" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
		[
			allChecked,
			onSelectAll,
			selectedTickets,
			onSelectTicket,
			contactMap,
			companyMap,
			teamMap,
			memberMap,
			workspace.logo_url,
			onOpenTicket,
			onDeleteSingle,
		],
	);

	const table = useReactTable({
		data: tickets,
		columns,
		state: { sorting },
		onSortingChange: (updater) => {
			const next = typeof updater === "function" ? updater(sorting) : updater;
			onSortingChange(next);
		},
		manualPagination: true,
		manualSorting: true,
		pageCount: totalPages,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Card className="border-0 shadow-sm overflow-hidden">
			<CardHeader className="pb-3">
				<CardTitle className="text-sm font-semibold">All Tickets</CardTitle>
				<CardDescription className="text-xs">
					{isLoading && totalCount === 0
						? "Loading..."
						: `${totalCount} ticket${totalCount !== 1 ? "s" : ""} found`}
				</CardDescription>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="bg-secondary/50 hover:bg-secondary/50">
								{headerGroup.headers.map((header, idx) => {
									const canSort = header.column.getCanSort();
									const sortDir = header.column.getIsSorted();
									const hideOnSmall = (header.column.columnDef.meta as { hideOnSmall?: boolean } | undefined)
										?.hideOnSmall;
									const lastIdx = headerGroup.headers.length - 1;
									return (
										<TableHead
											key={header.id}
											style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
											className={`text-[11px] font-semibold uppercase tracking-wider ${
												idx === 0 ? "pl-6" : ""
											} ${idx === lastIdx ? "pr-6" : ""} ${
												hideOnSmall ? (header.column.id === "team" ? "hidden lg:table-cell" : "hidden sm:table-cell") : ""
											}`}>
											{header.isPlaceholder ? null : canSort ? (
												<button
													type="button"
													onClick={header.column.getToggleSortingHandler()}
													className="flex items-center gap-1.5 hover:text-foreground transition-colors uppercase tracking-wider">
													{flexRender(header.column.columnDef.header, header.getContext())}
													{sortDir === "asc" ? (
														<ChevronUp className="size-3" />
													) : sortDir === "desc" ? (
														<ChevronDown className="size-3" />
													) : (
														<ChevronsUpDown className="size-3 opacity-40" />
													)}
												</button>
											) : (
												flexRender(header.column.columnDef.header, header.getContext())
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length} className="py-14 text-center">
									<div className="flex flex-col items-center gap-2">
										<div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
											<Inbox className="size-5 text-muted-foreground" />
										</div>
										<p className="text-sm font-medium">No tickets found</p>
										<p className="text-[11px] text-muted-foreground">
											Try adjusting your filters or search query.
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="hover:bg-secondary/40 transition-colors cursor-pointer"
									onClick={() => onOpenTicket(row.original.id)}>
									{row.getVisibleCells().map((cell, idx) => {
										const lastIdx = row.getVisibleCells().length - 1;
										const isSelect = cell.column.id === "select";
										const isActions = cell.column.id === "actions";
										const hideOnSmall = (cell.column.columnDef.meta as { hideOnSmall?: boolean } | undefined)
											?.hideOnSmall;
										return (
											<TableCell
												key={cell.id}
												className={`${idx === 0 ? "pl-6" : ""} ${idx === lastIdx ? "pr-6" : ""} ${
													hideOnSmall ? (cell.column.id === "team" ? "hidden lg:table-cell" : "hidden sm:table-cell") : ""
												}`}
												onClick={isSelect || isActions ? (e) => e.stopPropagation() : undefined}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										);
									})}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				<div className="flex items-center justify-between px-6 py-4 border-t">
					<div className="flex items-center gap-3">
						<p className="text-xs text-muted-foreground">
							Showing {pageStart}–{pageEnd} of {totalCount}
						</p>
						<div className="flex items-center gap-1.5">
							<span className="text-xs text-muted-foreground">Rows:</span>
							<Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
								<SelectTrigger className="h-8 w-18 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PAGE_SIZE_OPTIONS.map((size) => (
										<SelectItem key={size} value={String(size)} className="text-xs">
											{size}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="flex items-center gap-1.5">
						<Button
							variant="outline"
							size="icon"
							className="size-8 rounded-lg"
							disabled={page <= 1 || isLoading}
							onClick={() => onPageChange(Math.max(1, page - 1))}>
							<ChevronLeft className="size-4" />
							<span className="sr-only">Previous page</span>
						</Button>
						<span className="text-xs text-muted-foreground px-2">
							Page {page} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="icon"
							className="size-8 rounded-lg"
							disabled={page >= totalPages || isLoading}
							onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
							<ChevronRight className="size-4" />
							<span className="sr-only">Next page</span>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
