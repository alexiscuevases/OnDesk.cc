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
import { type CannedReply } from "@/types/index";

interface DeleteCannedReplyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reply: CannedReply | null;
	onConfirm: () => void;
}

export function DeleteCannedReplyModal({ open, onOpenChange, reply, onConfirm }: DeleteCannedReplyModalProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Canned Reply?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete &quot;{reply?.title}&quot;? This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							onConfirm();
							onOpenChange(false);
						}}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
						Delete Reply
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
