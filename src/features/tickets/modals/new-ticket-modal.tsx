import { FormModal } from "@/shared/components";
import { NewTicketForm } from "../forms/new-ticket-form";
import { useCreateTicketMutation } from "../hooks/use-ticket-mutations";
import { useWorkspace } from "@/context/workspace-context";
import { apiCreateTicketMessage } from "../api/tickets-api";
import type { NewTicketFormValues } from "../schemas/ticket.schema";

interface NewTicketModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewTicketModal({ open, onOpenChange }: NewTicketModalProps) {
	const { workspace } = useWorkspace();
	const createTicket = useCreateTicketMutation(workspace.id);

	async function handleSubmit(values: NewTicketFormValues) {
		const ticket = await createTicket.mutateAsync({
			workspace_id: workspace.id,
			subject: values.subject,
			priority: values.priority as "low" | "medium" | "high" | "urgent",
			team_id: values.team_id || undefined,
			contact_id: values.contact_id || undefined,
			assignee_id: values.assignee_id || undefined,
		});

		if (values.body && values.body.trim() && values.body !== "<p></p>") {
			await apiCreateTicketMessage(ticket.id, { content: values.body, type: "message" });
		}

		onOpenChange(false);
	}

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Create New Ticket"
			description="Fill in the details below to create a new support ticket."
			maxWidth="sm:max-w-xl">
			<NewTicketForm
				onSubmit={handleSubmit}
				onCancel={() => onOpenChange(false)}
				isPending={createTicket.isPending}
				workspaceId={workspace.id}
			/>
		</FormModal>
	);
}
