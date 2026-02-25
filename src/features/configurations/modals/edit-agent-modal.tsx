import { FormModal } from "@/shared/components";
import { AgentForm } from "../forms/agent-form";
import { type AgentFormValues } from "../schemas/config.schema";

interface EditAgentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: { id: string; email?: string; role: string } | null;
	onConfirm: (values: AgentFormValues) => void;
}

export function EditAgentModal({ open, onOpenChange, agent, onConfirm }: EditAgentModalProps) {
	if (!agent) return null;

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Edit Agent"
			description="Update agent information"
			maxWidth="sm:max-w-md">
			<AgentForm
				key={agent.id}
				defaultValues={{ email: agent.email ?? "", role: agent.role as AgentFormValues["role"] }}
				emailDisabled
				submitLabel="Save Changes"
				onSubmit={(values) => {
					onConfirm(values);
					onOpenChange(false);
				}}
				onCancel={() => onOpenChange(false)}
			/>
		</FormModal>
	);
}
