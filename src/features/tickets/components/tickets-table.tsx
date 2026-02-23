import { MoreHorizontal, Eye, Trash2, SortAsc, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/shared/components/status-badge";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { getInitials } from "@/lib/format";
import type { Ticket } from "@/lib/data";

interface TicketsTableProps {
	tickets: Ticket[];
	totalCount: number;
	selectedTickets: string[];
	onSelectAll: (checked: boolean) => void;
	onSelectTicket: (id: string, checked: boolean) => void;
	onOpenTicket: (id: string) => void;
	onDeleteSingle: (id: string) => void;
}

export function TicketsTable({
	tickets,
	totalCount,
	selectedTickets,
	onSelectAll,
	onSelectTicket,
	onOpenTicket,
	onDeleteSingle,
}: TicketsTableProps) {
	return (
		<Card className="border-0 shadow-sm overflow-hidden">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-sm font-semibold">All Tickets</CardTitle>
						<CardDescription className="text-xs">
							{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} found
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
								<Checkbox
									checked={selectedTickets.length === tickets.length && tickets.length > 0}
									onCheckedChange={onSelectAll}
								/>
							</TableHead>
							<TableHead className="w-24 text-[11px] font-semibold uppercase tracking-wider">ID</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Subject</TableHead>
							<TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider">
								Requester
							</TableHead>
							<TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider">
								Team
							</TableHead>
							<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider">
								Assignee
							</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Priority</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
							<TableHead className="w-12 pr-6" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{tickets.map((ticket) => (
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
									{ticket.id}
								</TableCell>
								<TableCell className="cursor-pointer" onClick={() => onOpenTicket(ticket.id)}>
									<div className="max-w-[200px] lg:max-w-[300px]">
										<p className="text-sm font-medium truncate">{ticket.subject}</p>
									</div>
								</TableCell>
								<TableCell
									className="hidden md:table-cell cursor-pointer"
									onClick={() => onOpenTicket(ticket.id)}>
									<div className="flex items-center gap-2">
										<Avatar className="size-7">
											<AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
												{getInitials(ticket.requester)}
											</AvatarFallback>
										</Avatar>
										<span className="text-xs text-muted-foreground">{ticket.requester}</span>
									</div>
								</TableCell>
								<TableCell
									className="hidden lg:table-cell cursor-pointer"
									onClick={() => onOpenTicket(ticket.id)}>
									<Badge variant="secondary" className="text-[10px] rounded-full px-2 font-medium">
										{ticket.team}
									</Badge>
								</TableCell>
								<TableCell
									className="hidden sm:table-cell cursor-pointer"
									onClick={() => onOpenTicket(ticket.id)}>
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
												onClick={() => onDeleteSingle(ticket.id)}>
												<Trash2 className="size-3.5 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
						{tickets.length === 0 && (
							<TableRow>
								<TableCell colSpan={9} className="h-24 text-center text-muted-foreground text-sm">
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
