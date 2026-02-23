import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AgentForm } from "../forms/agent-form";
import { type AgentFormValues } from "../schemas/config.schema";
import { type Agent } from "@/lib/data";

interface EditAgentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: Agent | null;
	onConfirm: (values: AgentFormValues) => void;
}

export function EditAgentModal({ open, onOpenChange, agent, onConfirm }: EditAgentModalProps) {
	if (!agent) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Agent</DialogTitle>
					<DialogDescription>Update agent information</DialogDescription>
				</DialogHeader>
				<AgentForm
					key={agent.id}
					defaultValues={{ email: agent.email, role: agent.role as AgentFormValues["role"] }}
					emailDisabled
					submitLabel="Save Changes"
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
