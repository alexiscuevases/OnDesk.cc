"use client";

import { useState } from "react";
import {
	ArrowLeft,
	Clock,
	User,
	Mail,
	Tag,
	Users,
	Calendar,
	Send,
	Paperclip,
	MoreHorizontal,
	MessageSquare,
	AlertCircle,
	CheckCircle2,
	Eye,
	Edit2,
	Trash2,
	Search,
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	tickets,
	getTicketMessages,
	customers,
	agents,
	teams as teamsData,
	type TicketStatus,
	type TicketPriority,
	type Customer,
	type Agent,
} from "@/lib/data";

function StatusIcon({ status }: { status: TicketStatus }) {
	switch (status) {
		case "open":
			return <AlertCircle className="size-4 text-chart-1" />;
		case "in-progress":
			return <Clock className="size-4 text-warning" />;
		case "resolved":
			return <CheckCircle2 className="size-4 text-accent" />;
		case "closed":
			return <CheckCircle2 className="size-4 text-muted-foreground" />;
	}
}

function StatusBadge({ status }: { status: TicketStatus }) {
	const styles: Record<TicketStatus, string> = {
		open: "border-chart-1 text-chart-1 bg-chart-1/10",
		"in-progress": "border-warning text-warning bg-warning/10",
		resolved: "border-accent text-accent bg-accent/10",
		closed: "border-muted-foreground text-muted-foreground bg-muted",
	};
	return (
		<Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[status]}`}>
			<StatusIcon status={status} />
			<span className="ml-1.5 capitalize">{status.replace("-", " ")}</span>
		</Badge>
	);
}

function PriorityIndicator({ priority }: { priority: TicketPriority }) {
	const colors: Record<TicketPriority, string> = {
		critical: "bg-destructive",
		high: "bg-warning",
		medium: "bg-primary",
		low: "bg-muted-foreground",
	};
	return (
		<div className="flex items-center gap-2">
			<div className={`size-2 rounded-full ${colors[priority]}`} />
			<span className="text-sm capitalize font-medium">{priority}</span>
		</div>
	);
}

export function TicketDetailView({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
	const [reply, setReply] = useState("");
	const [isInternal, setIsInternal] = useState(false);

	// Modal states
	const [requesterDialogOpen, setRequesterDialogOpen] = useState(false);
	const [assigneeDialogOpen, setAssigneeDialogOpen] = useState(false);
	const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	const [titleDialogOpen, setTitleDialogOpen] = useState(false);
	const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);
	const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	// Selected values
	const [selectedRequester, setSelectedRequester] = useState<Customer | null>(null);
	const [selectedAssignee, setSelectedAssignee] = useState<Agent | null>(null);
	const [selectedPriority, setSelectedPriority] = useState<TicketPriority>("medium");
	const [selectedStatus, setSelectedStatus] = useState<TicketStatus>("open");
	const [editedTitle, setEditedTitle] = useState("");
	const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
	const [mergeTargetId, setMergeTargetId] = useState("");

	// Search states
	const [requesterSearch, setRequesterSearch] = useState("");
	const [assigneeSearch, setAssigneeSearch] = useState("");
	const [mergeSearch, setMergeSearch] = useState("");

	const ticket = tickets.find((t) => t.id === ticketId);
	const messages = getTicketMessages(ticketId);

	if (!ticket) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-3">
				<p className="text-muted-foreground">Ticket not found</p>
				<Button variant="outline" onClick={onBack}>
					Go Back
				</Button>
			</div>
		);
	}

	const currentRequester = customers.find((c) => c.email === ticket.requester);
	const currentAssignee = agents.find((a) => a.name === ticket.assignee);

	function openRequesterDialog() {
		setSelectedRequester(currentRequester || null);
		setRequesterDialogOpen(true);
	}

	function openAssigneeDialog() {
		setSelectedAssignee(currentAssignee || null);
		setAssigneeDialogOpen(true);
	}

	function openPriorityDialog() {
		setSelectedPriority(ticket.priority);
		setPriorityDialogOpen(true);
	}

	function openStatusDialog() {
		setSelectedStatus(ticket.status);
		setStatusDialogOpen(true);
	}

	function openTitleDialog() {
		setEditedTitle(ticket.subject);
		setTitleDialogOpen(true);
	}

	function openTeamsDialog() {
		setSelectedTeams([ticket.team]);
		setTeamsDialogOpen(true);
	}

	function handleSaveRequester() {
		if (selectedRequester) {
			console.log("[v0] Updating requester to:", selectedRequester.email);
			// Here you would update the ticket in your state/backend
		}
		setRequesterDialogOpen(false);
	}

	function handleSaveAssignee() {
		if (selectedAssignee) {
			console.log("[v0] Updating assignee to:", selectedAssignee.name);
			// Here you would update the ticket in your state/backend
		}
		setAssigneeDialogOpen(false);
	}

	function handleSavePriority() {
		console.log("[v0] Updating priority to:", selectedPriority);
		// Here you would update the ticket in your state/backend
		setPriorityDialogOpen(false);
	}

	function handleSaveStatus() {
		console.log("[v0] Updating status to:", selectedStatus);
		// Here you would update the ticket in your state/backend
		setStatusDialogOpen(false);
	}

	function handleSaveTitle() {
		if (editedTitle.trim()) {
			console.log("[v0] Updating title to:", editedTitle);
			// Here you would update the ticket in your state/backend
		}
		setTitleDialogOpen(false);
	}

	function handleSaveTeams() {
		console.log("[v0] Updating teams to:", selectedTeams);
		// Here you would update the ticket in your state/backend
		setTeamsDialogOpen(false);
	}

	function handleMergeTicket() {
		if (mergeTargetId) {
			console.log("[v0] Merging ticket", ticketId, "into", mergeTargetId);
			// Here you would merge the tickets in your state/backend
			setMergeDialogOpen(false);
			onBack();
		}
	}

	function handleDeleteTicket() {
		console.log("[v0] Deleting ticket:", ticketId);
		// Here you would delete the ticket from your state/backend
		setDeleteDialogOpen(false);
		onBack();
	}

	const filteredCustomers = customers.filter(
		(c) => c.name.toLowerCase().includes(requesterSearch.toLowerCase()) || c.email.toLowerCase().includes(requesterSearch.toLowerCase()),
	);

	const filteredAgents = agents.filter(
		(a) => a.name.toLowerCase().includes(assigneeSearch.toLowerCase()) || a.email.toLowerCase().includes(assigneeSearch.toLowerCase()),
	);

	const mergeableTickets = tickets.filter(
		(t) => t.id !== ticketId && (t.id.toLowerCase().includes(mergeSearch.toLowerCase()) || t.subject.toLowerCase().includes(mergeSearch.toLowerCase())),
	);

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-start gap-4">
				<Button variant="ghost" size="icon" onClick={onBack} className="size-9 rounded-lg shrink-0 mt-0.5">
					<ArrowLeft className="size-4" />
					<span className="sr-only">Back to tickets</span>
				</Button>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs font-mono font-semibold text-primary/70">{ticket.id}</span>
						<StatusBadge status={ticket.status} />
					</div>
					<button
						onClick={openTitleDialog}
						className="group text-xl font-bold tracking-tight text-balance text-left hover:text-primary transition-colors">
						{ticket.subject}
						<Edit2 className="inline-block size-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
					<p className="text-sm text-muted-foreground mt-1">
						Opened by {ticket.requester} on {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
					</p>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon" className="size-9 rounded-lg">
								<MoreHorizontal className="size-4" />
								<span className="sr-only">More actions</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setMergeDialogOpen(true)}>Merge Ticket</DropdownMenuItem>
							<DropdownMenuItem>Print Ticket</DropdownMenuItem>
							<DropdownMenuItem>Export as PDF</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialogOpen(true)}>
								<Trash2 className="size-3.5 mr-2" />
								Delete Ticket
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Conversation */}
				<div className="lg:col-span-2 flex flex-col gap-4">
					{/* Conversation Messages */}
					<Card className="border-0 shadow-sm">
						<CardHeader className="pb-3">
							<div className="flex items-center gap-2">
								<MessageSquare className="size-4 text-primary" />
								<CardTitle className="text-sm font-semibold">Conversation</CardTitle>
								<Badge variant="secondary" className="text-[10px] rounded-full px-2 ml-auto">
									{messages.length} message{messages.length !== 1 ? "s" : ""}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							{messages.length > 0 ? (
								<div className="space-y-4">
									{messages.map((msg) => (
										<div key={msg.id} className={`flex gap-3 ${msg.isInternal ? "opacity-80" : ""}`}>
											<Avatar className="size-8 rounded-lg shrink-0 mt-0.5">
												<AvatarFallback
													className={`rounded-lg text-[10px] font-bold ${
														msg.authorRole === "agent"
															? "bg-primary text-primary-foreground"
															: msg.authorRole === "customer"
																? "bg-secondary text-secondary-foreground"
																: "bg-muted text-muted-foreground"
													}`}>
													{msg.authorInitials}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<div
													className={`rounded-xl p-3.5 ${
														msg.isInternal
															? "bg-warning/10 border border-warning/20 border-dashed"
															: msg.authorRole === "agent"
																? "bg-primary/5 border border-primary/10"
																: "bg-secondary/60 border border-border"
													}`}>
													<div className="flex items-center gap-2 mb-1.5">
														<span className="text-xs font-semibold">{msg.author}</span>
														{msg.isInternal && (
															<Badge
																variant="outline"
																className="text-[9px] px-1.5 py-0 rounded-full border-warning text-warning">
																<Eye className="size-2.5 mr-0.5" />
																Internal
															</Badge>
														)}
														<span className="text-[10px] text-muted-foreground ml-auto">
															{format(new Date(msg.timestamp), "MMM d, h:mm a")}
														</span>
													</div>
													<p className="text-sm leading-relaxed text-foreground/90">{msg.content}</p>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
									<MessageSquare className="size-8 mb-2 opacity-30" />
									<p className="text-sm">No messages yet</p>
									<p className="text-xs">Start the conversation below</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Reply Box */}
					<Card className="border-0 shadow-sm">
						<CardContent className="pt-5">
							<div className="flex items-center gap-2 mb-3">
								<Button
									variant={!isInternal ? "default" : "outline"}
									size="sm"
									className="h-7 text-[11px] rounded-full"
									onClick={() => setIsInternal(false)}>
									Reply
								</Button>
								<Button
									variant={isInternal ? "default" : "outline"}
									size="sm"
									className={`h-7 text-[11px] rounded-full ${isInternal ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}`}
									onClick={() => setIsInternal(true)}>
									<Eye className="size-3 mr-1" />
									Internal Note
								</Button>
							</div>
							<TiptapEditor
								content={reply}
								onChange={setReply}
								placeholder={isInternal ? "Write an internal note..." : "Type your reply..."}
								className={isInternal ? "border-warning/30 bg-warning/5" : ""}
								minHeight="min-h-[96px]"
							/>
							<div className="flex items-center justify-between mt-3">
								<Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground rounded-lg">
									<Paperclip className="size-3.5" />
									Attach
								</Button>
								<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold">
									<Send className="size-3.5" />
									{isInternal ? "Add Note" : "Send Reply"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar Details */}
				<div className="flex flex-col gap-4">
					{/* Ticket Properties */}
					<Card className="border-0 shadow-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold">Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Tag className="size-3.5" />
										Status
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={openStatusDialog}
										className="h-7 text-[11px] px-2 gap-1.5 hover:bg-secondary rounded-lg font-medium">
										<StatusIcon status={ticket.status} />
										<span className="capitalize">{ticket.status.replace("-", " ")}</span>
										<Edit2 className="size-3 opacity-50" />
									</Button>
								</div>

								<Separator />

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<AlertCircle className="size-3.5" />
										Priority
									</div>
									<Button variant="ghost" size="sm" className="h-7 gap-1.5 -mr-2 hover:bg-secondary" onClick={openPriorityDialog}>
										<PriorityIndicator priority={ticket.priority} />
										<Edit2 className="size-3 text-muted-foreground" />
									</Button>
								</div>

								<Separator />

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<User className="size-3.5" />
										Assignee
									</div>
									<Button variant="ghost" size="sm" className="h-7 gap-2 -mr-2 hover:bg-secondary" onClick={openAssigneeDialog}>
										<div className="flex items-center gap-2">
											<Avatar className="size-5 rounded-md">
												<AvatarFallback className="rounded-md bg-primary text-primary-foreground text-[8px] font-bold">
													{ticket.assignee
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<span className="text-xs font-medium">{ticket.assignee}</span>
										</div>
										<Edit2 className="size-3 text-muted-foreground" />
									</Button>
								</div>

								<Separator />

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Users className="size-3.5" />
										Team
									</div>
									<Button variant="ghost" size="sm" className="h-7 gap-1.5 -mr-2 hover:bg-secondary" onClick={openTeamsDialog}>
										<Badge variant="secondary" className="text-[10px] rounded-full px-2">
											{ticket.team}
										</Badge>
										<Edit2 className="size-3 text-muted-foreground" />
									</Button>
								</div>

								<Separator />

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Mail className="size-3.5" />
										Channel
									</div>
									<span className="text-xs font-medium">{ticket.channel}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Requester Info */}
					<Card className="border-0 shadow-sm">
						<CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
							<CardTitle className="text-sm font-semibold">Requester</CardTitle>
							<Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={openRequesterDialog}>
								<Edit2 className="size-3.5 text-muted-foreground" />
								<span className="sr-only">Change requester</span>
							</Button>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-3 mb-3">
								<Avatar className="size-10 rounded-xl">
									<AvatarFallback className="rounded-xl bg-secondary text-secondary-foreground text-sm font-bold">
										{currentRequester?.name
											.split(" ")
											.map((n) => n[0])
											.join("") ||
											ticket.requester
												.split("@")[0]
												.split(".")
												.map((n) => n[0].toUpperCase())
												.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="text-sm font-medium truncate">
										{currentRequester?.name ||
											ticket.requester
												.split("@")[0]
												.split(".")
												.map((n) => n.charAt(0).toUpperCase() + n.slice(1))
												.join(" ")}
									</p>
									<p className="text-[11px] text-muted-foreground truncate">{ticket.requester}</p>
								</div>
							</div>
							<div className="rounded-lg bg-secondary/50 p-3 space-y-2">
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Organization</span>
									<span className="font-medium">{currentRequester?.companyName || ticket.requester.split("@")[1]?.split(".")[0]}</span>
								</div>
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Total Tickets</span>
									<span className="font-medium">12</span>
								</div>
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Last Contact</span>
									<span className="font-medium">Today</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Timeline */}
					<Card className="border-0 shadow-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold">Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="relative space-y-4 pl-5">
								<div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
								{[
									{ label: "Ticket created", time: ticket.createdAt, icon: "create" },
									{ label: `Assigned to ${ticket.assignee}`, time: ticket.createdAt, icon: "assign" },
									{ label: "Last updated", time: ticket.updatedAt, icon: "update" },
								].map((event, i) => (
									<div key={i} className="relative flex items-start gap-3">
										<div className="absolute -left-5 top-1 size-3.5 rounded-full bg-card border-2 border-primary/30" />
										<div className="min-w-0">
											<p className="text-xs font-medium">{event.label}</p>
											<p className="text-[10px] text-muted-foreground">
												<Calendar className="inline size-2.5 mr-0.5" />
												{format(new Date(event.time), "MMM d, h:mm a")}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Change Requester Dialog */}
			<Dialog open={requesterDialogOpen} onOpenChange={setRequesterDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Change Requester</DialogTitle>
						<DialogDescription className="text-xs">Select a user from your Users & Companies to assign as the ticket requester</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search by name or email..."
								value={requesterSearch}
								onChange={(e) => setRequesterSearch(e.target.value)}
								className="pl-9 h-9 rounded-lg"
							/>
						</div>
						<div className="max-h-[300px] overflow-y-auto rounded-lg border">
							{filteredCustomers.length > 0 ? (
								<div className="p-1">
									{filteredCustomers.map((customer) => (
										<button
											key={customer.id}
											onClick={() => setSelectedRequester(customer)}
											className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors ${
												selectedRequester?.id === customer.id ? "bg-secondary" : ""
											}`}>
											<Avatar className="size-8 rounded-lg">
												<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
													{customer.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0 text-left">
												<p className="text-sm font-medium truncate">{customer.name}</p>
												<p className="text-xs text-muted-foreground truncate">{customer.email}</p>
												{customer.companyName && <p className="text-[10px] text-muted-foreground truncate">{customer.companyName}</p>}
											</div>
											{selectedRequester?.id === customer.id && <CheckCircle2 className="size-4 text-primary shrink-0" />}
										</button>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
									<User className="size-8 mb-2 opacity-30" />
									<p className="text-sm">No users found</p>
								</div>
							)}
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setRequesterDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={handleSaveRequester} disabled={!selectedRequester} className="rounded-lg">
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Change Assignee Dialog */}
			<Dialog open={assigneeDialogOpen} onOpenChange={setAssigneeDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Change Assignee</DialogTitle>
						<DialogDescription className="text-xs">Select an agent to assign this ticket to</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search agents..."
								value={assigneeSearch}
								onChange={(e) => setAssigneeSearch(e.target.value)}
								className="pl-9 h-9 rounded-lg"
							/>
						</div>
						<div className="max-h-[300px] overflow-y-auto rounded-lg border">
							{filteredAgents.length > 0 ? (
								<div className="p-1">
									{filteredAgents.map((agent) => (
										<button
											key={agent.id}
											onClick={() => setSelectedAssignee(agent)}
											className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors ${
												selectedAssignee?.id === agent.id ? "bg-secondary" : ""
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
											{selectedAssignee?.id === agent.id && <CheckCircle2 className="size-4 text-primary shrink-0" />}
										</button>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
									<User className="size-8 mb-2 opacity-30" />
									<p className="text-sm">No agents found</p>
								</div>
							)}
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setAssigneeDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={handleSaveAssignee} disabled={!selectedAssignee} className="rounded-lg">
							Assign Ticket
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Change Priority Dialog */}
			<Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-base">Change Priority</DialogTitle>
						<DialogDescription className="text-xs">Update the priority level for this ticket</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-2">
						{(["low", "medium", "high", "critical"] as TicketPriority[]).map((priority) => (
							<button
								key={priority}
								onClick={() => setSelectedPriority(priority)}
								className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
									selectedPriority === priority
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50 hover:bg-secondary/50"
								}`}>
								<PriorityIndicator priority={priority} />
								{selectedPriority === priority && <CheckCircle2 className="size-4 text-primary" />}
							</button>
						))}
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setPriorityDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={handleSavePriority} className="rounded-lg">
							Save Priority
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Manage Teams Dialog */}
			<Dialog open={teamsDialogOpen} onOpenChange={setTeamsDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Manage Teams</DialogTitle>
						<DialogDescription className="text-xs">Select which teams should handle this ticket</DialogDescription>
					</DialogHeader>
					<div className="grid gap-2 py-2">
						<div className="max-h-[300px] overflow-y-auto rounded-lg border p-2">
							{teamsData.map((team) => {
								const isSelected = selectedTeams.includes(team.name);
								return (
									<div
										key={team.id}
										className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer"
										onClick={() => {
											setSelectedTeams((prev) => (isSelected ? prev.filter((t) => t !== team.name) : [...prev, team.name]));
										}}>
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
						<p className="text-[10px] text-muted-foreground px-1">
							{selectedTeams.length} team{selectedTeams.length !== 1 ? "s" : ""} selected
						</p>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setTeamsDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={handleSaveTeams} disabled={selectedTeams.length === 0} className="rounded-lg">
							Save Teams
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Change Status Dialog */}
			<Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-base">Change Status</DialogTitle>
						<DialogDescription className="text-xs">Update the status for this ticket</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-2">
						{(["open", "in-progress", "resolved", "closed"] as TicketStatus[]).map((status) => (
							<button
								key={status}
								onClick={() => setSelectedStatus(status)}
								className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
									selectedStatus === status ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50"
								}`}>
								<div className="flex items-center gap-2.5">
									<StatusIcon status={status} />
									<span className="text-sm capitalize font-medium">{status.replace("-", " ")}</span>
								</div>
								{selectedStatus === status && <CheckCircle2 className="size-4 text-primary" />}
							</button>
						))}
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={handleSaveStatus} className="rounded-lg">
							Save Status
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Title Dialog */}
			<Dialog open={titleDialogOpen} onOpenChange={setTitleDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="text-base">Edit Ticket Title</DialogTitle>
						<DialogDescription className="text-xs">Update the title/subject for this ticket</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="ticket-title" className="text-xs font-medium">
								Title
							</Label>
							<Input
								id="ticket-title"
								value={editedTitle}
								onChange={(e) => setEditedTitle(e.target.value)}
								placeholder="Enter ticket title..."
								className="h-9 rounded-lg"
							/>
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setTitleDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={handleSaveTitle} disabled={!editedTitle.trim()} className="rounded-lg">
							Save Title
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Merge Ticket Dialog */}
			<Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="text-base">Merge Ticket</DialogTitle>
						<DialogDescription className="text-xs">
							Merge this ticket into another existing ticket. All messages and history will be combined.
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
						<Button onClick={handleMergeTicket} disabled={!mergeTargetId} className="rounded-lg">
							Merge Tickets
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Ticket Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-base">Delete Ticket?</AlertDialogTitle>
						<AlertDialogDescription className="text-xs">
							Are you sure you want to delete ticket <span className="font-mono font-semibold text-foreground">{ticket.id}</span>? This action
							cannot be undone and will permanently remove the ticket and all its messages.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTicket}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">
							<Trash2 className="size-3.5 mr-2" />
							Delete Ticket
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
