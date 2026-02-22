"use client";

import { useState, useEffect } from "react";
import { Search, Filter, SortAsc, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Trash2, UserPlus, Users, Merge } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { tickets as initialTickets, agents, teams, type TicketStatus, type TicketPriority, type Agent } from "@/lib/data";

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

	// Selected values for modals
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
			(t.id.toLowerCase().includes(mergeSearch.toLowerCase()) || t.subject.toLowerCase().includes(mergeSearch.toLowerCase())),
	);

	const filteredAgents = agents.filter(
		(a) => a.name.toLowerCase().includes(agentSearch.toLowerCase()) || a.email.toLowerCase().includes(agentSearch.toLowerCase()),
	);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedTickets(filtered.map((t) => t.id));
		} else {
			setSelectedTickets([]);
		}
	};

	const handleSelectTicket = (ticketId: string, checked: boolean) => {
		if (checked) {
			setSelectedTickets((prev) => [...prev, ticketId]);
		} else {
			setSelectedTickets((prev) => prev.filter((id) => id !== ticketId));
		}
	};

	const handleDeleteTickets = () => {
		setTickets((prev) => prev.filter((t) => !selectedTickets.includes(t.id)));
		setSelectedTickets([]);
		setDeleteDialogOpen(false);
	};

	const handleAssignTeam = () => {
		if (selectedTeam) {
			setTickets((prev) => prev.map((t) => (selectedTickets.includes(t.id) ? { ...t, team: selectedTeam } : t)));
			setSelectedTickets([]);
			setAssignTeamDialogOpen(false);
			setSelectedTeam("");
		}
	};

	const handleAssignAgent = () => {
		if (selectedAgent) {
			setTickets((prev) => prev.map((t) => (selectedTickets.includes(t.id) ? { ...t, assignee: selectedAgent.name } : t)));
			setSelectedTickets([]);
			setAssignAgentDialogOpen(false);
			setSelectedAgent(null);
			setAgentSearch("");
		}
	};

	const handleMergeTickets = () => {
		if (mergeTargetId) {
			console.log("[v0] Merging tickets:", selectedTickets, "into", mergeTargetId);
			// In a real app, this would merge the tickets
			setMergeDialogOpen(false);
			setMergeTargetId("");
			setMergeSearch("");
			setSelectedTickets([]);
		}
	};

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

			{/* Bulk Actions Bar */}
			{selectedTickets.length > 0 && (
				<Card className="border-primary/50 shadow-md">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Badge variant="secondary" className="text-xs">
									{selectedTickets.length} selected
								</Badge>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={() => setAssignTeamDialogOpen(true)}>
									<Users className="size-3.5" />
									Assign Team
								</Button>
								<Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={() => setAssignAgentDialogOpen(true)}>
									<UserPlus className="size-3.5" />
									Assign Agent
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-8 gap-1.5 rounded-lg text-xs"
									onClick={() => setMergeDialogOpen(true)}
									disabled={selectedTickets.length < 2}>
									<Merge className="size-3.5" />
									Merge
								</Button>
								<Button variant="destructive" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={() => setDeleteDialogOpen(true)}>
									<Trash2 className="size-3.5" />
									Delete
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

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
								<TableHead className="w-12 pl-6">
									<Checkbox checked={selectedTickets.length === filtered.length && filtered.length > 0} onCheckedChange={handleSelectAll} />
								</TableHead>
								<TableHead className="w-24 text-[11px] font-semibold uppercase tracking-wider">ID</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Subject</TableHead>
								<TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider">Requester</TableHead>
								<TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider">Team</TableHead>
								<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider">Assignee</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Priority</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
								<TableHead className="w-12 pr-6"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.map((ticket) => (
								<TableRow key={ticket.id} className="hover:bg-secondary/40 transition-colors">
									<TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
										<Checkbox
											checked={selectedTickets.includes(ticket.id)}
											onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
										/>
									</TableCell>
									<TableCell
										className="font-mono text-xs font-semibold text-primary/70 cursor-pointer"
										onClick={() => onOpenTicket(ticket.id)}>
										{ticket.id}
									</TableCell>
									<TableCell className="cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
										<div className="max-w-[200px] lg:max-w-[300px]">
											<p className="text-sm font-medium truncate">{ticket.subject}</p>
										</div>
									</TableCell>
									<TableCell className="hidden md:table-cell cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
										<div className="flex items-center gap-2">
											<Avatar className="size-7">
												<AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
													{getInitials(ticket.requester)}
												</AvatarFallback>
											</Avatar>
											<span className="text-xs text-muted-foreground">{ticket.requester}</span>
										</div>
									</TableCell>
									<TableCell className="hidden lg:table-cell cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
										<Badge variant="secondary" className="text-[10px] rounded-full px-2 font-medium">
											{ticket.team}
										</Badge>
									</TableCell>
									<TableCell className="hidden sm:table-cell cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
										<div className="flex items-center gap-2">
											<Avatar className="size-7">
												<AvatarFallback className="text-[10px] bg-accent/80 text-accent-foreground font-semibold">
													{getInitials(ticket.assignee)}
												</AvatarFallback>
											</Avatar>
											<span className="text-xs">{ticket.assignee}</span>
										</div>
									</TableCell>
									<TableCell className="cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
										<PriorityBadge priority={ticket.priority} />
									</TableCell>
									<TableCell className="cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
										<StatusBadge status={ticket.status} />
									</TableCell>
									<TableCell className="pr-6" onClick={(e) => e.stopPropagation()}>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="size-8 rounded-lg">
													<MoreHorizontal className="size-4" />
													<span className="sr-only">Actions</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => onOpenTicket(ticket.id)}>
													<Eye className="size-3.5 mr-2" />
													View
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setSelectedTickets([ticket.id]);
														setDeleteDialogOpen(true);
													}}>
													<Trash2 className="size-3.5 mr-2" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
							{filtered.length === 0 && (
								<TableRow>
									<TableCell colSpan={9} className="h-24 text-center text-muted-foreground text-sm">
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

			{/* Delete Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-base">Delete Ticket{selectedTickets.length > 1 ? "s" : ""}?</AlertDialogTitle>
						<AlertDialogDescription className="text-xs">
							Are you sure you want to delete {selectedTickets.length} ticket{selectedTickets.length > 1 ? "s" : ""}? This action cannot be undone
							and will permanently remove the ticket{selectedTickets.length > 1 ? "s" : ""} and all {selectedTickets.length > 1 ? "their" : "its"}{" "}
							messages.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTickets}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">
							<Trash2 className="size-3.5 mr-2" />
							Delete Ticket{selectedTickets.length > 1 ? "s" : ""}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Assign Agent Dialog */}
			<Dialog open={assignAgentDialogOpen} onOpenChange={setAssignAgentDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Assign Agent</DialogTitle>
						<DialogDescription className="text-xs">
							Select an agent to assign {selectedTickets.length} ticket{selectedTickets.length > 1 ? "s" : ""} to
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search agents..."
								value={agentSearch}
								onChange={(e) => setAgentSearch(e.target.value)}
								className="pl-9 h-9 rounded-lg"
							/>
						</div>
						<div className="max-h-[300px] overflow-y-auto rounded-lg border">
							{filteredAgents.length > 0 ? (
								<div className="p-1">
									{filteredAgents.map((agent) => (
										<button
											key={agent.id}
											onClick={() => setSelectedAgent(agent)}
											className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors ${
												selectedAgent?.id === agent.id ? "bg-secondary" : ""
											}`}>
											<Avatar className="size-8 rounded-lg">
												<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
													{agent.initials}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0 text-left">
												<div className="flex items-center gap-2">
													<p className="text-sm font-medium truncate">{agent.name}</p>
													<div
														className={`size-2 rounded-full ${
															agent.status === "online"
																? "bg-accent"
																: agent.status === "away"
																	? "bg-warning"
																	: "bg-muted-foreground"
														}`}
													/>
												</div>
												<p className="text-xs text-muted-foreground truncate">{agent.role}</p>
												<p className="text-[10px] text-muted-foreground">{agent.tickets} active tickets</p>
											</div>
											{selectedAgent?.id === agent.id && <CheckCircle2 className="size-4 text-primary shrink-0" />}
										</button>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
									<UserPlus className="size-8 mb-2 opacity-30" />
									<p className="text-sm">No agents found</p>
								</div>
							)}
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setAssignAgentDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={handleAssignAgent} disabled={!selectedAgent} className="rounded-lg">
							Assign Ticket{selectedTickets.length > 1 ? "s" : ""}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Assign Team Dialog */}
			<Dialog open={assignTeamDialogOpen} onOpenChange={setAssignTeamDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Assign Team</DialogTitle>
						<DialogDescription className="text-xs">
							Select which team should handle {selectedTickets.length} ticket{selectedTickets.length > 1 ? "s" : ""}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-2 py-2">
						<div className="max-h-[300px] overflow-y-auto rounded-lg border p-2">
							{teams.map((team) => {
								const isSelected = selectedTeam === team.name;
								return (
									<div
										key={team.id}
										className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer"
										onClick={() => setSelectedTeam(team.name)}>
										<Checkbox checked={isSelected} className="size-4" />
										<Avatar className="size-7 rounded-lg">
											<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[9px] font-bold">
												{team.avatar}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium">{team.name}</p>
											<p className="text-[10px] text-muted-foreground truncate">{team.description}</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setAssignTeamDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={handleAssignTeam} disabled={!selectedTeam} className="rounded-lg">
							Assign Team
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Merge Tickets Dialog */}
			<Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="text-base">Merge Tickets</DialogTitle>
						<DialogDescription className="text-xs">
							Merge {selectedTickets.length} ticket{selectedTickets.length > 1 ? "s" : ""} into another existing ticket. All messages and history
							will be combined.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search by ticket ID or subject..."
								value={mergeSearch}
								onChange={(e) => setMergeSearch(e.target.value)}
								className="pl-9 h-9 rounded-lg"
							/>
						</div>
						<div className="max-h-[300px] overflow-y-auto rounded-lg border">
							{mergeableTickets.length > 0 ? (
								<div className="p-1">
									{mergeableTickets.map((targetTicket) => (
										<button
											key={targetTicket.id}
											onClick={() => setMergeTargetId(targetTicket.id)}
											className={`w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors text-left ${
												mergeTargetId === targetTicket.id ? "bg-secondary" : ""
											}`}>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span className="text-xs font-mono font-semibold text-primary/70">{targetTicket.id}</span>
													<StatusBadge status={targetTicket.status} />
												</div>
												<p className="text-sm font-medium truncate">{targetTicket.subject}</p>
												<p className="text-xs text-muted-foreground truncate">
													{targetTicket.requester} • {targetTicket.team}
												</p>
											</div>
											{mergeTargetId === targetTicket.id && <CheckCircle2 className="size-4 text-primary shrink-0 mt-1" />}
										</button>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
									<AlertCircle className="size-8 mb-2 opacity-30" />
									<p className="text-sm">No tickets found</p>
								</div>
							)}
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setMergeDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={handleMergeTickets} disabled={!mergeTargetId} className="rounded-lg">
							Merge Tickets
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
