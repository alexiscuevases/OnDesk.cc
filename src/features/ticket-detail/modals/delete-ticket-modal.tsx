import { Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteTicketModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ticketId: string;
	onConfirm: () => void;
}

export function DeleteTicketModal({ open, onOpenChange, ticketId, onConfirm }: DeleteTicketModalProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="text-base">Delete Ticket?</AlertDialogTitle>
					<AlertDialogDescription className="text-xs">
						Are you sure you want to delete ticket{" "}
						<span className="font-mono font-semibold text-foreground">{ticketId}</span>? This action cannot be
						undone and will permanently remove the ticket and all its messages.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">
						<Trash2 className="size-3.5 mr-2" />
						Delete Ticket
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
