import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/shared/components/status-badge";
import type { TicketStatus } from "@/features/tickets/api/tickets-api";

interface ChangeStatusModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentStatus: TicketStatus;
	onSave: (status: TicketStatus) => void;
}

const statuses: TicketStatus[] = ["open", "pending", "resolved", "closed"];

export function ChangeStatusModal({ open, onOpenChange, currentStatus, onSave }: ChangeStatusModalProps) {
	const [selected, setSelected] = useState<TicketStatus>(currentStatus);

	function handleOpenChange(open: boolean) {
		if (open) setSelected(currentStatus);
		onOpenChange(open);
	}

	function handleSave() {
		onSave(selected);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-base">Change Status</DialogTitle>
					<DialogDescription className="text-xs">Select a new status for this ticket</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2 py-2">
					{statuses.map((s) => (
						<button
							key={s}
							onClick={() => setSelected(s)}
							className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left hover:bg-secondary/50 ${
								selected === s ? "ring-2 ring-primary bg-secondary/50" : ""
							}`}>
							<StatusBadge status={s} showIcon size="md" />
							{selected === s && (
								<div className="ml-auto size-2 rounded-full bg-primary" />
							)}
						</button>
					))}
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-lg">
						Cancel
					</Button>
					<Button onClick={handleSave} className="rounded-lg">
						Save Status
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
