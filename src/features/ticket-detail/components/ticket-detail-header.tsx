import { ArrowLeft, Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/shared/components/status-badge";
import type { Ticket } from "@/features/tickets/api/tickets-api";

interface TicketDetailHeaderProps {
	ticket: Ticket;
	onBack: () => void;
	onEditTitle: () => void;
	onDelete: () => void;
}

export function TicketDetailHeader({ ticket, onBack, onEditTitle, onDelete }: TicketDetailHeaderProps) {
	return (
		<div className="flex items-start gap-4">
			<Button variant="ghost" size="icon" onClick={onBack} className="size-9 rounded-lg shrink-0 mt-0.5">
				<ArrowLeft className="size-4" />
				<span className="sr-only">Back to tickets</span>
			</Button>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<span className="text-xs font-mono font-semibold text-primary/70">{ticket.id.slice(0, 8)}</span>
					<StatusBadge status={ticket.status} showIcon size="md" />
				</div>
				<button
					onClick={onEditTitle}
					className="group text-xl font-bold tracking-tight text-balance text-left hover:text-primary transition-colors">
					{ticket.subject}
					<Edit2 className="inline-block size-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
				</button>
				<p className="text-sm text-muted-foreground mt-1">
					Opened {format(new Date(ticket.created_at * 1000), "MMM d, yyyy 'at' h:mm a")}
				</p>
			</div>
			<div className="shrink-0">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon" className="size-9 rounded-lg">
							<MoreHorizontal className="size-4" />
							<span className="sr-only">More actions</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>Print Ticket</DropdownMenuItem>
						<DropdownMenuItem>Export as PDF</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-destructive" onClick={onDelete}>
							<Trash2 className="size-3.5 mr-2" />
							Delete Ticket
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
