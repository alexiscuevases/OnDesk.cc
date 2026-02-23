import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewTicketDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewTicketDialog({ open, onOpenChange }: NewTicketDialogProps) {
	const [newTicket, setNewTicket] = useState({
		subject: "",
		requester: "",
		priority: "medium",
		team: "",
		description: "",
	});

	function handleCreate() {
		console.log("[v0] Create ticket:", newTicket);
		onOpenChange(false);
		setNewTicket({ subject: "", requester: "", priority: "medium", team: "", description: "" });
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create New Ticket</DialogTitle>
					<DialogDescription>Fill in the details below to create a new support ticket.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="nt-subject" className="text-xs font-medium">
							Subject
						</Label>
						<Input
							id="nt-subject"
							placeholder="Brief description of the issue"
							value={newTicket.subject}
							onChange={(e) => setNewTicket((p) => ({ ...p, subject: e.target.value }))}
							className="h-9 rounded-lg"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="nt-requester" className="text-xs font-medium">
								Requester Email
							</Label>
							<Input
								id="nt-requester"
								placeholder="user@company.com"
								value={newTicket.requester}
								onChange={(e) => setNewTicket((p) => ({ ...p, requester: e.target.value }))}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Priority</Label>
							<Select value={newTicket.priority} onValueChange={(v) => setNewTicket((p) => ({ ...p, priority: v }))}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="low">Low</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="critical">Critical</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="grid gap-2">
						<Label className="text-xs font-medium">Team</Label>
						<Select value={newTicket.team} onValueChange={(v) => setNewTicket((p) => ({ ...p, team: v }))}>
							<SelectTrigger className="h-9 rounded-lg text-xs">
								<SelectValue placeholder="Assign to team..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Email Support">Email Support</SelectItem>
								<SelectItem value="Teams Support">Teams Support</SelectItem>
								<SelectItem value="SharePoint Support">SharePoint Support</SelectItem>
								<SelectItem value="Identity & Access">{"Identity & Access"}</SelectItem>
								<SelectItem value="Cloud Storage">Cloud Storage</SelectItem>
								<SelectItem value="Office Apps">Office Apps</SelectItem>
								<SelectItem value="Automation">Automation</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="nt-desc" className="text-xs font-medium">
							Description
						</Label>
						<Textarea
							id="nt-desc"
							placeholder="Detailed description of the issue..."
							value={newTicket.description}
							onChange={(e) => setNewTicket((p) => ({ ...p, description: e.target.value }))}
							className="min-h-24 rounded-lg resize-none"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg text-xs">
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={!newTicket.subject || !newTicket.requester}
						className="rounded-lg text-xs font-semibold gap-1.5">
						<Plus className="size-3.5" />
						Create Ticket
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
