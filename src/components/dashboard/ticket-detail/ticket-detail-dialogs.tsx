import { Search, Trash2, User, CheckCircle2, AlertCircle } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import type { Agent, Customer, Ticket, TicketStatus, TicketPriority } from "@/lib/data";
import { teams as teamsData } from "@/lib/data";
import { getInitials } from "@/lib/format";

interface TicketDetailDialogsProps {
	ticketId: string;
	// Requester
	requesterOpen: boolean;
	onRequesterOpenChange: (open: boolean) => void;
	onRequesterSave: () => void;
	selectedRequester: Customer | null;
	onSelectRequester: (c: Customer) => void;
	requesterSearch: string;
	onRequesterSearchChange: (v: string) => void;
	filteredCustomers: Customer[];
	// Assignee
	assigneeOpen: boolean;
	onAssigneeOpenChange: (open: boolean) => void;
	onAssigneeSave: () => void;
	selectedAssignee: Agent | null;
	onSelectAssignee: (a: Agent) => void;
	assigneeSearch: string;
	onAssigneeSearchChange: (v: string) => void;
	filteredAgents: Agent[];
	// Priority
	priorityOpen: boolean;
	onPriorityOpenChange: (open: boolean) => void;
	onPrioritySave: () => void;
	selectedPriority: TicketPriority;
	onSelectPriority: (p: TicketPriority) => void;
	// Status
	statusOpen: boolean;
	onStatusOpenChange: (open: boolean) => void;
	onStatusSave: () => void;
	selectedStatus: TicketStatus;
	onSelectStatus: (s: TicketStatus) => void;
	// Teams
	teamsOpen: boolean;
	onTeamsOpenChange: (open: boolean) => void;
	onTeamsSave: () => void;
	selectedTeams: string[];
	onToggleTeam: (teamName: string) => void;
	// Title
	titleOpen: boolean;
	onTitleOpenChange: (open: boolean) => void;
	onTitleSave: () => void;
	editedTitle: string;
	onEditedTitleChange: (v: string) => void;
	// Merge
	mergeOpen: boolean;
	onMergeOpenChange: (open: boolean) => void;
	onMergeConfirm: () => void;
	mergeTargetId: string;
	onMergeTargetChange: (id: string) => void;
	mergeSearch: string;
	onMergeSearchChange: (v: string) => void;
	mergeableTickets: Ticket[];
	// Delete
	deleteOpen: boolean;
	onDeleteOpenChange: (open: boolean) => void;
	onDeleteConfirm: () => void;
}

