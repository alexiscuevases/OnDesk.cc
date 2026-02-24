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
interface DeleteAgentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: { id: string; name: string } | null;
	onConfirm: () => void;
}

export function DeleteAgentModal({ open, onOpenChange, agent, onConfirm }: DeleteAgentModalProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Agent?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to remove {agent?.name}? This will unassign their tickets and remove their access.
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
						Delete Agent
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
