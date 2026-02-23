import { useState } from "react";
import { Search, UserPlus, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { agents } from "@/lib/data";
import type { Agent } from "@/lib/data";

interface AssignAgentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedCount: number;
	onConfirm: (agentId: string) => void;
}

export function AssignAgentModal({ open, onOpenChange, selectedCount, onConfirm }: AssignAgentModalProps) {
	const [search, setSearch] = useState("");
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
	const plural = selectedCount > 1;

	const filteredAgents = agents.filter(
		(a) =>
			a.name.toLowerCase().includes(search.toLowerCase()) ||
			a.email.toLowerCase().includes(search.toLowerCase()),
	);

	function handleConfirm() {
		if (selectedAgent) {
			onConfirm(selectedAgent.id);
			setSelectedAgent(null);
			setSearch("");
		}
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			setSelectedAgent(null);
			setSearch("");
		}
		onOpenChange(open);
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
						{filteredAgents.length > 0 ? (
							<div className="p-1">
								{filteredAgents.map((agent) => (
									<button
										key={agent.id}
										onClick={() => setSelectedAgent(agent)}
										className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors ${
											selectedAgent?.id === agent.id ? "bg-secondary" : ""
										}`}>
										<Avatar className="size-8 rounded-lg">
											<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
												{agent.initials}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0 text-left">
											<div className="flex items-center gap-2">
												<p className="text-sm font-medium truncate">{agent.name}</p>
												<div
													className={`size-2 rounded-full ${
														agent.status === "online"
															? "bg-accent"
															: agent.status === "away"
																? "bg-warning"
																: "bg-muted-foreground"
													}`}
												/>
											</div>
											<p className="text-xs text-muted-foreground truncate">{agent.role}</p>
											<p className="text-[10px] text-muted-foreground">{agent.tickets} active tickets</p>
										</div>
										{selectedAgent?.id === agent.id && (
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
					<Button onClick={handleConfirm} disabled={!selectedAgent} className="rounded-lg">
						Assign Ticket{plural ? "s" : ""}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
