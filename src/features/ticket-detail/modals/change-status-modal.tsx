import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/shared/components/status-badge";
import type { TicketStatus } from "@/lib/data";

interface ChangeStatusModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentStatus: TicketStatus;
	onSave: (status: TicketStatus) => void;
}

export function ChangeStatusModal({ open, onOpenChange, currentStatus, onSave }: ChangeStatusModalProps) {
	const [selected, setSelected] = useState<TicketStatus>(currentStatus);

	function handleOpenChange(open: boolean) {
		if (open) setSelected(currentStatus);
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
					<DialogTitle className="text-base">Change Status</DialogTitle>
					<DialogDescription className="text-xs">Update the status for this ticket</DialogDescription>
				</DialogHeader>
				<div className="grid gap-3 py-2">
					{(["open", "in-progress", "resolved", "closed"] as TicketStatus[]).map((status) => (
						<button
							key={status}
							onClick={() => setSelected(status)}
							className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
								selected === status
									? "border-primary bg-primary/5"
									: "border-border hover:border-primary/50 hover:bg-secondary/50"
							}`}>
							<StatusBadge status={status} showIcon size="md" />
							{selected === status && <CheckCircle2 className="size-4 text-primary" />}
						</button>
					))}
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">
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
