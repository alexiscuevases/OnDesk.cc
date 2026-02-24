import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TicketPriority } from "@/features/tickets/api/tickets-api";

interface ChangePriorityModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentPriority: TicketPriority;
	onSave: (priority: TicketPriority) => void;
}

const priorities: { value: TicketPriority; label: string; color: string }[] = [
	{ value: "urgent", label: "Urgent", color: "bg-destructive/15 text-destructive border-destructive/20" },
	{ value: "high", label: "High", color: "bg-warning/15 text-warning border-warning/20" },
	{ value: "medium", label: "Medium", color: "bg-primary/15 text-primary border-primary/20" },
	{ value: "low", label: "Low", color: "bg-secondary text-secondary-foreground border-border" },
];

export function ChangePriorityModal({ open, onOpenChange, currentPriority, onSave }: ChangePriorityModalProps) {
	const [selected, setSelected] = useState<TicketPriority>(currentPriority);

	function handleOpenChange(open: boolean) {
		if (open) setSelected(currentPriority);
		onOpenChange(open);
	}

	function handleSave() {
		onSave(selected);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-base">Change Priority</DialogTitle>
					<DialogDescription className="text-xs">Select a priority level for this ticket</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2 py-2">
					{priorities.map((p) => (
						<button
							key={p.value}
							onClick={() => setSelected(p.value)}
							className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${p.color} ${
								selected === p.value ? "ring-2 ring-primary" : ""
							}`}>
							<div className="flex-1">
								<p className="text-sm font-medium capitalize">{p.label}</p>
							</div>
							{selected === p.value && (
								<div className="size-2 rounded-full bg-current" />
							)}
						</button>
					))}
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-lg">
						Cancel
					</Button>
					<Button onClick={handleSave} className="rounded-lg">
						Save Priority
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
