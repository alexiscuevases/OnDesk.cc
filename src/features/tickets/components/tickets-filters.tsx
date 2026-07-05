import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import type { Contact } from "@/features/contacts/api/contacts-api";

interface TicketsFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
	priorityFilter: string;
	onPriorityFilterChange: (value: string) => void;
	assigneeFilter: string;
	onAssigneeFilterChange: (value: string) => void;
	requesterFilter: string;
	onRequesterFilterChange: (value: string) => void;
	members: WorkspaceMember[];
	contacts: Contact[];
}

export function TicketsFilters({
	search,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	priorityFilter,
	onPriorityFilterChange,
	assigneeFilter,
	onAssigneeFilterChange,
	requesterFilter,
	onRequesterFilterChange,
	members,
	contacts,
}: TicketsFiltersProps) {
	const [open, setOpen] = useState(false);

	const activeCount = useMemo(() => {
		let n = 0;
		if (statusFilter !== "all") n++;
		if (priorityFilter !== "all") n++;
		if (assigneeFilter !== "all") n++;
		if (requesterFilter !== "all") n++;
		return n;
	}, [statusFilter, priorityFilter, assigneeFilter, requesterFilter]);

	function clearAll() {
		onStatusFilterChange("all");
		onPriorityFilterChange("all");
		onAssigneeFilterChange("all");
		onRequesterFilterChange("all");
	}

	return (
		<>
			<div className="flex items-center gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by ID, subject, or requester..."
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-9 h-9 bg-card border-border"
					/>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setOpen(true)}
					className="h-9 gap-2 shrink-0">
					<SlidersHorizontal className="size-4" />
					Filters
					{activeCount > 0 && (
						<Badge
							variant="secondary"
							className="h-5 min-w-5 px-1.5 font-mono text-[10px] font-semibold bg-primary/15 text-primary">
							{activeCount}
						</Badge>
					)}
				</Button>
				{activeCount > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearAll}
						className="h-9 gap-1.5 shrink-0 text-muted-foreground hover:text-foreground">
						<X className="size-3.5" />
						Clear
					</Button>
				)}
			</div>

			{activeCount > 0 && (
				<div className="flex flex-wrap items-center gap-1.5">
					<ActiveFilterChip
						label="Status"
						value={statusFilter}
						labelMap={{
							open: "Open",
							pending: "Pending",
							resolved: "Resolved",
							closed: "Closed",
						}}
						onClear={() => onStatusFilterChange("all")}
					/>
					<ActiveFilterChip
						label="Priority"
						value={priorityFilter}
						labelMap={{
							urgent: "Urgent",
							high: "High",
							medium: "Medium",
							low: "Low",
						}}
						onClear={() => onPriorityFilterChange("all")}
					/>
					<ActiveFilterChip
						label="Agent"
						value={assigneeFilter}
						labelMap={Object.fromEntries(members.map((m) => [m.id, m.name]))}
						onClear={() => onAssigneeFilterChange("all")}
					/>
					<ActiveFilterChip
						label="User"
						value={requesterFilter}
						labelMap={Object.fromEntries(contacts.map((c) => [c.id, c.name]))}
						onClear={() => onRequesterFilterChange("all")}
					/>
				</div>
			)}

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Filters</DialogTitle>
						<DialogDescription>
							Narrow down the ticket list by status, priority, agent, or requester.
						</DialogDescription>
					</DialogHeader>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
						<div className="flex flex-col gap-1.5">
							<Label className="text-xs text-muted-foreground">Status</Label>
							<Select value={statusFilter} onValueChange={onStatusFilterChange}>
								<SelectTrigger className="h-9 text-sm">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All statuses</SelectItem>
									<SelectItem value="open">Open</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="resolved">Resolved</SelectItem>
									<SelectItem value="closed">Closed</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label className="text-xs text-muted-foreground">Priority</Label>
							<Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
								<SelectTrigger className="h-9 text-sm">
									<SelectValue placeholder="Priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All priorities</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label className="text-xs text-muted-foreground">Assigned agent</Label>
							<Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
								<SelectTrigger className="h-9 text-sm">
									<SelectValue placeholder="Agent" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All agents</SelectItem>
									{members.map((member) => (
										<SelectItem key={member.id} value={member.id}>
											{member.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label className="text-xs text-muted-foreground">Requester</Label>
							<Select value={requesterFilter} onValueChange={onRequesterFilterChange}>
								<SelectTrigger className="h-9 text-sm">
									<SelectValue placeholder="User" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All requesters</SelectItem>
									{contacts.map((contact) => (
										<SelectItem key={contact.id} value={contact.id}>
											{contact.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter className="sm:justify-between gap-2">
						<Button variant="ghost" onClick={clearAll} disabled={activeCount === 0}>
							Clear all
						</Button>
						<Button onClick={() => setOpen(false)}>Done</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function ActiveFilterChip({
	label,
	value,
	labelMap,
	onClear,
}: {
	label: string;
	value: string;
	labelMap: Record<string, string>;
	onClear: () => void;
}) {
	if (value === "all") return null;
	const display = labelMap[value] ?? value;
	return (
		<Badge
			variant="secondary"
			className="h-6 px-2 gap-1 font-mono text-[10px] uppercase bg-secondary hover:bg-secondary/80">
			<span className="text-muted-foreground">{label}:</span>
			<span className="text-foreground">{display}</span>
			<button
				type="button"
				onClick={onClear}
				className="ml-0.5 text-muted-foreground/60 hover:text-destructive transition-colors">
				<X className="size-3" />
				<span className="sr-only">Clear {label}</span>
			</button>
		</Badge>
	);
}
