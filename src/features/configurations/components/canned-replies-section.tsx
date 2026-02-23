"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type CannedReply } from "@/types/index";
import { nextId } from "@/lib/config-data";
import { type CannedReplyFormValues } from "../schemas/config.schema";
import { AddCannedReplyModal } from "../modals/add-canned-reply-modal";
import { EditCannedReplyModal } from "../modals/edit-canned-reply-modal";
import { DeleteCannedReplyModal } from "../modals/delete-canned-reply-modal";

interface CannedRepliesSectionProps {
	replies: CannedReply[];
	setReplies: React.Dispatch<React.SetStateAction<CannedReply[]>>;
}

export function CannedRepliesSection({ replies, setReplies }: CannedRepliesSectionProps) {
	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedReply, setSelectedReply] = useState<CannedReply | null>(null);

	function handleAdd(values: CannedReplyFormValues) {
		const newReply: CannedReply = {
			id: nextId("cr"),
			title: values.title,
			shortcut: values.shortcut,
			content: values.content,
		};
		setReplies((prev) => [...prev, newReply]);
	}

	function handleEdit(values: CannedReplyFormValues) {
		if (!selectedReply) return;
		setReplies((prev) =>
			prev.map((r) =>
				r.id === selectedReply.id ? { ...r, title: values.title, shortcut: values.shortcut, content: values.content } : r,
			),
		);
	}

	function handleDelete() {
		if (!selectedReply) return;
		setReplies((prev) => prev.filter((r) => r.id !== selectedReply.id));
		setSelectedReply(null);
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
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={() => setAddOpen(true)}>
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
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg"
										onClick={() => {
											setSelectedReply(reply);
											setEditOpen(true);
										}}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit reply</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => {
											setSelectedReply(reply);
											setDeleteOpen(true);
										}}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete reply</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<AddCannedReplyModal open={addOpen} onOpenChange={setAddOpen} onConfirm={handleAdd} />
			<EditCannedReplyModal open={editOpen} onOpenChange={setEditOpen} reply={selectedReply} onConfirm={handleEdit} />
			<DeleteCannedReplyModal open={deleteOpen} onOpenChange={setDeleteOpen} reply={selectedReply} onConfirm={handleDelete} />
		</>
	);
}
