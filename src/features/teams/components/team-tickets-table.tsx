import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronsUpDown,
	Inbox,
	Search,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/shared/components/status-badge";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { TicketAiStatusBadge } from "@/shared/components/ticket-ai-status-badge";
import type { Ticket } from "@/features/tickets/api/tickets-api";
import type { Contact } from "@/features/contacts/api/contacts-api";
import type { Company } from "@/features/companies/api/companies-api";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const PRIORITY_RANK: Record<Ticket["priority"], number> = {
	urgent: 4,
	high: 3,
	medium: 2,
	low: 1,
};

const STATUS_RANK: Record<Ticket["status"], number> = {
	open: 4,
	pending: 3,
	resolved: 2,
	closed: 1,
};

function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

interface TeamTicketsTableProps {
	tickets: Ticket[];
	contacts: Contact[];
	companies: Company[];
	onOpenTicket: (id: string) => void;
	emptyState?: React.ReactNode;
}

export function TeamTicketsTable({ tickets, contacts, companies, onOpenTicket, emptyState }: TeamTicketsTableProps) {
	const [sorting, setSorting] = useState<SortingState>([{ id: "updated_at", desc: true }]);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	const contactMap = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);
	const companyMap = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

	const columns = useMemo<ColumnDef<Ticket>[]>(
		() => [
			{
				id: "number",
				accessorKey: "number",
				header: "ID",
				size: 80,
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
				header: "Subject",
				cell: ({ row }) => {
					const ticket = row.original;
					const contact = ticket.contact_id ? contactMap.get(ticket.contact_id) ?? null : null;
					const company = contact?.company_id ? companyMap.get(contact.company_id) ?? null : null;
					return (
						<div className="flex items-center gap-2.5 min-w-0 max-w-md">
							<Avatar className="size-7 rounded-lg shrink-0">
								<AvatarImage src={company?.logo_url ?? undefined} className="object-cover rounded-lg" />
								<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
									{contact ? getInitials(contact.name) : "?"}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="text-sm font-medium truncate">{ticket.subject}</p>
								<p className="text-[11px] text-muted-foreground truncate">
									{contact ? contact.name : "No contact"}
								</p>
							</div>
						</div>
					);
				},
			},
			{
				id: "ai",
				header: "AI",
				enableSorting: false,
				cell: ({ row }) => (
					<TicketAiStatusBadge ticket={row.original} className="text-[10px] rounded-full px-2" />
				),
			},
			{
				id: "priority",
				accessorKey: "priority",
				header: "Priority",
				sortingFn: (a, b) => PRIORITY_RANK[a.original.priority] - PRIORITY_RANK[b.original.priority],
				cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
			},
			{
				id: "status",
				accessorKey: "status",
				header: "Status",
				sortingFn: (a, b) => STATUS_RANK[a.original.status] - STATUS_RANK[b.original.status],
				cell: ({ row }) => <StatusBadge status={row.original.status} />,
			},
			{
				id: "updated_at",
				accessorKey: "updated_at",
				header: "Updated",
				size: 120,
				cell: ({ row }) => (
					<span className="text-xs text-muted-foreground whitespace-nowrap">
						{new Date(row.original.updated_at * 1000).toLocaleDateString()}
					</span>
				),
			},
		],
		[contactMap, companyMap],
	);

	const table = useReactTable({
		data: tickets,
		columns,
		state: { sorting, pagination: { pageIndex, pageSize } },
		onSortingChange: (updater) => {
			const next = typeof updater === "function" ? updater(sorting) : updater;
			setSorting(next);
			setPageIndex(0);
		},
		onPaginationChange: (updater) => {
			const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
			setPageIndex(next.pageIndex);
			setPageSize(next.pageSize);
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const totalCount = tickets.length;
	const pageCount = table.getPageCount();
	const pageStart = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
	const pageEnd = Math.min((pageIndex + 1) * pageSize, totalCount);

	if (totalCount === 0) {
		return (
			emptyState ?? (
				<div className="flex flex-col items-center justify-center py-10 text-center">
					<Search className="size-8 text-muted-foreground/40 mb-2" />
					<p className="text-sm font-medium text-muted-foreground">No tickets</p>
				</div>
			)
		);
	}

	return (
		<div className="flex flex-col">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="bg-secondary/50 hover:bg-secondary/50">
							{headerGroup.headers.map((header, idx) => {
								const canSort = header.column.getCanSort();
								const sortDir = header.column.getIsSorted();
								const lastIdx = headerGroup.headers.length - 1;
								return (
									<TableHead
										key={header.id}
										style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
										className={`text-[11px] font-semibold uppercase tracking-wider ${
											idx === 0 ? "pl-4" : ""
										} ${idx === lastIdx ? "pr-4" : ""}`}>
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
							<TableCell colSpan={columns.length} className="py-10 text-center">
								<div className="flex flex-col items-center gap-2">
									<Inbox className="size-6 text-muted-foreground/40" />
									<p className="text-sm font-medium text-muted-foreground">No matching tickets</p>
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
									return (
										<TableCell
											key={cell.id}
											className={`${idx === 0 ? "pl-4" : ""} ${idx === lastIdx ? "pr-4" : ""}`}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									);
								})}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{totalCount > pageSize && (
				<div className="flex items-center justify-between px-4 py-3 border-t">
					<div className="flex items-center gap-3">
						<p className="text-xs text-muted-foreground">
							{pageStart}–{pageEnd} of {totalCount}
						</p>
						<div className="flex items-center gap-1.5">
							<span className="text-xs text-muted-foreground">Rows:</span>
							<Select
								value={String(pageSize)}
								onValueChange={(v) => {
									setPageSize(Number(v));
									setPageIndex(0);
								}}>
								<SelectTrigger className="h-7 w-16 text-xs">
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
							className="size-7 rounded-lg"
							disabled={!table.getCanPreviousPage()}
							onClick={() => table.previousPage()}>
							<ChevronLeft className="size-3.5" />
							<span className="sr-only">Previous page</span>
						</Button>
						<span className="text-xs text-muted-foreground px-1.5">
							{pageIndex + 1} / {Math.max(1, pageCount)}
						</span>
						<Button
							variant="outline"
							size="icon"
							className="size-7 rounded-lg"
							disabled={!table.getCanNextPage()}
							onClick={() => table.nextPage()}>
							<ChevronRight className="size-3.5" />
							<span className="sr-only">Next page</span>
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
