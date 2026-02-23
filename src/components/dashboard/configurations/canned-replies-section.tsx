"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { type CannedReply } from "@/types/index";
import { nextId } from "@/lib/config-data";

interface CannedRepliesSectionProps {
	replies: CannedReply[];
	setReplies: React.Dispatch<React.SetStateAction<CannedReply[]>>;
}

export function CannedRepliesSection({ replies, setReplies }: CannedRepliesSectionProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingReply, setEditingReply] = useState<CannedReply | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<CannedReply | null>(null);
	const [form, setForm] = useState({ title: "", shortcut: "", content: "" });

	function openAdd() {
		setEditingReply(null);
		setForm({ title: "", shortcut: "", content: "" });
		setDialogOpen(true);
	}

	function openEdit(reply: CannedReply) {
		setEditingReply(reply);
		setForm({ title: reply.title, shortcut: reply.shortcut, content: reply.content });
		setDialogOpen(true);
	}

	function openDelete(reply: CannedReply) {
		setDeleteTarget(reply);
		setDeleteOpen(true);
	}

	function handleSave() {
		if (!form.title || !form.shortcut || !form.content) return;
		if (editingReply) {
			setReplies((prev) =>
				prev.map((r) => (r.id === editingReply.id ? { ...r, title: form.title, shortcut: form.shortcut, content: form.content } : r)),
			);
		} else {
			const newReply: CannedReply = {
				id: nextId("cr"),
				title: form.title,
				shortcut: form.shortcut,
				content: form.content,
			};
			setReplies((prev) => [...prev, newReply]);
		}
		setDialogOpen(false);
	}

	function handleDelete() {
		if (!deleteTarget) return;
		setReplies((prev) => prev.filter((r) => r.id !== deleteTarget.id));
		setDeleteOpen(false);
		setDeleteTarget(null);
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Canned Replies</CardTitle>
							<CardDescription className="text-xs">{replies.length} quick response templates</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAdd}>
							<Plus className="size-3.5" />
							Add Reply
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{replies.map((reply) => (
							<div key={reply.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium">{reply.title}</p>
										<Badge variant="outline" className="text-[10px] rounded-full font-mono px-2">
											{reply.shortcut}
										</Badge>
									</div>
									<p className="text-[11px] text-muted-foreground truncate mt-1">{reply.content}</p>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEdit(reply)}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit reply</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDelete(reply)}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete reply</span>
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
						<DialogTitle>{editingReply ? "Edit Canned Reply" : "Add Canned Reply"}</DialogTitle>
						<DialogDescription>Create a reusable response template with variables</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="reply-title" className="text-xs font-medium">
								Title
							</Label>
							<Input
								id="reply-title"
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="reply-shortcut" className="text-xs font-medium">
								Shortcut
							</Label>
							<Input
								id="reply-shortcut"
								value={form.shortcut}
								onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
								placeholder="/ack"
								className="h-9 rounded-lg font-mono"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="reply-content" className="text-xs font-medium">
								Content
							</Label>
							<TiptapEditor
								content={form.content}
								onChange={(content) => setForm({ ...form, content })}
								placeholder="Enter the canned reply content..."
								minHeight="min-h-[128px]"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!form.title || !form.shortcut || !form.content} className="rounded-lg text-xs font-semibold">
							{editingReply ? "Save Changes" : "Create Reply"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Canned Reply?</AlertDialogTitle>
						<AlertDialogDescription>Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Reply
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
