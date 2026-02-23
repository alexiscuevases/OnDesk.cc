import { Users, UserPlus, Merge, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TicketsBulkActionsProps {
	selectedCount: number;
	onAssignTeam: () => void;
	onAssignAgent: () => void;
	onMerge: () => void;
	onDelete: () => void;
}

export function TicketsBulkActions({
	selectedCount,
	onAssignTeam,
	onAssignAgent,
	onMerge,
	onDelete,
}: TicketsBulkActionsProps) {
	return (
		<Card className="border-primary/50 shadow-md">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<Badge variant="secondary" className="text-xs">
						{selectedCount} selected
					</Badge>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							className="h-8 gap-1.5 rounded-lg text-xs"
							onClick={onAssignTeam}>
							<Users className="size-3.5" />
							Assign Team
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-8 gap-1.5 rounded-lg text-xs"
							onClick={onAssignAgent}>
							<UserPlus className="size-3.5" />
							Assign Agent
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-8 gap-1.5 rounded-lg text-xs"
							onClick={onMerge}
							disabled={selectedCount < 2}>
							<Merge className="size-3.5" />
							Merge
						</Button>
						<Button
							variant="destructive"
							size="sm"
							className="h-8 gap-1.5 rounded-lg text-xs"
							onClick={onDelete}>
							<Trash2 className="size-3.5" />
							Delete
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
