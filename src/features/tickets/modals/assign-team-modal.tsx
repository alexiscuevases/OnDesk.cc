import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { teams } from "@/lib/data";

interface AssignTeamModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedCount: number;
	onConfirm: (teamName: string) => void;
}

export function AssignTeamModal({ open, onOpenChange, selectedCount, onConfirm }: AssignTeamModalProps) {
	const [selectedTeam, setSelectedTeam] = useState("");
	const plural = selectedCount > 1;

	function handleConfirm() {
		if (selectedTeam) {
			onConfirm(selectedTeam);
			setSelectedTeam("");
		}
	}

	function handleOpenChange(open: boolean) {
		if (!open) setSelectedTeam("");
		onOpenChange(open);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-base">Assign Team</DialogTitle>
					<DialogDescription className="text-xs">
						Select which team should handle {selectedCount} ticket{plural ? "s" : ""}
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2 py-2">
					<div className="max-h-[300px] overflow-y-auto rounded-lg border p-2">
						{teams.map((team) => (
							<div
								key={team.id}
								className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer"
								onClick={() => setSelectedTeam(team.name)}>
								<Checkbox checked={selectedTeam === team.name} className="size-4" />
								<Avatar className="size-7 rounded-lg">
									<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[9px] font-bold">
										{team.avatar}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{team.name}</p>
									<p className="text-[10px] text-muted-foreground truncate">{team.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-lg">
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={!selectedTeam} className="rounded-lg">
						Assign Team
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
