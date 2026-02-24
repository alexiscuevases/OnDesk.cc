"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/workspace-context";
import { useCannedReplies } from "@/features/canned-replies/hooks/use-canned-reply-queries";
import {
	useCreateCannedReplyMutation,
	useUpdateCannedReplyMutation,
	useDeleteCannedReplyMutation,
} from "@/features/canned-replies/hooks/use-canned-reply-mutations";
import type { CannedReply } from "@/features/canned-replies/api/canned-replies-api";
import { type CannedReplyFormValues } from "../schemas/config.schema";
import { AddCannedReplyModal } from "../modals/add-canned-reply-modal";
import { EditCannedReplyModal } from "../modals/edit-canned-reply-modal";
import { DeleteCannedReplyModal } from "../modals/delete-canned-reply-modal";

export function CannedRepliesSection() {
	const { workspace } = useWorkspace();
	const { data: replies = [] } = useCannedReplies(workspace.id);
	const createReply = useCreateCannedReplyMutation(workspace.id);
	const deleteReply = useDeleteCannedReplyMutation(workspace.id);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedReply, setSelectedReply] = useState<CannedReply | null>(null);

	const updateReply = useUpdateCannedReplyMutation(selectedReply?.id ?? "", workspace.id);

	function handleAdd(values: CannedReplyFormValues) {
		createReply.mutate({
			workspace_id: workspace.id,
			name: values.title,
			content: values.content,
		});
	}

	function handleEdit(values: CannedReplyFormValues) {
		if (!selectedReply) return;
		updateReply.mutate({ name: values.title, content: values.content });
		setEditOpen(false);
		setSelectedReply(null);
	}

	function handleDelete() {
		if (!selectedReply) return;
		deleteReply.mutate(selectedReply.id);
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
									<p className="text-sm font-medium">{reply.name}</p>
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
			<EditCannedReplyModal
				open={editOpen}
				onOpenChange={setEditOpen}
				reply={selectedReply ? { id: selectedReply.id, title: selectedReply.name, shortcut: "", content: selectedReply.content } : null}
				onConfirm={handleEdit}
			/>
			<DeleteCannedReplyModal
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				reply={selectedReply ? { id: selectedReply.id, title: selectedReply.name } : null}
				onConfirm={handleDelete}
			/>
		</>
	);
}
