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
import { type ConfigTeam } from "@/types/index";

interface DeleteTeamModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	team: ConfigTeam | null;
	onConfirm: () => void;
}

export function DeleteTeamModal({ open, onOpenChange, team, onConfirm }: DeleteTeamModalProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Team?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete {team?.name}? Existing tickets will need to be reassigned.
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
						Delete Team
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
