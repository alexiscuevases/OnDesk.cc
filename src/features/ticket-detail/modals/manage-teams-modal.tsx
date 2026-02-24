import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTeams } from "@/features/teams/hooks/use-team-queries";

interface ManageTeamsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentTeamId: string | null;
	workspaceId: string;
	onSave: (teamId: string | null) => void;
}

export function ManageTeamsModal({ open, onOpenChange, currentTeamId, workspaceId, onSave }: ManageTeamsModalProps) {
	const { data: teams = [] } = useTeams(workspaceId);
	const [selectedTeamId, setSelectedTeamId] = useState<string | null>(currentTeamId);

	function getInitials(name: string) {
		return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
	}

	function handleOpenChange(open: boolean) {
		if (open) setSelectedTeamId(currentTeamId);
		onOpenChange(open);
	}

	function handleSave() {
		onSave(selectedTeamId);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-base">Assign Team</DialogTitle>
					<DialogDescription className="text-xs">Select which team should handle this ticket</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2 py-2">
					<div className="max-h-[300px] overflow-y-auto rounded-lg border p-2 space-y-1">
						<div
							className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer ${
								selectedTeamId === null ? "bg-secondary" : ""
							}`}
							onClick={() => setSelectedTeamId(null)}>
							<div className="size-7 rounded-lg bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">—</div>
							<p className="text-sm text-muted-foreground">No team</p>
						</div>
						{teams.map((team) => (
							<div
								key={team.id}
								className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer ${
									selectedTeamId === team.id ? "bg-secondary" : ""
								}`}
								onClick={() => setSelectedTeamId(team.id)}>
								<Avatar className="size-7 rounded-lg">
									<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[9px] font-bold">
										{getInitials(team.name)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{team.name}</p>
									{team.description && (
										<p className="text-[10px] text-muted-foreground truncate">{team.description}</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-lg">
						Cancel
					</Button>
					<Button onClick={handleSave} className="rounded-lg">
						Save Team
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
