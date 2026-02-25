import { useState } from "react";
import { Search, Users, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
	const [search, setSearch] = useState("");

	const filtered = teams.filter((t) =>
		t.name.toLowerCase().includes(search.toLowerCase())
	);

	function getInitials(name: string) {
		return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
	}

	function handleOpenChange(open: boolean) {
		if (open) setSelectedTeamId(currentTeamId);
		if (!open) setSearch("");
		onOpenChange(open);
	}

	function handleSave() {
		onSave(selectedTeamId);
		setSearch("");
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-base">Assign Team</DialogTitle>
					<DialogDescription className="text-xs">Select which team should handle this ticket</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							placeholder="Search teams..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9 h-9 rounded-lg"
						/>
					</div>
					<div className="max-h-[300px] overflow-y-auto rounded-lg border">
						{filtered.length > 0 ? (
							<div className="p-1">
								<button
									onClick={() => setSelectedTeamId(null)}
									className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors ${
										selectedTeamId === null ? "bg-secondary" : ""
									}`}>
									<div className="size-8 rounded-lg bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0">—</div>
									<div className="flex-1 min-w-0 text-left">
										<p className="text-sm text-muted-foreground">No team</p>
									</div>
									{selectedTeamId === null && (
										<CheckCircle2 className="size-4 text-primary shrink-0" />
									)}
								</button>
								{filtered.map((team) => (
									<button
										key={team.id}
										onClick={() => setSelectedTeamId(team.id)}
										className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors ${
											selectedTeamId === team.id ? "bg-secondary" : ""
										}`}>
										<Avatar className="size-8 rounded-lg">
											<AvatarImage src={team.logo_url ?? undefined} className="object-cover rounded-lg" />
											<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
												{getInitials(team.name)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0 text-left">
											<p className="text-sm font-medium truncate">{team.name}</p>
											{team.description && (
												<p className="text-xs text-muted-foreground truncate">{team.description}</p>
											)}
										</div>
										{selectedTeamId === team.id && (
											<CheckCircle2 className="size-4 text-primary shrink-0" />
										)}
									</button>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
								<Users className="size-8 mb-2 opacity-30" />
								<p className="text-sm">No teams found</p>
							</div>
						)}
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
