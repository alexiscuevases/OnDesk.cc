import { useState } from "react";
import { FormModal } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import type { KbArticle, KbCategory, KbStatus, KbVisibility } from "../api/kb-api";

export interface KbArticleFormValues {
	title: string;
	excerpt: string;
	content: string;
	category_id: string | null;
	tags: string[];
	visibility: KbVisibility;
	status: KbStatus;
}

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	article?: KbArticle | null;
	categories: KbCategory[];
	onSubmit: (values: KbArticleFormValues) => void;
}

function defaults(a?: KbArticle | null): KbArticleFormValues {
	return {
		title: a?.title ?? "",
		excerpt: a?.excerpt ?? "",
		content: a?.content ?? "",
		category_id: a?.category_id ?? null,
		tags: a?.tags ?? [],
		visibility: a?.visibility ?? "internal",
		status: a?.status ?? "draft",
	};
}

export function KbArticleFormModal({ open, onOpenChange, article, categories, onSubmit }: Props) {
	const [v, setV] = useState<KbArticleFormValues>(() => defaults(article));
	const [tagInput, setTagInput] = useState("");

	const valid = v.title.trim().length > 0 && v.content.trim().length > 0;

	const addTag = () => {
		const t = tagInput.trim();
		if (t && !v.tags.includes(t)) setV({ ...v, tags: [...v.tags, t] });
		setTagInput("");
	};

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title={article ? "Edit article" : "New article"}
			description="Articles marked as published are indexed for AI agents."
			maxWidth="sm:max-w-xl"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (valid) onSubmit(v);
				}}
			>
				<div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-1">
					<div className="grid gap-2">
						<Label className="text-xs font-medium">Title</Label>
						<Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} className="h-9 rounded-lg" />
					</div>

					<div className="grid grid-cols-3 gap-3">
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Category</Label>
							<Select
								value={v.category_id ?? "none"}
								onValueChange={(val) => setV({ ...v, category_id: val === "none" ? null : val })}
							>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Uncategorized</SelectItem>
									{categories.map((c) => (
										<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Visibility</Label>
							<Select value={v.visibility} onValueChange={(val) => setV({ ...v, visibility: val as KbVisibility })}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="internal">Internal (AI + agents)</SelectItem>
									<SelectItem value="public">Public</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Status</Label>
							<Select value={v.status} onValueChange={(val) => setV({ ...v, status: val as KbStatus })}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="draft">Draft</SelectItem>
									<SelectItem value="published">Published</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid gap-2">
						<Label className="text-xs font-medium">Excerpt</Label>
						<Textarea
							value={v.excerpt}
							onChange={(e) => setV({ ...v, excerpt: e.target.value })}
							placeholder="Short summary used in search results and AI context"
							className="min-h-[50px] rounded-lg text-xs"
						/>
					</div>

					<div className="grid gap-2">
						<Label className="text-xs font-medium">Tags</Label>
						<div className="flex flex-wrap items-center gap-1">
							{v.tags.map((t) => (
								<span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px]">
									{t}
									<button
										type="button"
										onClick={() => setV({ ...v, tags: v.tags.filter((x) => x !== t) })}
										className="text-muted-foreground hover:text-foreground"
									>
										×
									</button>
								</span>
							))}
							<Input
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addTag();
									}
								}}
								placeholder="Add tag…"
								className="h-7 w-32 rounded-md text-xs"
							/>
						</div>
					</div>

					<div className="grid gap-2">
						<Label className="text-xs font-medium">Content</Label>
						<TiptapEditor
							content={v.content}
							onChange={(html) => setV({ ...v, content: html })}
							placeholder="Write the article…"
							minHeight="min-h-[200px]"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg text-xs">
						Cancel
					</Button>
					<Button type="submit" disabled={!valid} className="rounded-lg text-xs font-semibold">
						{article ? "Save changes" : "Create article"}
					</Button>
				</DialogFooter>
			</form>
		</FormModal>
	);
}