export function TicketDetailDialogs({
	ticketId,
	requesterOpen, onRequesterOpenChange, onRequesterSave,
	selectedRequester, onSelectRequester, requesterSearch, onRequesterSearchChange, filteredCustomers,
	assigneeOpen, onAssigneeOpenChange, onAssigneeSave,
	selectedAssignee, onSelectAssignee, assigneeSearch, onAssigneeSearchChange, filteredAgents,
	priorityOpen, onPriorityOpenChange, onPrioritySave, selectedPriority, onSelectPriority,
	statusOpen, onStatusOpenChange, onStatusSave, selectedStatus, onSelectStatus,
	teamsOpen, onTeamsOpenChange, onTeamsSave, selectedTeams, onToggleTeam,
	titleOpen, onTitleOpenChange, onTitleSave, editedTitle, onEditedTitleChange,
	mergeOpen, onMergeOpenChange, onMergeConfirm, mergeTargetId, onMergeTargetChange,
	mergeSearch, onMergeSearchChange, mergeableTickets,
	deleteOpen, onDeleteOpenChange, onDeleteConfirm,
}: TicketDetailDialogsProps) {
	return (
		<>
			{/* Change Requester */}
			<Dialog open={requesterOpen} onOpenChange={onRequesterOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Change Requester</DialogTitle>
						<DialogDescription className="text-xs">
							Select a user from your Users & Companies to assign as the ticket requester
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search by name or email..."
								value={requesterSearch}
								onChange={(e) => onRequesterSearchChange(e.target.value)}
								className="pl-9 h-9 rounded-lg"
							/>
						</div>
						<div className="max-h-[300px] overflow-y-auto rounded-lg border">
							{filteredCustomers.length > 0 ? (
								<div className="p-1">
									{filteredCustomers.map((customer) => (
										<button
											key={customer.id}
											onClick={() => onSelectRequester(customer)}
											className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors ${
												selectedRequester?.id === customer.id ? "bg-secondary" : ""
											}`}>
											<Avatar className="size-8 rounded-lg">
												<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
													{getInitials(customer.name)}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0 text-left">
												<p className="text-sm font-medium truncate">{customer.name}</p>
												<p className="text-xs text-muted-foreground truncate">{customer.email}</p>
												{customer.companyName && (
													<p className="text-[10px] text-muted-foreground truncate">{customer.companyName}</p>
												)}
											</div>
											{selectedRequester?.id === customer.id && (
												<CheckCircle2 className="size-4 text-primary shrink-0" />
											)}
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
						<Button variant="outline" onClick={() => onRequesterOpenChange(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={onRequesterSave} disabled={!selectedRequester} className="rounded-lg">
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Change Assignee */}
			<Dialog open={assigneeOpen} onOpenChange={onAssigneeOpenChange}>
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
								onChange={(e) => onAssigneeSearchChange(e.target.value)}
								className="pl-9 h-9 rounded-lg"
							/>
						</div>
						<div className="max-h-[300px] overflow-y-auto rounded-lg border">
							{filteredAgents.length > 0 ? (
								<div className="p-1">
									{filteredAgents.map((agent) => (
										<button
											key={agent.id}
											onClick={() => onSelectAssignee(agent)}
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
											{selectedAssignee?.id === agent.id && (
												<CheckCircle2 className="size-4 text-primary shrink-0" />
											)}
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
						<Button variant="outline" onClick={() => onAssigneeOpenChange(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={onAssigneeSave} disabled={!selectedAssignee} className="rounded-lg">
							Assign Ticket
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Change Priority */}
			<Dialog open={priorityOpen} onOpenChange={onPriorityOpenChange}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-base">Change Priority</DialogTitle>
						<DialogDescription className="text-xs">Update the priority level for this ticket</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-2">
						{(["low", "medium", "high", "critical"] as TicketPriority[]).map((priority) => (
							<button
								key={priority}
								onClick={() => onSelectPriority(priority)}
								className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
									selectedPriority === priority
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50 hover:bg-secondary/50"
								}`}>
								<PriorityBadge priority={priority} variant="indicator" />
								{selectedPriority === priority && <CheckCircle2 className="size-4 text-primary" />}
							</button>
						))}
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => onPriorityOpenChange(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={onPrioritySave} className="rounded-lg">
							Save Priority
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Change Status */}
			<Dialog open={statusOpen} onOpenChange={onStatusOpenChange}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-base">Change Status</DialogTitle>
						<DialogDescription className="text-xs">Update the status for this ticket</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-2">
						{(["open", "in-progress", "resolved", "closed"] as TicketStatus[]).map((status) => (
							<button
								key={status}
								onClick={() => onSelectStatus(status)}
								className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
									selectedStatus === status
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50 hover:bg-secondary/50"
								}`}>
								<StatusBadge status={status} showIcon size="md" />
								{selectedStatus === status && <CheckCircle2 className="size-4 text-primary" />}
							</button>
						))}
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => onStatusOpenChange(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={onStatusSave} className="rounded-lg">
							Save Status
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Manage Teams */}
			<Dialog open={teamsOpen} onOpenChange={onTeamsOpenChange}>
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
										onClick={() => onToggleTeam(team.name)}>
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
						<Button variant="outline" onClick={() => onTeamsOpenChange(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={onTeamsSave} disabled={selectedTeams.length === 0} className="rounded-lg">
							Save Teams
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Title */}
			<Dialog open={titleOpen} onOpenChange={onTitleOpenChange}>
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
								onChange={(e) => onEditedTitleChange(e.target.value)}
								placeholder="Enter ticket title..."
								className="h-9 rounded-lg"
							/>
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => onTitleOpenChange(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={onTitleSave} disabled={!editedTitle.trim()} className="rounded-lg">
							Save Title
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Merge Ticket */}
			<Dialog open={mergeOpen} onOpenChange={onMergeOpenChange}>
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
								onChange={(e) => onMergeSearchChange(e.target.value)}
								className="pl-9 h-9 rounded-lg"
							/>
						</div>
						<div className="max-h-[300px] overflow-y-auto rounded-lg border">
							{mergeableTickets.length > 0 ? (
								<div className="p-1">
									{mergeableTickets.map((targetTicket) => (
										<button
											key={targetTicket.id}
											onClick={() => onMergeTargetChange(targetTicket.id)}
											className={`w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors text-left ${
												mergeTargetId === targetTicket.id ? "bg-secondary" : ""
											}`}>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span className="text-xs font-mono font-semibold text-primary/70">{targetTicket.id}</span>
													<StatusBadge status={targetTicket.status} size="md" />
												</div>
												<p className="text-sm font-medium truncate">{targetTicket.subject}</p>
												<p className="text-xs text-muted-foreground truncate">
													{targetTicket.requester} • {targetTicket.team}
												</p>
											</div>
											{mergeTargetId === targetTicket.id && (
												<CheckCircle2 className="size-4 text-primary shrink-0 mt-1" />
											)}
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
						<Button variant="outline" onClick={() => onMergeOpenChange(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={onMergeConfirm} disabled={!mergeTargetId} className="rounded-lg">
							Merge Tickets
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Ticket */}
			<AlertDialog open={deleteOpen} onOpenChange={onDeleteOpenChange}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-base">Delete Ticket?</AlertDialogTitle>
						<AlertDialogDescription className="text-xs">
							Are you sure you want to delete ticket{" "}
							<span className="font-mono font-semibold text-foreground">{ticketId}</span>? This action cannot be
							undone and will permanently remove the ticket and all its messages.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={onDeleteConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">
							<Trash2 className="size-3.5 mr-2" />
							Delete Ticket
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
