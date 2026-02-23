import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { fetchTeams, queryKeys } from "@/lib/queries";

interface ManageTeamsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentTeams: string[];
	onSave: (teamNames: string[]) => void;
}

export function ManageTeamsModal({ open, onOpenChange, currentTeams, onSave }: ManageTeamsModalProps) {
	const { data: teams = [] } = useQuery({ queryKey: queryKeys.teams.all, queryFn: fetchTeams });
	const [selected, setSelected] = useState<string[]>(currentTeams);

	function handleOpenChange(open: boolean) {
		if (open) setSelected(currentTeams);
		onOpenChange(open);
	}

	function toggleTeam(teamName: string) {
		setSelected((prev) =>
			prev.includes(teamName) ? prev.filter((t) => t !== teamName) : [...prev, teamName],
		);
	}

	function handleSave() {
		onSave(selected);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-base">Manage Teams</DialogTitle>
					<DialogDescription className="text-xs">Select which teams should handle this ticket</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2 py-2">
					<div className="max-h-[300px] overflow-y-auto rounded-lg border p-2">
						{teams.map((team) => {
							const isSelected = selected.includes(team.name);
							return (
								<div
									key={team.id}
									className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer"
									onClick={() => toggleTeam(team.name)}>
									<Checkbox checked={isSelected} className="size-4" />
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
							);
						})}
					</div>
					<p className="text-[10px] text-muted-foreground px-1">
						{selected.length} team{selected.length !== 1 ? "s" : ""} selected
					</p>
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-lg">
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={selected.length === 0} className="rounded-lg">
						Save Teams
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
