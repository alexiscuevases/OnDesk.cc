"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { nextId } from "@/lib/config-data";

interface SignaturesSectionProps {
	signatures: Signature[];
	setSignatures: React.Dispatch<React.SetStateAction<Signature[]>>;
}

export function SignaturesSection({ signatures, setSignatures }: SignaturesSectionProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingSig, setEditingSig] = useState<Signature | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Signature | null>(null);
	const [form, setForm] = useState({ name: "", content: "", isDefault: false });

	function openAdd() {
		setEditingSig(null);
		setForm({ name: "", content: "", isDefault: false });
		setDialogOpen(true);
	}

	function openEdit(sig: Signature) {
		setEditingSig(sig);
		setForm({ name: sig.name, content: sig.content, isDefault: sig.isDefault });
		setDialogOpen(true);
	}

	function openDelete(sig: Signature) {
		setDeleteTarget(sig);
		setDeleteOpen(true);
	}

	function handleSave() {
		if (!form.name || !form.content) return;
		if (editingSig) {
			setSignatures((prev) =>
				prev.map((s) =>
					s.id === editingSig.id
						? { ...s, name: form.name, content: form.content, isDefault: form.isDefault }
						: form.isDefault
							? { ...s, isDefault: false }
							: s,
				),
			);
		} else {
			const newSig: Signature = {
				id: nextId("s"),
				name: form.name,
				content: form.content,
				isDefault: form.isDefault,
			};
			setSignatures((prev) => [...prev.map((s) => (form.isDefault ? { ...s, isDefault: false } : s)), newSig]);
		}
		setDialogOpen(false);
	}

	function handleDelete() {
		if (!deleteTarget) return;
		setSignatures((prev) => prev.filter((s) => s.id !== deleteTarget.id));
		setDeleteOpen(false);
		setDeleteTarget(null);
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
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAdd}>
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
									<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEdit(sig)}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit signature</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDelete(sig)}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete signature</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingSig ? "Edit Signature" : "Add Signature"}</DialogTitle>
						<DialogDescription>Create a signature template with variables</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="sig-name" className="text-xs font-medium">
								Signature Name
							</Label>
							<Input id="sig-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 rounded-lg" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="sig-content" className="text-xs font-medium">
								Signature Content
							</Label>
							<TiptapEditor
								content={form.content}
								onChange={(content) => setForm({ ...form, content })}
								placeholder="Enter your signature..."
								minHeight="min-h-[128px]"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox
								id="sig-default"
								checked={form.isDefault}
								onCheckedChange={(checked) => setForm({ ...form, isDefault: checked as boolean })}
							/>
							<Label htmlFor="sig-default" className="text-xs font-medium cursor-pointer">
								Set as default signature
							</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!form.name || !form.content} className="rounded-lg text-xs font-semibold">
							{editingSig ? "Save Changes" : "Create Signature"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Signature?</AlertDialogTitle>
						<AlertDialogDescription>Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Signature
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
