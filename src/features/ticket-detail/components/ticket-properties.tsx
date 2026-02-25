import { Tag, AlertCircle, User, Users, Mail, Calendar, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { StatusBadge } from "@/shared/components/status-badge";
import type { Ticket } from "@/features/tickets/api/tickets-api";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import type { Team } from "@/features/teams/api/teams-api";
import type { Contact } from "@/features/contacts/api/contacts-api";
import type { Workspace } from "@/features/workspaces/api/workspaces-api";
import type { Company } from "@/features/companies/api/companies-api";

interface TicketPropertiesProps {
	ticket: Ticket;
	assignee: WorkspaceMember | null;
	team: Team | null;
	contact: Contact | null;
	workspace: Workspace;
	companies: Company[];
	onEditStatus: () => void;
	onEditPriority: () => void;
	onEditAssignee: () => void;
	onEditTeam: () => void;
	onEditRequester: () => void;
}

export function TicketProperties({
	ticket,
	assignee,
	team,
	contact,
	workspace,
	companies,
	onEditStatus,
	onEditPriority,
	onEditAssignee,
	onEditTeam,
	onEditRequester,
}: TicketPropertiesProps) {
	function getInitials(name: string) {
		return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
	}

	return (
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
								onClick={onEditStatus}
								className="h-7 text-[11px] px-2 gap-1.5 hover:bg-secondary rounded-lg font-medium">
								<StatusBadge status={ticket.status} showIcon size="md" />
								<Edit2 className="size-3 opacity-50" />
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<AlertCircle className="size-3.5" />
								Priority
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 gap-1.5 -mr-2 hover:bg-secondary"
								onClick={onEditPriority}>
								<PriorityBadge priority={ticket.priority} variant="indicator" />
								<Edit2 className="size-3 text-muted-foreground" />
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<User className="size-3.5" />
								Assignee
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 gap-2 -mr-2 hover:bg-secondary"
								onClick={onEditAssignee}>
								<div className="flex items-center gap-2">
									<Avatar className="size-5 rounded-md">
										<AvatarImage src={assignee?.logo_url ?? workspace.logo_url ?? undefined} className="object-cover rounded-md" />
										<AvatarFallback className="rounded-md bg-primary text-primary-foreground text-[8px] font-bold">
											{assignee ? getInitials(assignee.name) : "?"}
										</AvatarFallback>
									</Avatar>
									<span className="text-xs font-medium">{assignee?.name ?? "Unassigned"}</span>
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
							<Button
								variant="ghost"
								size="sm"
								className="h-7 gap-2 -mr-2 hover:bg-secondary"
								onClick={onEditTeam}>
								<div className="flex items-center gap-2">
									<Avatar className="size-5 rounded-md">
										<AvatarImage src={team?.logo_url ?? undefined} className="object-cover rounded-md" />
										<AvatarFallback className="rounded-md bg-primary text-primary-foreground text-[8px] font-bold">
											{team ? getInitials(team.name) : "?"}
										</AvatarFallback>
									</Avatar>
									<span className="text-xs font-medium">{team?.name ?? "No team"}</span>
								</div>
								<Edit2 className="size-3 text-muted-foreground" />
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Mail className="size-3.5" />
								Created
							</div>
							<span className="text-xs font-medium">
								{format(new Date(ticket.created_at * 1000), "MMM d, yyyy")}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Requester Info */}
			<Card className="border-0 shadow-sm">
				<CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
					<CardTitle className="text-sm font-semibold">Requester</CardTitle>
					<Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEditRequester}>
						<Edit2 className="size-3.5 text-muted-foreground" />
						<span className="sr-only">Change requester</span>
					</Button>
				</CardHeader>
				<CardContent>
					{contact ? (
						<>
							<div className="flex items-center gap-3 mb-3">
								<Avatar className="size-10 rounded-xl">
									<AvatarImage src={contact.logo_url ?? companies.find((c) => c.id === contact.company_id)?.logo_url ?? undefined} className="object-cover rounded-xl" />
									<AvatarFallback className="rounded-xl bg-secondary text-secondary-foreground text-sm font-bold">
										{getInitials(contact.name)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="text-sm font-medium truncate">{contact.name}</p>
									<p className="text-[11px] text-muted-foreground truncate">{contact.email}</p>
								</div>
							</div>
							{contact.phone && (
								<div className="rounded-lg bg-secondary/50 p-3 space-y-2">
									<div className="flex items-center justify-between text-xs">
										<span className="text-muted-foreground">Phone</span>
										<span className="font-medium">{contact.phone}</span>
									</div>
								</div>
							)}
						</>
					) : (
						<div className="flex items-center gap-3">
							<Avatar className="size-10 rounded-xl">
								<AvatarFallback className="rounded-xl bg-secondary text-secondary-foreground text-sm font-bold">
									?
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="text-sm text-muted-foreground">No requester</p>
								<button
									onClick={onEditRequester}
									className="text-[11px] text-primary hover:underline">
									Assign requester
								</button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Activity Timeline */}
			<Card className="border-0 shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="relative space-y-4 pl-5">
						<div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
						{[
							{ label: "Ticket created", time: ticket.created_at },
							{ label: "Last updated", time: ticket.updated_at },
						].map((event, i) => (
							<div key={i} className="relative flex items-start gap-3">
								<div className="absolute -left-5 top-1 size-3.5 rounded-full bg-card border-2 border-primary/30" />
								<div className="min-w-0">
									<p className="text-xs font-medium">{event.label}</p>
									<p className="text-[10px] text-muted-foreground">
										<Calendar className="inline size-2.5 mr-0.5" />
										{format(new Date(event.time * 1000), "MMM d, h:mm a")}
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
