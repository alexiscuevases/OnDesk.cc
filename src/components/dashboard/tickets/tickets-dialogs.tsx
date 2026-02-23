import { Search, Trash2, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Agent, Ticket } from "@/lib/data";
import { teams } from "@/lib/data";

interface TicketsDialogsProps {
	selectedCount: number;
	deleteOpen: boolean;
	onDeleteOpenChange: (open: boolean) => void;
	onDeleteConfirm: () => void;
	assignAgentOpen: boolean;
	onAssignAgentOpenChange: (open: boolean) => void;
	onAssignAgentConfirm: () => void;
	selectedAgent: Agent | null;
	onSelectAgent: (agent: Agent) => void;
	agentSearch: string;
	onAgentSearchChange: (value: string) => void;
	filteredAgents: Agent[];
	assignTeamOpen: boolean;
	onAssignTeamOpenChange: (open: boolean) => void;
	onAssignTeamConfirm: () => void;
	selectedTeam: string;
	onSelectTeam: (team: string) => void;
	mergeOpen: boolean;
	onMergeOpenChange: (open: boolean) => void;
	onMergeConfirm: () => void;
	mergeTargetId: string;
	onMergeTargetChange: (id: string) => void;
	mergeSearch: string;
	onMergeSearchChange: (value: string) => void;
	mergeableTickets: Ticket[];
}

export function TicketsDialogs({
	selectedCount,
	deleteOpen,
	onDeleteOpenChange,
	onDeleteConfirm,
	assignAgentOpen,
	onAssignAgentOpenChange,
	onAssignAgentConfirm,
	selectedAgent,
	onSelectAgent,
	agentSearch,
	onAgentSearchChange,
	filteredAgents,
	assignTeamOpen,
	onAssignTeamOpenChange,
	onAssignTeamConfirm,
	selectedTeam,
	onSelectTeam,
	mergeOpen,
	onMergeOpenChange,
	onMergeConfirm,
	mergeTargetId,
	onMergeTargetChange,
	mergeSearch,
	onMergeSearchChange,
	mergeableTickets,
}: TicketsDialogsProps) {
	const plural = selectedCount > 1;

	return (
		<>
			<AlertDialog open={deleteOpen} onOpenChange={onDeleteOpenChange}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-base">Delete Ticket{plural ? "s" : ""}?</AlertDialogTitle>
						<AlertDialogDescription className="text-xs">
							Are you sure you want to delete {selectedCount} ticket{plural ? "s" : ""}? This action cannot be undone
							and will permanently remove the ticket{plural ? "s" : ""} and all {plural ? "their" : "its"} messages.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={onDeleteConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">
							<Trash2 className="size-3.5 mr-2" />
							Delete Ticket{plural ? "s" : ""}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog open={assignAgentOpen} onOpenChange={onAssignAgentOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Assign Agent</DialogTitle>
						<DialogDescription className="text-xs">
							Select an agent to assign {selectedCount} ticket{plural ? "s" : ""} to
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search agents..."
								value={agentSearch}
								onChange={(e) => onAgentSearchChange(e.target.value)}
								className="pl-9 h-9 rounded-lg"
							/>
						</div>
						<div className="max-h-[300px] overflow-y-auto rounded-lg border">
							{filteredAgents.length > 0 ? (
								<div className="p-1">
									{filteredAgents.map((agent) => (
										<button
											key={agent.id}
											onClick={() => onSelectAgent(agent)}
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
											{selectedAgent?.id === agent.id && (
												<CheckCircle2 className="size-4 text-primary shrink-0" />
											)}
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
						<Button variant="outline" onClick={() => onAssignAgentOpenChange(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={onAssignAgentConfirm} disabled={!selectedAgent} className="rounded-lg">
							Assign Ticket{plural ? "s" : ""}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={assignTeamOpen} onOpenChange={onAssignTeamOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Assign Team</DialogTitle>
						<DialogDescription className="text-xs">
							Select which team should handle {selectedCount} ticket{plural ? "s" : ""}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-2 py-2">
						<div className="max-h-[300px] overflow-y-auto rounded-lg border p-2">
							{teams.map((team) => (
								<div
									key={team.id}
									className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer"
									onClick={() => onSelectTeam(team.name)}>
									<Checkbox checked={selectedTeam === team.name} className="size-4" />
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
							))}
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => onAssignTeamOpenChange(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={onAssignTeamConfirm} disabled={!selectedTeam} className="rounded-lg">
							Assign Team
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={mergeOpen} onOpenChange={onMergeOpenChange}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="text-base">Merge Tickets</DialogTitle>
						<DialogDescription className="text-xs">
							Merge {selectedCount} ticket{plural ? "s" : ""} into another existing ticket. All messages and history
							will be combined.
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
													<StatusBadge status={targetTicket.status} />
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
		</>
	);
}
