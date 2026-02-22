"use client";

import { useState } from "react";
import { Search, Filter, SortAsc, ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tickets, type TicketStatus, type TicketPriority } from "@/lib/data";

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function StatusBadge({ status }: { status: TicketStatus }) {
	const styles: Record<TicketStatus, string> = {
		open: "border-chart-1 text-chart-1 bg-chart-1/10",
		"in-progress": "border-warning text-warning bg-warning/10",
		resolved: "border-success text-success bg-success/10",
		closed: "border-muted-foreground text-muted-foreground bg-muted",
	};
	return (
		<Badge variant="outline" className={`text-[10px] rounded-full px-2 ${styles[status]}`}>
			{status}
		</Badge>
	);
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
	const styles: Record<TicketPriority, string> = {
		critical: "bg-destructive/15 text-destructive border border-destructive/20",
		high: "bg-warning/15 text-warning border border-warning/20",
		medium: "bg-primary/15 text-primary border border-primary/20",
		low: "bg-secondary text-secondary-foreground border border-border",
	};
	return <Badge className={`text-[10px] rounded-full px-2 ${styles[priority]}`}>{priority}</Badge>;
}

export function TicketsView({ onOpenTicket }: { onOpenTicket: (id: string) => void }) {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");

	const filtered = tickets.filter((t) => {
		const matchSearch =
			t.subject.toLowerCase().includes(search.toLowerCase()) ||
			t.id.toLowerCase().includes(search.toLowerCase()) ||
			t.requester.toLowerCase().includes(search.toLowerCase());
		const matchStatus = statusFilter === "all" || t.status === statusFilter;
		const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
		return matchSearch && matchStatus && matchPriority;
	});

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

			{/* Filters */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by ID, subject, or requester..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 h-9 bg-card border-border rounded-lg"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Filter className="size-4 text-muted-foreground shrink-0" />
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-36 h-9 rounded-lg text-xs">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="open">Open</SelectItem>
							<SelectItem value="in-progress">In Progress</SelectItem>
							<SelectItem value="resolved">Resolved</SelectItem>
							<SelectItem value="closed">Closed</SelectItem>
						</SelectContent>
					</Select>
					<Select value={priorityFilter} onValueChange={setPriorityFilter}>
						<SelectTrigger className="w-36 h-9 rounded-lg text-xs">
							<SelectValue placeholder="Priority" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Priority</SelectItem>
							<SelectItem value="critical">Critical</SelectItem>
							<SelectItem value="high">High</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="low">Low</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Tickets Table */}
			<Card className="border-0 shadow-sm overflow-hidden">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">All Tickets</CardTitle>
							<CardDescription className="text-xs">
								{filtered.length} ticket{filtered.length !== 1 ? "s" : ""} found
							</CardDescription>
						</div>
						<Button variant="outline" size="sm" className="gap-1.5 h-8 rounded-lg text-xs">
							<SortAsc className="size-3.5" />
							Sort
						</Button>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-secondary/50 hover:bg-secondary/50">
								<TableHead className="w-24 text-[11px] font-semibold uppercase tracking-wider pl-6">ID</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Subject</TableHead>
								<TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider">Requester</TableHead>
								<TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider">Team</TableHead>
								<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider">Assignee</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Priority</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider pr-6">Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.map((ticket) => (
								<TableRow
									key={ticket.id}
									className="cursor-pointer hover:bg-secondary/40 transition-colors"
									onClick={() => onOpenTicket(ticket.id)}>
									<TableCell className="font-mono text-xs font-semibold text-primary/70 pl-6">{ticket.id}</TableCell>
									<TableCell>
										<div className="max-w-[200px] lg:max-w-[300px]">
											<p className="text-sm font-medium truncate">{ticket.subject}</p>
										</div>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<div className="flex items-center gap-2">
											<Avatar className="size-7">
												<AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
													{getInitials(ticket.requester)}
												</AvatarFallback>
											</Avatar>
											<span className="text-xs text-muted-foreground">{ticket.requester}</span>
										</div>
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										<Badge variant="secondary" className="text-[10px] rounded-full px-2 font-medium">
											{ticket.team}
										</Badge>
									</TableCell>
									<TableCell className="hidden sm:table-cell">
										<div className="flex items-center gap-2">
											<Avatar className="size-7">
												<AvatarFallback className="text-[10px] bg-accent/80 text-accent-foreground font-semibold">
													{getInitials(ticket.assignee)}
												</AvatarFallback>
											</Avatar>
											<span className="text-xs">{ticket.assignee}</span>
										</div>
									</TableCell>
									<TableCell>
										<PriorityBadge priority={ticket.priority} />
									</TableCell>
									<TableCell className="pr-6">
										<StatusBadge status={ticket.status} />
									</TableCell>
								</TableRow>
							))}
							{filtered.length === 0 && (
								<TableRow>
									<TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
										No tickets found matching your filters.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					{/* Pagination */}
					<div className="flex items-center justify-between px-6 py-4 border-t">
						<p className="text-xs text-muted-foreground">
							Showing {filtered.length} of {tickets.length} tickets
						</p>
						<div className="flex items-center gap-1.5">
							<Button variant="outline" size="icon" className="size-8 rounded-lg" disabled>
								<ChevronLeft className="size-4" />
								<span className="sr-only">Previous page</span>
							</Button>
							<Button size="sm" className="h-8 min-w-8 rounded-lg text-xs">
								1
							</Button>
							<Button variant="outline" size="icon" className="size-8 rounded-lg" disabled>
								<ChevronRight className="size-4" />
								<span className="sr-only">Next page</span>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
