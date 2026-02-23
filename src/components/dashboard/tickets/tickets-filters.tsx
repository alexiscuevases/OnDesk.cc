import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TicketsFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
	priorityFilter: string;
	onPriorityFilterChange: (value: string) => void;
}

export function TicketsFilters({
	search,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	priorityFilter,
	onPriorityFilterChange,
}: TicketsFiltersProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search by ID, subject, or requester..."
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-9 h-9 bg-card border-border rounded-lg"
				/>
			</div>
			<div className="flex items-center gap-2">
				<Filter className="size-4 text-muted-foreground shrink-0" />
				<Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
				<Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
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
	);
}
