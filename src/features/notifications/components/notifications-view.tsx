import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Bell,
	CheckCheck,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronsUpDown,
	Inbox,
	X,
} from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from "@/context/notifications-context";
import {
	NotificationIcon,
	TICKET_NOTIFICATION_TYPES,
	formatRelativeTime,
} from "./notification-icon";
import type { Notification } from "../api/notifications-api";

type Filter = "all" | "unread";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const TYPE_LABELS: Record<Notification["type"], string> = {
	ticket: "Ticket",
	assign: "Assignment",
	resolved: "Resolved",
	message: "Message",
	sla: "SLA",
};

export function NotificationsView() {
	const { notifications, unreadCount, isLoading, markAllRead, dismissNotification, markAsRead } =
		useNotifications();
	const navigate = useNavigate();
	const { slug } = useParams({ strict: false }) as { slug: string };
	const [filter, setFilter] = useState<Filter>("all");
	const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(25);

	const data = useMemo(
		() => (filter === "unread" ? notifications.filter((n) => !n.read) : notifications),
		[notifications, filter],
	);

	function openNotification(notif: Notification) {
		markAsRead(notif.id);
		if (notif.resource_id && TICKET_NOTIFICATION_TYPES.includes(notif.type)) {
			navigate({ to: "/w/$slug/tickets/$id", params: { slug, id: notif.resource_id } });
		}
	}

	const columns = useMemo<ColumnDef<Notification>[]>(
		() => [
			{
				id: "indicator",
				header: "",
				cell: ({ row }) =>
					row.original.read ? (
						<div className="size-1.5 rounded-full bg-transparent" />
					) : (
						<div className="size-1.5 rounded-full bg-primary" />
					),
				enableSorting: false,
				size: 24,
			},
			{
				id: "type",
				accessorKey: "type",
				header: "Type",
				cell: ({ row }) => (
					<div className="flex items-center gap-2.5">
						<NotificationIcon type={row.original.type} />
						<span className="text-xs font-medium text-muted-foreground">
							{TYPE_LABELS[row.original.type]}
						</span>
					</div>
				),
			},
			{
				id: "title",
				accessorKey: "title",
				header: "Notification",
				cell: ({ row }) => {
					const n = row.original;
					return (
						<div className="min-w-0 max-w-xl">
							<p
								className={`text-sm truncate ${
									n.read ? "text-muted-foreground" : "text-foreground font-medium"
								}`}>
								{n.title}
							</p>
							<p className="text-xs text-muted-foreground/80 truncate mt-0.5">{n.description}</p>
						</div>
					);
				},
			},
			{
				id: "created_at",
				accessorKey: "created_at",
				header: "When",
				cell: ({ row }) => (
					<span className="text-xs text-muted-foreground whitespace-nowrap">
						{formatRelativeTime(row.original.created_at)}
					</span>
				),
				sortingFn: (a, b) => a.original.created_at - b.original.created_at,
			},
			{
				id: "actions",
				header: "",
				enableSorting: false,
				cell: ({ row }) => (
					<Button
						variant="ghost"
						size="icon"
						className="size-7 rounded-md text-muted-foreground/50 hover:text-destructive"
						onClick={(e) => {
							e.stopPropagation();
							dismissNotification(row.original.id);
						}}>
						<X className="size-3.5" />
						<span className="sr-only">Dismiss notification</span>
					</Button>
				),
				size: 48,
			},
		],
		[dismissNotification],
	);

	const table = useReactTable({
		data,
		columns,
		state: { sorting, pagination: { pageIndex, pageSize } },
		onSortingChange: setSorting,
		onPaginationChange: (updater) => {
			const next =
				typeof updater === "function"
					? updater({ pageIndex, pageSize })
					: updater;
			setPageIndex(next.pageIndex);
			setPageSize(next.pageSize);
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const totalCount = data.length;
	const pageCount = table.getPageCount();
	const pageStart = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
	const pageEnd = Math.min((pageIndex + 1) * pageSize, totalCount);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Stay on top of ticket activity, assignments, and SLA alerts
					</p>
				</div>
				{unreadCount > 0 && (
					<Button variant="outline" size="sm" onClick={markAllRead} className="shrink-0">
						<CheckCheck className="size-4" />
						Mark all read
					</Button>
				)}
			</div>

			<Tabs
				value={filter}
				onValueChange={(v) => {
					setFilter(v as Filter);
					setPageIndex(0);
				}}>
				<TabsList>
					<TabsTrigger value="all">
						All
						<Badge variant="secondary" className="ml-1.5 h-5 rounded-full px-1.5 text-[10px]">
							{notifications.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="unread">
						Unread
						{unreadCount > 0 && (
							<Badge variant="secondary" className="ml-1.5 h-5 rounded-full px-1.5 text-[10px]">
								{unreadCount}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<Card className="border-0 shadow-sm overflow-hidden">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">
						{filter === "unread" ? "Unread notifications" : "All notifications"}
					</CardTitle>
					<CardDescription className="text-xs">
						{isLoading && totalCount === 0
							? "Loading…"
							: `${totalCount} notification${totalCount !== 1 ? "s" : ""}`}
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
										return (
											<TableHead
												key={header.id}
												style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
												className={`text-[11px] font-semibold uppercase tracking-wider ${
													idx === 0 ? "pl-6" : ""
												} ${idx === headerGroup.headers.length - 1 ? "pr-6" : ""}`}>
												{header.isPlaceholder ? null : canSort ? (
													<button
														type="button"
														onClick={header.column.getToggleSortingHandler()}
														className="flex items-center gap-1.5 hover:text-foreground transition-colors">
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
												{filter === "unread" ? (
													<CheckCheck className="size-5 text-muted-foreground" />
												) : (
													<Inbox className="size-5 text-muted-foreground" />
												)}
											</div>
											<p className="text-sm font-medium">
												{filter === "unread" ? "No unread notifications" : "No notifications yet"}
											</p>
											<p className="text-[11px] text-muted-foreground">
												{filter === "unread"
													? "You're all caught up."
													: "Activity from your workspace will show up here."}
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								table.getRowModel().rows.map((row) => {
									const n = row.original;
									const clickable = !!n.resource_id && TICKET_NOTIFICATION_TYPES.includes(n.type);
									return (
										<TableRow
											key={row.id}
											className={`transition-colors ${!n.read ? "bg-primary/5" : ""} ${
												clickable ? "cursor-pointer hover:bg-secondary/40" : "hover:bg-secondary/30"
											}`}
											onClick={() => clickable && openNotification(n)}>
											{row.getVisibleCells().map((cell, idx) => (
												<TableCell
													key={cell.id}
													className={`${idx === 0 ? "pl-6" : ""} ${
														idx === row.getVisibleCells().length - 1 ? "pr-6" : ""
													}`}
													onClick={
														idx === row.getVisibleCells().length - 1
															? (e) => e.stopPropagation()
															: undefined
													}>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>

					{totalCount > 0 && (
						<div className="flex items-center justify-between px-6 py-4 border-t">
							<div className="flex items-center gap-3">
								<p className="text-xs text-muted-foreground">
									Showing {pageStart}–{pageEnd} of {totalCount}
								</p>
								<div className="flex items-center gap-1.5">
									<span className="text-xs text-muted-foreground">Rows:</span>
									<Select
										value={String(pageSize)}
										onValueChange={(v) => {
											setPageSize(Number(v));
											setPageIndex(0);
										}}>
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
									disabled={!table.getCanPreviousPage()}
									onClick={() => table.previousPage()}>
									<ChevronLeft className="size-4" />
									<span className="sr-only">Previous page</span>
								</Button>
								<span className="text-xs text-muted-foreground px-2">
									Page {pageIndex + 1} of {Math.max(1, pageCount)}
								</span>
								<Button
									variant="outline"
									size="icon"
									className="size-8 rounded-lg"
									disabled={!table.getCanNextPage()}
									onClick={() => table.nextPage()}>
									<ChevronRight className="size-4" />
									<span className="sr-only">Next page</span>
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{isLoading && totalCount === 0 && (
				<div className="flex items-center justify-center py-10 text-muted-foreground">
					<Bell className="size-4 mr-2 animate-pulse" />
					<p className="text-sm">Loading notifications…</p>
				</div>
			)}
		</div>
	);
}
