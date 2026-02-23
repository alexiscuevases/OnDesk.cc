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
import { type Signature } from "@/types/index";

interface DeleteSignatureModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	signature: Signature | null;
	onConfirm: () => void;
}

export function DeleteSignatureModal({ open, onOpenChange, signature, onConfirm }: DeleteSignatureModalProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Signature?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete &quot;{signature?.name}&quot;? This action cannot be undone.
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
						Delete Signature
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
