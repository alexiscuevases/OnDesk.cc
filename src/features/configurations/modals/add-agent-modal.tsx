import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AgentForm } from "../forms/agent-form";
import { type AgentFormValues } from "../schemas/config.schema";

interface AddAgentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (values: AgentFormValues) => void;
}

export function AddAgentModal({ open, onOpenChange, onConfirm }: AddAgentModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add New Agent</DialogTitle>
					<DialogDescription>Invite a new agent to your workspace</DialogDescription>
				</DialogHeader>
				<AgentForm
					submitLabel="Send Invitation"
					onSubmit={(values) => {
						onConfirm(values);
						onOpenChange(false);
					}}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
