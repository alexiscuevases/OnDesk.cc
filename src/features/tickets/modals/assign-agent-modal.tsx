import { useState } from "react";
import { Search, UserPlus, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/context/workspace-context";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";
import type { WorkspaceMember } from "@/features/users/api/users-api";

interface AssignAgentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedCount: number;
	workspaceId: string;
	onConfirm: (agentId: string) => void;
}

export function AssignAgentModal({ open, onOpenChange, selectedCount, workspaceId, onConfirm }: AssignAgentModalProps) {
	const { workspace } = useWorkspace();
	const { data: members = [] } = useWorkspaceMembers(workspaceId);
	const [search, setSearch] = useState("");
	const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
	const plural = selectedCount > 1;

	const filtered = members.filter(
		(m) =>
			m.name.toLowerCase().includes(search.toLowerCase()) ||
			m.email.toLowerCase().includes(search.toLowerCase()),
	);

	function handleConfirm() {
		if (selectedMember) {
			onConfirm(selectedMember.id);
			setSelectedMember(null);
			setSearch("");
		}
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			setSelectedMember(null);
			setSearch("");
		}
		onOpenChange(open);
	}

	function getInitials(name: string) {
		return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-base">Assign Agent</DialogTitle>
					<DialogDescription className="text-xs">
						Select an agent to assign {selectedCount} ticket{plural ? "s" : ""} to
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							placeholder="Search agents..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9 h-9 rounded-lg"
						/>
					</div>
					<div className="max-h-[300px] overflow-y-auto rounded-lg border">
						{filtered.length > 0 ? (
							<div className="p-1">
								{filtered.map((member) => (
									<button
										key={member.id}
										onClick={() => setSelectedMember(member)}
										className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors ${
											selectedMember?.id === member.id ? "bg-secondary" : ""
										}`}>
										<Avatar className="size-8 rounded-lg">
											<AvatarImage src={member.logo_url ?? workspace.logo_url ?? undefined} className="object-cover rounded-lg" />
											<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
												{getInitials(member.name)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0 text-left">
											<p className="text-sm font-medium truncate">{member.name}</p>
											<p className="text-xs text-muted-foreground truncate">{member.email}</p>
											<p className="text-[10px] text-muted-foreground capitalize">{member.workspace_role}</p>
										</div>
										{selectedMember?.id === member.id && (
											<CheckCircle2 className="size-4 text-primary shrink-0" />
										)}
									</button>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
								<UserPlus className="size-8 mb-2 opacity-30" />
								<p className="text-sm">No agents found</p>
							</div>
						)}
					</div>
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-lg">
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={!selectedMember} className="rounded-lg">
						Assign Ticket{plural ? "s" : ""}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
