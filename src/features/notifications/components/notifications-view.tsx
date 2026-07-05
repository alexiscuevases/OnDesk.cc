import { useState } from "react";
import {
	Bell,
	CheckCheck,
	ChevronLeft,
	ChevronRight,
	Inbox,
	X,
} from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, PanelHeader, EmptyState, ConsoleTag } from "@/shared/components/console";
import { useWorkspace } from "@/context/workspace-context";
import { useNotifications } from "@/context/notifications-context";
import { useNotificationsQuery } from "../hooks/use-notification-queries";
import {
	NotificationIcon,
	TICKET_NOTIFICATION_TYPES,
	formatRelativeTime,
} from "./notification-icon";
import type { Notification, NotificationFilter } from "../api/notifications-api";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const TYPE_LABELS: Record<Notification["type"], string> = {
	ticket: "Ticket",
	assign: "Assignment",
	resolved: "Resolved",
	message: "Message",
	sla: "SLA",
};

export function NotificationsView() {
	const { workspace } = useWorkspace();
	const workspaceId = workspace.id;
	const { unreadCount, totalCount, markAllRead, dismissNotification, markAsRead } = useNotifications();
	const navigate = useNavigate();
	const { slug } = useParams({ strict: false }) as { slug: string };

	const [filter, setFilter] = useState<NotificationFilter>("all");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	const { data, isLoading, isFetching } = useNotificationsQuery(workspaceId, filter, { page, pageSize });
	const notifications = data?.notifications ?? [];
	const total = data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / pageSize));
	const pageStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const pageEnd = Math.min(page * pageSize, total);

	function openNotification(notif: Notification) {
		markAsRead(notif.id);
		if (notif.resource_id && TICKET_NOTIFICATION_TYPES.includes(notif.type)) {
			navigate({ to: "/w/$slug/tickets/$id", params: { slug, id: notif.resource_id } });
		}
	}

	function changeFilter(next: NotificationFilter) {
		setFilter(next);
		setPage(1);
	}

	function changePageSize(next: number) {
		setPageSize(next);
		setPage(1);
	}

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				tag="07 — Notifications"
				title="Notifications"
				description="Stay on top of ticket activity, assignments, and SLA alerts"
				actions={
					unreadCount > 0 ? (
						<Button variant="outline" size="sm" onClick={markAllRead} className="shrink-0">
							<CheckCheck className="size-4" />
							Mark all read
						</Button>
					) : undefined
				}
			/>

			<Tabs value={filter} onValueChange={(v) => changeFilter(v as NotificationFilter)}>
				<TabsList>
					<TabsTrigger value="all">
						All
						<Badge variant="secondary" className="ml-1.5 h-5 px-1.5 font-mono text-[10px] tabular-nums">
							{totalCount}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="unread">
						Unread
						{unreadCount > 0 && (
							<Badge variant="secondary" className="ml-1.5 h-5 px-1.5 font-mono text-[10px] tabular-nums">
								{unreadCount}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<Card className="gap-0 py-0 overflow-hidden">
				<PanelHeader
					label={filter === "unread" ? "Unread notifications" : "All notifications"}
					right={
						<ConsoleTag>
							{isLoading && total === 0
								? "Loading…"
								: `${total} notification${total !== 1 ? "s" : ""}`}
						</ConsoleTag>
					}
				/>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-secondary/50 hover:bg-secondary/50">
								<TableHead style={{ width: 24 }} className="pl-6" />
								<TableHead>Type</TableHead>
								<TableHead>Notification</TableHead>
								<TableHead>When</TableHead>
								<TableHead style={{ width: 48 }} className="pr-6" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{notifications.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="py-6">
										<EmptyState
											icon={filter === "unread" ? CheckCheck : Inbox}
											title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
											description={
												filter === "unread"
													? "You're all caught up."
													: "Activity from your workspace will show up here."
											}
											className="py-0"
										/>
									</TableCell>
								</TableRow>
							) : (
								notifications.map((n) => {
									const clickable = !!n.resource_id && TICKET_NOTIFICATION_TYPES.includes(n.type);
									return (
										<TableRow
											key={n.id}
											className={`transition-colors ${!n.read ? "bg-primary/5" : ""} ${
												clickable ? "cursor-pointer hover:bg-secondary/40" : "hover:bg-secondary/30"
											}`}
											onClick={() => clickable && openNotification(n)}>
											<TableCell className="pl-6">
												{n.read ? (
													<div className="size-1.5 rounded-full bg-transparent" />
												) : (
													<div className="size-1.5 rounded-full bg-accent" />
												)}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2.5">
													<NotificationIcon type={n.type} />
													<span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
														{TYPE_LABELS[n.type]}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="min-w-0 max-w-xl">
													<p
														className={`text-sm truncate ${
															n.read ? "text-muted-foreground" : "text-foreground font-medium"
														}`}>
														{n.title}
													</p>
													<p className="text-xs text-muted-foreground/80 truncate mt-0.5">
														{n.description}
													</p>
												</div>
											</TableCell>
											<TableCell>
												<span className="font-mono text-xs text-muted-foreground whitespace-nowrap tabular-nums">
													{formatRelativeTime(n.created_at)}
												</span>
											</TableCell>
											<TableCell className="pr-6" onClick={(e) => e.stopPropagation()}>
												<Button
													variant="ghost"
													size="icon"
													className="size-7 text-muted-foreground/50 hover:text-destructive"
													onClick={(e) => {
														e.stopPropagation();
														dismissNotification(n.id);
													}}>
													<X className="size-3.5" />
													<span className="sr-only">Dismiss notification</span>
												</Button>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>

					{total > 0 && (
						<div className="flex items-center justify-between px-6 py-4 border-t">
							<div className="flex items-center gap-3">
								<p className="font-mono text-xs text-muted-foreground tabular-nums">
									Showing {pageStart}–{pageEnd} of {total}
								</p>
								<div className="flex items-center gap-1.5">
									<span className="text-xs text-muted-foreground">Rows:</span>
									<Select value={String(pageSize)} onValueChange={(v) => changePageSize(Number(v))}>
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
									className="size-8"
									disabled={page <= 1}
									onClick={() => setPage((p) => Math.max(1, p - 1))}>
									<ChevronLeft className="size-4" />
									<span className="sr-only">Previous page</span>
								</Button>
								<span className="font-mono text-xs text-muted-foreground px-2 tabular-nums">
									Page {page} of {pageCount}
								</span>
								<Button
									variant="outline"
									size="icon"
									className="size-8"
									disabled={page >= pageCount}
									onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
									<ChevronRight className="size-4" />
									<span className="sr-only">Next page</span>
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{isLoading && total === 0 && (
				<div className="flex items-center justify-center py-10 text-muted-foreground">
					<Bell className="size-4 mr-2 animate-pulse" />
					<p className="text-sm">Loading notifications…</p>
				</div>
			)}
			{isFetching && total > 0 && null}
		</div>
	);
}
