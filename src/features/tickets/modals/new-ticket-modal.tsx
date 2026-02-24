import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewTicketForm } from "../forms/new-ticket-form";
import { useCreateTicketMutation } from "../hooks/use-ticket-mutations";
import { useWorkspace } from "@/context/workspace-context";
import type { NewTicketFormValues } from "../schemas/ticket.schema";

interface NewTicketModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewTicketModal({ open, onOpenChange }: NewTicketModalProps) {
	const { workspace } = useWorkspace();
	const createTicket = useCreateTicketMutation(workspace.id);

	async function handleSubmit(values: NewTicketFormValues) {
		await createTicket.mutateAsync({
			workspace_id: workspace.id,
			subject: values.subject,
			priority: values.priority as "low" | "medium" | "high" | "urgent",
			team_id: values.team_id || undefined,
			contact_id: values.contact_id || undefined,
		});
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create New Ticket</DialogTitle>
					<DialogDescription>Fill in the details below to create a new support ticket.</DialogDescription>
				</DialogHeader>
				<NewTicketForm
					onSubmit={handleSubmit}
					onCancel={() => onOpenChange(false)}
					isPending={createTicket.isPending}
					workspaceId={workspace.id}
				/>
			</DialogContent>
		</Dialog>
	);
}
