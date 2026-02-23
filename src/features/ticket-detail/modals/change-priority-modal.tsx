import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/shared/components/priority-badge";
import type { TicketPriority } from "@/lib/data";

interface ChangePriorityModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentPriority: TicketPriority;
	onSave: (priority: TicketPriority) => void;
}

export function ChangePriorityModal({ open, onOpenChange, currentPriority, onSave }: ChangePriorityModalProps) {
	const [selected, setSelected] = useState<TicketPriority>(currentPriority);

	function handleOpenChange(open: boolean) {
		if (open) setSelected(currentPriority);
		onOpenChange(open);
	}

	function handleSave() {
		onSave(selected);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-base">Change Priority</DialogTitle>
					<DialogDescription className="text-xs">Update the priority level for this ticket</DialogDescription>
				</DialogHeader>
				<div className="grid gap-3 py-2">
					{(["low", "medium", "high", "critical"] as TicketPriority[]).map((priority) => (
						<button
							key={priority}
							onClick={() => setSelected(priority)}
							className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
								selected === priority
									? "border-primary bg-primary/5"
									: "border-border hover:border-primary/50 hover:bg-secondary/50"
							}`}>
							<PriorityBadge priority={priority} variant="indicator" />
							{selected === priority && <CheckCircle2 className="size-4 text-primary" />}
						</button>
					))}
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">
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
