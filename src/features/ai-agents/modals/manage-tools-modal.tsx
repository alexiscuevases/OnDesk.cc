import { useState } from "react";
import { Wrench, Plus, X, ShieldAlert, AlertTriangle, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { PublicWorkspaceProduct } from "../../../../functions/_lib/types";

interface ManageToolsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: { name: string };
	assignedTools: PublicWorkspaceProduct[];
	allWorkspaceProducts: PublicWorkspaceProduct[];
	onAssign: (id: string) => void;
	onUnassign: (id: string) => void;
	/** Restrict which actions of a connector this agent may call. */
	onLimitActions?: (id: string, allowedActions: string[] | null) => void;
}

export function ManageToolsModal({
	open,
	onOpenChange,
	agent,
	assignedTools,
	allWorkspaceProducts,
	onAssign,
	onUnassign,
	onLimitActions,
}: ManageToolsModalProps) {
	const [expanded, setExpanded] = useState<string | null>(null);

	const available = allWorkspaceProducts.filter(
		(product) => !assignedTools.some((tool) => tool.workspace_product_id === product.workspace_product_id),
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-sm font-semibold">Manage agent tools</DialogTitle>
					<DialogDescription className="text-xs">
						Assign connectors to <strong>{agent.name}</strong>. Every enabled action becomes a tool it can call.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<section className="space-y-1.5">
						<p className="console-label">Assigned</p>
						{assignedTools.length === 0 ? (
							<p className="py-1 text-[11px] italic text-muted-foreground">No tools assigned</p>
						) : (
							<div className="divide-y border border-border">
								{assignedTools.map((tool) => {
									// allowed_actions null/empty = every action of the connector.
									const allowed = tool.allowed_actions ?? null;
									const isOpen = expanded === tool.workspace_product_id;
									// The agent's tool list is already filtered by allowed_actions, so the
									// full action list has to come from the install itself — otherwise a
									// restricted action could never be re-enabled.
									const allActions =
										allWorkspaceProducts.find((p) => p.workspace_product_id === tool.workspace_product_id)?.actions ??
										tool.actions;

									return (
										<div key={tool.workspace_product_id} className="p-2">
											<div className="flex items-center justify-between gap-2 text-xs">
												<div className="flex min-w-0 items-center gap-2">
													<div className="flex size-6 shrink-0 items-center justify-center bg-primary/10">
														<Wrench className="size-3 text-primary" />
													</div>
													<span className="truncate">{tool.name}</span>
													<Badge variant="outline" className="shrink-0 font-mono text-[9px] text-muted-foreground">
														{allowed && allowed.length > 0 ? `${allowed.length}/${allActions.length}` : `${allActions.length}`}
													</Badge>
												</div>
												<div className="flex shrink-0 items-center">
													{onLimitActions && allActions.length > 0 && (
														<Button
															variant="ghost"
															size="icon"
															className="size-6"
															onClick={() => setExpanded(isOpen ? null : tool.workspace_product_id)}
														>
															<ChevronDown className={`size-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
														</Button>
													)}
													<Button
														variant="ghost"
														size="icon"
														className="size-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
														onClick={() => onUnassign(tool.workspace_product_id)}
													>
														<X className="size-3" />
													</Button>
												</div>
											</div>

											{isOpen && onLimitActions && (
												<div className="mt-2 space-y-1 border-t border-border pt-2">
													<p className="text-[10px] text-muted-foreground">
														Tick the actions this agent may use. None ticked = all of them.
													</p>
													{allActions.map((action) => {
														const checked = !allowed || allowed.length === 0 ? true : allowed.includes(action.name);
														return (
															<label key={action.id} className="flex items-center gap-2 py-0.5 text-[11px]">
																<Checkbox
																	checked={checked}
																	onCheckedChange={(value) => {
																		const current =
																			allowed && allowed.length > 0 ? allowed : allActions.map((a) => a.name);
																		const next = value
																			? [...new Set([...current, action.name])]
																			: current.filter((name) => name !== action.name);
																		onLimitActions(
																			tool.workspace_product_id,
																			next.length === allActions.length ? null : next,
																		);
																	}}
																/>
																<span className="font-mono">{action.name}</span>
																{action.requires_confirmation && (
																	<Badge variant="outline" className="gap-1 border-warning/40 text-[9px] text-warning">
																		<ShieldAlert className="size-2.5" />
																		Approval
																	</Badge>
																)}
															</label>
														);
													})}
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}
					</section>

					<section className="space-y-1.5 pt-1">
						<p className="console-label">Available in workspace</p>
						<div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
							{available.length === 0 ? (
								<p className="py-1 text-[11px] text-muted-foreground">
									{allWorkspaceProducts.length === 0
										? "Install a connector from the Marketplace first."
										: "All available tools are already assigned."}
								</p>
							) : (
								available.map((product) => {
									const missingCredentials = product.config_fields.some(
										(field) => field.required && field.secret && !product.credential_keys.includes(field.key),
									);
									return (
										<div
											key={product.workspace_product_id}
											className="flex items-center justify-between border border-dashed border-muted-foreground/20 p-2 text-xs"
										>
											<div className="flex min-w-0 items-center gap-2">
												<Wrench className="size-3 shrink-0 text-muted-foreground" />
												<span className="truncate">{product.name}</span>
												<Badge variant="outline" className="shrink-0 font-mono text-[9px] text-muted-foreground">
													{product.actions.length}
												</Badge>
												{missingCredentials && (
													<Badge variant="outline" className="shrink-0 gap-1 border-warning/40 text-[9px] text-warning">
														<AlertTriangle className="size-2.5" />
														Not configured
													</Badge>
												)}
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="size-6 text-primary hover:bg-primary/10 hover:text-primary"
												onClick={() => onAssign(product.workspace_product_id)}
											>
												<Plus className="size-3" />
											</Button>
										</div>
									);
								})
							)}
						</div>
					</section>
				</div>

				<div className="flex justify-end pt-2">
					<Button size="sm" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
						Done
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
