import { Wrench, Plus, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicWorkspaceProduct } from "../../../../functions/_lib/types";

interface ManageToolsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: { name: string };
	assignedTools: PublicWorkspaceProduct[];
	allWorkspaceProducts: PublicWorkspaceProduct[];
	onAssign: (id: string) => void;
	onUnassign: (id: string) => void;
}

export function ManageToolsModal({
	open,
	onOpenChange,
	agent,
	assignedTools,
	allWorkspaceProducts,
	onAssign,
	onUnassign,
}: ManageToolsModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-sm font-semibold">Manage Agent Tools</DialogTitle>
					<DialogDescription className="text-xs">
						Assign tools to <strong>{agent.name}</strong> to expand its capabilities.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4 space-y-4">
					<div className="space-y-1.5">
						<p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
							Assigned Tools
						</p>
						<div className="space-y-1.5">
							{assignedTools.length === 0 ? (
								<p className="text-[11px] text-muted-foreground italic py-1">No tools assigned</p>
							) : (
								assignedTools.map((tool) => (
									<div
										key={tool.workspace_product_id}
										className="flex items-center justify-between rounded-lg bg-secondary/50 p-2 text-xs">
										<div className="flex items-center gap-2">
											<div className="flex size-6 items-center justify-center rounded bg-primary/10">
												<Wrench className="size-3 text-primary" />
											</div>
											<span>{tool.name}</span>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="size-6 text-destructive hover:text-destructive hover:bg-destructive/10"
											onClick={() => onUnassign(tool.workspace_product_id)}>
											<X className="size-3" />
										</Button>
									</div>
								))
							)}
						</div>
					</div>

					<div className="space-y-1.5 pt-2">
						<p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
							Available in Workspace
						</p>
						<div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
							{allWorkspaceProducts
								.filter((p) => !assignedTools.some((at) => at.workspace_product_id === p.workspace_product_id))
								.map((product) => (
									<div
										key={product.workspace_product_id}
										className="flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/20 p-2 text-xs">
										<div className="flex items-center gap-2">
											<Wrench className="size-3 text-muted-foreground" />
											<span>{product.name}</span>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="size-6 text-primary hover:text-primary hover:bg-primary/10"
											onClick={() => onAssign(product.workspace_product_id)}>
											<Plus className="size-3" />
										</Button>
									</div>
								))}
							{allWorkspaceProducts.filter(
								(p) => !assignedTools.some((at) => at.workspace_product_id === p.workspace_product_id)
							).length === 0 && (
								<p className="text-[11px] text-muted-foreground py-1">
									All available tools are already assigned.
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="flex justify-end pt-2">
					<Button size="sm" className="text-xs h-8" onClick={() => onOpenChange(false)}>
						Done
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
