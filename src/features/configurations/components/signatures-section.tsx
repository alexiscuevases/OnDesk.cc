"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Signature } from "@/types/index";
import { nextId } from "@/lib/config-data";
import { type SignatureFormValues } from "../schemas/config.schema";
import { AddSignatureModal } from "../modals/add-signature-modal";
import { EditSignatureModal } from "../modals/edit-signature-modal";
import { DeleteSignatureModal } from "../modals/delete-signature-modal";

interface SignaturesSectionProps {
	signatures: Signature[];
	setSignatures: React.Dispatch<React.SetStateAction<Signature[]>>;
}

export function SignaturesSection({ signatures, setSignatures }: SignaturesSectionProps) {
	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedSig, setSelectedSig] = useState<Signature | null>(null);

	function handleAdd(values: SignatureFormValues) {
		const newSig: Signature = {
			id: nextId("s"),
			name: values.name,
			content: values.content,
			isDefault: values.isDefault,
		};
		setSignatures((prev) => [...prev.map((s) => (values.isDefault ? { ...s, isDefault: false } : s)), newSig]);
	}

	function handleEdit(values: SignatureFormValues) {
		if (!selectedSig) return;
		setSignatures((prev) =>
			prev.map((s) =>
				s.id === selectedSig.id
					? { ...s, name: values.name, content: values.content, isDefault: values.isDefault }
					: values.isDefault
						? { ...s, isDefault: false }
						: s,
			),
		);
	}

	function handleDelete() {
		if (!selectedSig) return;
		setSignatures((prev) => prev.filter((s) => s.id !== selectedSig.id));
		setSelectedSig(null);
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Email Signatures</CardTitle>
							<CardDescription className="text-xs">{signatures.length} signatures configured</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={() => setAddOpen(true)}>
							<Plus className="size-3.5" />
							Add Signature
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{signatures.map((sig) => (
							<div key={sig.id} className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium">{sig.name}</p>
										{sig.isDefault && (
											<Badge variant="secondary" className="text-[10px] rounded-full px-2">
												Default
											</Badge>
										)}
									</div>
									<pre className="text-[11px] text-muted-foreground mt-2 whitespace-pre-wrap font-mono bg-muted/50 rounded-lg p-2">
										{sig.content}
									</pre>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg"
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
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
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
				</CardContent>
			</Card>

			<AddSignatureModal open={addOpen} onOpenChange={setAddOpen} onConfirm={handleAdd} />
			<EditSignatureModal open={editOpen} onOpenChange={setEditOpen} signature={selectedSig} onConfirm={handleEdit} />
			<DeleteSignatureModal open={deleteOpen} onOpenChange={setDeleteOpen} signature={selectedSig} onConfirm={handleDelete} />
		</>
	);
}
