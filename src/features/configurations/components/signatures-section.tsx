import { useState } from "react";
import { Plus, Pencil, Trash2, FileText, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, StatGrid, StatTile } from "@/shared/components/console";
import { useSignatures } from "@/features/signatures/hooks/use-signature-queries";
import { useCreateSignatureMutation, useUpdateSignatureMutation, useDeleteSignatureMutation } from "@/features/signatures/hooks/use-signature-mutations";
import type { Signature } from "@/features/signatures/api/signatures-api";
import { type SignatureFormValues } from "../schemas/config.schema";
import { AddSignatureModal } from "../modals/add-signature-modal";
import { EditSignatureModal } from "../modals/edit-signature-modal";
import { DeleteSignatureModal } from "../modals/delete-signature-modal";

export function SignaturesSection() {
	const { data: signatures = [] } = useSignatures();
	const createSignature = useCreateSignatureMutation();
	const deleteSignature = useDeleteSignatureMutation();

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedSig, setSelectedSig] = useState<Signature | null>(null);

	const updateSignature = useUpdateSignatureMutation(selectedSig?.id ?? "");

	function handleAdd(values: SignatureFormValues) {
		createSignature.mutate({ name: values.name, content: values.content, is_default: values.isDefault });
	}

	function handleEdit(values: SignatureFormValues) {
		if (!selectedSig) return;
		updateSignature.mutate({ name: values.name, content: values.content, is_default: values.isDefault });
		setEditOpen(false);
		setSelectedSig(null);
	}

	function handleDelete() {
		if (!selectedSig) return;
		deleteSignature.mutate(selectedSig.id);
		setSelectedSig(null);
	}

	const defaultCount = signatures.filter((s) => s.is_default).length;

	return (
		<>
			<div className="flex flex-col gap-6">
				<div className="flex items-end justify-between">
					<p className="text-xs text-muted-foreground">
						Email signatures automatically appended to outgoing replies.
					</p>
					<Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddOpen(true)}>
						<Plus className="size-3.5" />
						Add Signature
					</Button>
				</div>

				<StatGrid className="grid-cols-2">
					<StatTile icon={FileText} label="Signatures" value={signatures.length} />
					<StatTile icon={Star} label="Default" value={defaultCount} />
				</StatGrid>

				<Card>
				<CardHeader>
					<CardTitle className="console-label">Email Signatures</CardTitle>
					<CardDescription className="text-xs">Personal signatures available on your account</CardDescription>
				</CardHeader>
				<CardContent>
					{signatures.length === 0 ? (
						<EmptyState
							icon={FileText}
							title="No signatures yet"
							description="Add email signatures to automatically append to outgoing replies."
						/>
					) : (
						<div className="space-y-2">
							{signatures.map((sig) => (
								<div key={sig.id} className="flex items-start gap-3 bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium">{sig.name}</p>
											{sig.is_default && (
												<Badge variant="secondary" className="text-[10px] px-2">
													Default
												</Badge>
											)}
										</div>
										<pre className="text-[11px] text-muted-foreground mt-2 whitespace-pre-wrap font-mono bg-muted/50 p-2">
											{sig.content}
										</pre>
									</div>
									<div className="flex items-center gap-1 shrink-0">
										<Button
											variant="ghost"
											size="icon"
											className="size-7"
											onClick={() => {
												setSelectedSig(sig);
												setEditOpen(true);
											}}>
											<Pencil className="size-3" />
											<span className="sr-only">Edit signature</span>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
											onClick={() => {
												setSelectedSig(sig);
												setDeleteOpen(true);
											}}>
											<Trash2 className="size-3" />
											<span className="sr-only">Delete signature</span>
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
			</div>

			<AddSignatureModal open={addOpen} onOpenChange={setAddOpen} onConfirm={handleAdd} />
			<EditSignatureModal open={editOpen} onOpenChange={setEditOpen} signature={selectedSig} onConfirm={handleEdit} />
			<DeleteSignatureModal open={deleteOpen} onOpenChange={setDeleteOpen} signature={selectedSig} onConfirm={handleDelete} />
		</>
	);
}
