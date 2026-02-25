import { MoreHorizontal, Eye, Trash2, SortAsc, ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/shared/components/status-badge";
import { PriorityBadge } from "@/shared/components/priority-badge";
import type { Ticket } from "@/features/tickets/api/tickets-api";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import type { Team } from "@/features/teams/api/teams-api";
import type { Contact } from "@/features/contacts/api/contacts-api";
import type { Company } from "@/features/companies/api/companies-api";

interface TicketsTableProps {
	tickets: Ticket[];
	totalCount: number;
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

export function TicketsTable({
	tickets,
	totalCount,
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

	function getMember(id: string | null) {
		if (!id) return null;
		return members.find((m) => m.id === id) ?? null;
	}

	function getTeam(id: string | null) {
		if (!id) return null;
		return teams.find((t) => t.id === id) ?? null;
	}

	function getContact(id: string | null) {
		if (!id) return null;
		return contacts.find((c) => c.id === id) ?? null;
	}

	function getCompanyLogo(companyId: string | null) {
		if (!companyId) return null;
		return companies.find((c) => c.id === companyId)?.logo_url ?? null;
	}

	function getInitials(name: string) {
		return name
			.split(" ")
			.map((w) => w[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
	}

	return (
		<Card className="border-0 shadow-sm overflow-hidden">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-sm font-semibold">All Tickets</CardTitle>
						<CardDescription className="text-xs">
							{isLoading ? "Loading..." : `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""} found`}
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
								<Checkbox checked={selectedTickets.length === tickets.length && tickets.length > 0} onCheckedChange={onSelectAll} />
							</TableHead>
							<TableHead className="w-24 text-[11px] font-semibold uppercase tracking-wider">ID</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Details</TableHead>
							<TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider">Team</TableHead>
							<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider">Assignee</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Priority</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
							<TableHead className="w-12 pr-6" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{tickets.map((ticket) => {
							const assignee = getMember(ticket.assignee_id);
							const team = getTeam(ticket.team_id);
							const contact = getContact(ticket.contact_id);
							const companyLogo = getCompanyLogo(contact?.company_id ?? null);
							return (
								<TableRow key={ticket.id} className="hover:bg-secondary/40 transition-colors">
									<TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
										<Checkbox
											checked={selectedTickets.includes(ticket.id)}
											onCheckedChange={(checked) => onSelectTicket(ticket.id, checked as boolean)}
										/>
									</TableCell>
									<TableCell
										className="font-mono text-xs font-semibold text-primary/70 cursor-pointer"
										onClick={() => onOpenTicket(ticket.id)}>
										{ticket.id.slice(0, 8)}
									</TableCell>
									<TableCell className="cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
										<div className="flex items-center gap-2.5 max-w-70 lg:max-w-95">
											<Avatar className="size-7 rounded-lg shrink-0">
												<AvatarImage src={companyLogo ?? undefined} className="object-cover rounded-lg" />
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
									</TableCell>
									<TableCell className="hidden lg:table-cell cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
										{team ? (
											<div className="flex items-center gap-2">
												<Avatar className="size-7">
													<AvatarImage src={team.logo_url ?? undefined} className="object-cover" />
													<AvatarFallback className="text-[10px] bg-accent/80 text-accent-foreground font-semibold">
														{getInitials(team.name)}
													</AvatarFallback>
												</Avatar>
												<span className="text-xs">{team.name}</span>
											</div>
										) : (
											<span className="text-xs text-muted-foreground">—</span>
										)}
									</TableCell>
									<TableCell className="hidden sm:table-cell cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
										{assignee ? (
											<div className="flex items-center gap-2">
												<Avatar className="size-7">
													<AvatarImage src={assignee.logo_url ?? workspace.logo_url ?? undefined} className="object-cover" />
													<AvatarFallback className="text-[10px] bg-accent/80 text-accent-foreground font-semibold">
														{getInitials(assignee.name)}
													</AvatarFallback>
												</Avatar>
												<span className="text-xs">{assignee.name}</span>
											</div>
										) : (
											<span className="text-xs text-muted-foreground">—</span>
										)}
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
												<DropdownMenuItem className="text-destructive" onClick={() => onDeleteSingle(ticket.id)}>
													<Trash2 className="size-3.5 mr-2" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							);
						})}
						{tickets.length === 0 && (
							<TableRow>
								<TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-sm">
									No tickets found matching your filters.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<div className="flex items-center justify-between px-6 py-4 border-t">
					<p className="text-xs text-muted-foreground">
						Showing {tickets.length} of {totalCount} tickets
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
	);
}
