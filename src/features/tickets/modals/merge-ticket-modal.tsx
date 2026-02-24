import { useState } from "react";
import { Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/shared/components/status-badge";
import type { Ticket } from "@/features/tickets/api/tickets-api";

interface MergeTicketModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedCount: number;
	mergeableTickets: Ticket[];
	onConfirm: (targetTicketId: string) => void;
}

export function MergeTicketModal({ open, onOpenChange, selectedCount, mergeableTickets, onConfirm }: MergeTicketModalProps) {
	const [search, setSearch] = useState("");
	const [targetId, setTargetId] = useState("");
	const plural = selectedCount > 1;

	const filtered = mergeableTickets.filter(
		(t) =>
			t.id.toLowerCase().includes(search.toLowerCase()) ||
			t.subject.toLowerCase().includes(search.toLowerCase()),
	);

	function handleConfirm() {
		if (targetId) {
			onConfirm(targetId);
			setTargetId("");
			setSearch("");
		}
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			setTargetId("");
			setSearch("");
		}
		onOpenChange(open);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-base">Merge Tickets</DialogTitle>
					<DialogDescription className="text-xs">
						Merge {selectedCount} ticket{plural ? "s" : ""} into another existing ticket. All messages and history
						will be combined.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							placeholder="Search by ticket ID or subject..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9 h-9 rounded-lg"
						/>
					</div>
					<div className="max-h-[300px] overflow-y-auto rounded-lg border">
						{filtered.length > 0 ? (
							<div className="p-1">
								{filtered.map((ticket) => (
									<button
										key={ticket.id}
										onClick={() => setTargetId(ticket.id)}
										className={`w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors text-left ${
											targetId === ticket.id ? "bg-secondary" : ""
										}`}>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-xs font-mono font-semibold text-primary/70">{ticket.id}</span>
												<StatusBadge status={ticket.status} />
											</div>
											<p className="text-sm font-medium truncate">{ticket.subject}</p>
											<p className="text-xs text-muted-foreground truncate">
												{new Date(ticket.created_at * 1000).toLocaleDateString()}
											</p>
										</div>
										{targetId === ticket.id && (
											<CheckCircle2 className="size-4 text-primary shrink-0 mt-1" />
										)}
									</button>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
								<AlertCircle className="size-8 mb-2 opacity-30" />
								<p className="text-sm">No tickets found</p>
							</div>
						)}
					</div>
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-lg">
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={!targetId} className="rounded-lg">
						Merge Tickets
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
