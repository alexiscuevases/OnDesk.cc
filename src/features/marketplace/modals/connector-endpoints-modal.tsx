import { useState } from "react";
import { Plus, Pencil, Trash2, Download, ShieldAlert, Lock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDeleteModal } from "@/shared/components";
import { ConsoleTag, EmptyState } from "@/shared/components/console";
import { ActionFormModal } from "./action-form-modal";
import { useCreateAction, useDeleteAction, useImportActions, useUpdateAction } from "../hooks/use-marketplace-mutations";
import type { ActionInput, ImportedAction, PublicProduct, PublicProductAction } from "../api/marketplace-api";

const METHOD_TONE: Record<string, string> = {
	GET: "text-info border-info/40",
	POST: "text-accent border-accent/40",
	PUT: "text-warning border-warning/40",
	PATCH: "text-warning border-warning/40",
	DELETE: "text-destructive border-destructive/40",
};

export interface ConnectorEndpointsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	connector: PublicProduct;
	workspaceId: string;
	slug: string;
}

type Editing = { type: "closed" } | { type: "create" } | { type: "edit"; action: PublicProductAction };

/** Manages the endpoint list of one connector: add, edit, delete, or bulk import. */
export function ConnectorEndpointsModal({ open, onOpenChange, connector, workspaceId, slug }: ConnectorEndpointsModalProps) {
	const createMutation = useCreateAction(workspaceId, slug);
	const updateMutation = useUpdateAction(workspaceId, slug);
	const deleteMutation = useDeleteAction(workspaceId, slug);

	const [editing, setEditing] = useState<Editing>({ type: "closed" });
	const [deleting, setDeleting] = useState<PublicProductAction | null>(null);
	const [showImport, setShowImport] = useState(false);

	const actions = connector.actions;

	const handleCreate = (input: ActionInput) => {
		createMutation.mutate(
			{ productId: connector.id, input },
			{
				onSuccess: () => {
					toast.success(`${input.name} registered`);
					setEditing({ type: "closed" });
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to register endpoint"),
			},
		);
	};

	const handleUpdate = (actionId: string, input: ActionInput) => {
		updateMutation.mutate(
			{ productId: connector.id, actionId, input },
			{
				onSuccess: () => {
					toast.success("Endpoint updated");
					setEditing({ type: "closed" });
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update endpoint"),
			},
		);
	};

	const handleDelete = () => {
		if (!deleting) return;
		deleteMutation.mutate(
			{ productId: connector.id, actionId: deleting.id },
			{
				onSuccess: () => {
					toast.success("Endpoint removed");
					setDeleting(null);
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to remove endpoint"),
			},
		);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{connector.name} — endpoints</DialogTitle>
						<DialogDescription className="font-mono text-[11px]">{connector.base_url}</DialogDescription>
					</DialogHeader>

					<div className="flex items-center justify-between gap-2 border-b border-border pb-3">
						<ConsoleTag className="text-primary dark:text-accent">
							{actions.length} registered {actions.length === 1 ? "action" : "actions"}
						</ConsoleTag>
						<div className="flex items-center gap-2">
							<Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowImport((v) => !v)}>
								<Download className="mr-1 size-3" />
								Import
							</Button>
							<Button size="sm" className="h-8 text-xs" onClick={() => setEditing({ type: "create" })}>
								<Plus className="mr-1 size-3" />
								Add endpoint
							</Button>
						</div>
					</div>

					{showImport && (
						<ImportPanel
							connector={connector}
							workspaceId={workspaceId}
							slug={slug}
							onDone={() => setShowImport(false)}
						/>
					)}

					{actions.length === 0 ? (
						<EmptyState
							icon={Plus}
							title="No endpoints yet"
							description="Register the API calls the agent should be able to make — one per resource operation."
						/>
					) : (
						<ul className="divide-y border border-border">
							{actions.map((action) => (
								<li key={action.id} className="group relative flex items-start justify-between gap-3 p-3">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<Badge variant="outline" className={`text-[9px] ${METHOD_TONE[action.method] ?? ""}`}>
												{action.method}
											</Badge>
											<span className="font-mono text-xs font-medium">{action.name}</span>
											{action.requires_confirmation && (
												<Badge variant="outline" className="gap-1 border-warning/40 text-[9px] text-warning">
													<ShieldAlert className="size-2.5" />
													Human approval
												</Badge>
											)}
											{action.is_read_only && (
												<Badge variant="outline" className="gap-1 text-[9px] text-muted-foreground">
													<Lock className="size-2.5" />
													Read-only
												</Badge>
											)}
											{!action.enabled && (
												<Badge variant="outline" className="text-[9px] text-muted-foreground">
													Disabled
												</Badge>
											)}
										</div>
										<p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{action.path}</p>
										<p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{action.description}</p>
										{action.parameters.length > 0 && (
											<p className="mt-1 font-mono text-[10px] text-muted-foreground">
												{action.parameters.map((p) => `${p.name}${p.required ? "*" : ""}`).join(" · ")}
											</p>
										)}
									</div>
									<div className="flex shrink-0 items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="size-8"
											onClick={() => setEditing({ type: "edit", action })}
										>
											<Pencil className="size-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="size-8 text-destructive"
											onClick={() => setDeleting(action)}
										>
											<Trash2 className="size-3.5" />
										</Button>
									</div>
									<span className="scan-line" />
								</li>
							))}
						</ul>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Done
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{editing.type === "create" && (
				<ActionFormModal
					open
					onOpenChange={(o) => !o && setEditing({ type: "closed" })}
					connector={connector}
					action={null}
					onSubmit={handleCreate}
					isPending={createMutation.isPending}
				/>
			)}

			{editing.type === "edit" && (
				<ActionFormModal
					open
					onOpenChange={(o) => !o && setEditing({ type: "closed" })}
					connector={connector}
					action={editing.action}
					onSubmit={(input) => handleUpdate(editing.action.id, input)}
					isPending={updateMutation.isPending}
				/>
			)}

			<ConfirmDeleteModal
				open={!!deleting}
				onOpenChange={(o) => !o && setDeleting(null)}
				title="Remove endpoint"
				description={`"${deleting?.name}" will no longer be available to any agent. This cannot be undone.`}
				confirmLabel="Remove"
				onConfirm={handleDelete}
			/>
		</>
	);
}

/** cURL / OpenAPI import with a preview step so nothing lands unreviewed. */
function ImportPanel({
	connector,
	workspaceId,
	slug,
	onDone,
}: {
	connector: PublicProduct;
	workspaceId: string;
	slug: string;
	onDone: () => void;
}) {
	const importMutation = useImportActions(workspaceId, slug);
	const [source, setSource] = useState<"curl" | "openapi">("curl");
	const [text, setText] = useState("");
	const [preview, setPreview] = useState<ImportedAction[] | null>(null);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [warnings, setWarnings] = useState<string[]>([]);

	const buildPayload = (isPreview: boolean, include?: string[]) =>
		source === "curl"
			? { source: "curl" as const, curl: text, preview: isPreview }
			: { source: "openapi" as const, spec: text, include, preview: isPreview };

	const runPreview = () => {
		importMutation.mutate(
			{ productId: connector.id, payload: buildPayload(true) },
			{
				onSuccess: (data) => {
					setPreview(data.actions);
					setWarnings(data.warnings ?? []);
					setSelected(new Set(data.actions.map((a) => `${a.method} ${a.path}`)));
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Import failed"),
			},
		);
	};

	const runImport = () => {
		const include = source === "openapi" ? [...selected] : undefined;
		importMutation.mutate(
			{ productId: connector.id, payload: buildPayload(false, include) },
			{
				onSuccess: (data) => {
					toast.success(`Imported ${data.imported ?? 0} endpoint(s)`);
					(data.warnings ?? []).slice(0, 3).forEach((warning) => toast.warning(warning));
					setPreview(null);
					setText("");
					onDone();
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Import failed"),
			},
		);
	};

	return (
		<div className="space-y-3 border border-border bg-muted/30 p-3">
			<div className="flex items-center gap-2">
				<Select
					value={source}
					onValueChange={(v) => {
						setSource(v as "curl" | "openapi");
						setPreview(null);
					}}
				>
					<SelectTrigger className="h-8 w-40 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="curl">cURL command</SelectItem>
						<SelectItem value="openapi">OpenAPI (JSON)</SelectItem>
					</SelectContent>
				</Select>
				<p className="text-[11px] text-muted-foreground">
					{source === "curl"
						? "Paste a working request from the API docs."
						: "Paste the OpenAPI 3 document, then pick the operations you want."}
				</p>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="import-source" className="text-[11px]">
					{source === "curl" ? "cURL" : "Spec"}
				</Label>
				<Textarea
					id="import-source"
					value={text}
					onChange={(e) => {
						setText(e.target.value);
						setPreview(null);
					}}
					rows={source === "curl" ? 4 : 6}
					placeholder={
						source === "curl"
							? 'curl https://api.example.com/v1/orders?status=open \\\n  -H "Authorization: Bearer sk_test_123"'
							: '{ "openapi": "3.0.0", "paths": { ... } }'
					}
					className="font-mono text-[11px]"
				/>
			</div>

			{warnings.length > 0 && (
				<ul className="space-y-1">
					{warnings.map((warning) => (
						<li key={warning} className="text-[10px] text-warning">
							{warning}
						</li>
					))}
				</ul>
			)}

			{preview && preview.length > 0 && (
				<div className="max-h-52 space-y-1 overflow-y-auto border border-border bg-card p-2">
					{preview.map((action) => {
						const key = `${action.method} ${action.path}`;
						return (
							<label key={key} className="flex items-start gap-2 py-1 text-[11px]">
								{source === "openapi" ? (
									<Checkbox
										checked={selected.has(key)}
										onCheckedChange={(checked) => {
											setSelected((prev) => {
												const next = new Set(prev);
												if (checked) next.add(key);
												else next.delete(key);
												return next;
											});
										}}
										className="mt-0.5"
									/>
								) : (
									<span className="mt-0.5 size-3.5" />
								)}
								<span className="min-w-0">
									<span className="font-mono">
										<span className="text-muted-foreground">{action.method}</span> {action.path}
									</span>
									<span className="ml-2 font-mono text-[10px] text-accent">{action.name}</span>
								</span>
							</label>
						);
					})}
				</div>
			)}

			<div className="flex items-center justify-end gap-2">
				<Button size="sm" variant="outline" className="h-8 text-xs" onClick={onDone}>
					Close
				</Button>
				{!preview ? (
					<Button size="sm" className="h-8 text-xs" onClick={runPreview} disabled={!text.trim() || importMutation.isPending}>
						{importMutation.isPending ? "Reading…" : "Preview"}
					</Button>
				) : (
					<Button
						size="sm"
						className="h-8 text-xs"
						onClick={runImport}
						disabled={importMutation.isPending || (source === "openapi" && selected.size === 0)}
					>
						{importMutation.isPending
							? "Importing…"
							: `Import ${source === "openapi" ? selected.size : preview.length} endpoint(s)`}
					</Button>
				)}
			</div>
		</div>
	);
}
