import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewTicketForm } from "../forms/new-ticket-form";
import type { NewTicketFormValues } from "../schemas/ticket.schema";

interface NewTicketModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewTicketModal({ open, onOpenChange }: NewTicketModalProps) {
	function handleSubmit(values: NewTicketFormValues) {
		console.log("[v0] Create ticket:", values);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create New Ticket</DialogTitle>
					<DialogDescription>Fill in the details below to create a new support ticket.</DialogDescription>
				</DialogHeader>
				<NewTicketForm onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}
