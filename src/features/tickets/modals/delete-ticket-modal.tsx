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
	selectedCount: number;
	onConfirm: () => void;
}

export function DeleteTicketModal({ open, onOpenChange, selectedCount, onConfirm }: DeleteTicketModalProps) {
	const plural = selectedCount > 1;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="text-base">Delete Ticket{plural ? "s" : ""}?</AlertDialogTitle>
					<AlertDialogDescription className="text-xs">
						Are you sure you want to delete {selectedCount} ticket{plural ? "s" : ""}? This action cannot be undone
						and will permanently remove the ticket{plural ? "s" : ""} and all {plural ? "their" : "its"} messages.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">
						<Trash2 className="size-3.5 mr-2" />
						Delete Ticket{plural ? "s" : ""}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
