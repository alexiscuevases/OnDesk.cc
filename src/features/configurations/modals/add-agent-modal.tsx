import { FormModal } from "@/shared/components";
import { AgentForm } from "../forms/agent-form";
import { type AgentFormValues } from "../schemas/config.schema";

interface AddAgentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (values: AgentFormValues) => void;
}

export function AddAgentModal({ open, onOpenChange, onConfirm }: AddAgentModalProps) {
	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Add New Agent"
			description="Invite a new agent to your workspace"
			maxWidth="sm:max-w-md">
			<AgentForm
				submitLabel="Send Invitation"
				onSubmit={(values) => {
					onConfirm(values);
					onOpenChange(false);
				}}
				onCancel={() => onOpenChange(false)}
			/>
		</FormModal>
	);
}
