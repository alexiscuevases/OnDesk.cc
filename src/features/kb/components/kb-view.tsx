import { useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, FolderPlus, FileText, Search } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/context/workspace-context";
import { ConfirmDeleteModal } from "@/shared/components";
import { useKbCategories, useKbArticles } from "../hooks/use-kb-queries";
import {
	useCreateKbCategoryMutation,
	useUpdateKbCategoryMutation,
	useDeleteKbCategoryMutation,
	useCreateKbArticleMutation,
	useUpdateKbArticleMutation,
	useDeleteKbArticleMutation,
} from "../hooks/use-kb-mutations";
import { KbArticleFormModal, type KbArticleFormValues } from "../modals/kb-article-form-modal";
import { KbCategoryFormModal, type KbCategoryFormValues } from "../modals/kb-category-form-modal";
import type { KbArticle, KbCategory } from "../api/kb-api";

type ArticleMode = { type: "closed" } | { type: "create" } | { type: "edit"; article: KbArticle };
type CategoryMode = { type: "closed" } | { type: "create" } | { type: "edit"; category: KbCategory };

export function KbView() {
	const { workspace } = useWorkspace();
	const { data: categories = [] } = useKbCategories(workspace.id);
	const { data: articles = [], isLoading } = useKbArticles(workspace.id);

	const deleteArticleMutation = useDeleteKbArticleMutation(workspace.id);
	const deleteCategoryMutation = useDeleteKbCategoryMutation(workspace.id);

	const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
	const [search, setSearch] = useState("");
	const [articleMode, setArticleMode] = useState<ArticleMode>({ type: "closed" });
	const [categoryMode, setCategoryMode] = useState<CategoryMode>({ type: "closed" });
	const [deletingArticle, setDeletingArticle] = useState<KbArticle | null>(null);
	const [deletingCategory, setDeletingCategory] = useState<KbCategory | null>(null);

	const visibleArticles = articles.filter((a) => {
		if (selectedCategory !== "all" && a.category_id !== selectedCategory) return false;
		if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
		return true;
	});
	const publishedCount = articles.filter((a) => a.status === "published").length;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-end justify-between">
				<p className="text-xs text-muted-foreground">
					Articles that power AI agent responses and serve as your team's reference.
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => setCategoryMode({ type: "create" })}
						className="rounded-lg text-xs"
					>
						<FolderPlus className="mr-1 size-3.5" />
						New category
					</Button>
					<Button onClick={() => setArticleMode({ type: "create" })} className="rounded-lg text-xs">
						<Plus className="mr-1 size-3.5" />
						New article
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<SummaryCard icon={BookOpen} label="Articles" value={articles.length} />
				<SummaryCard icon={FileText} label="Published" value={publishedCount} />
				<SummaryCard icon={FolderPlus} label="Categories" value={categories.length} />
			</div>

			<div className="grid lg:grid-cols-[260px_1fr] gap-4">
				<Card className="border-0 shadow-sm lg:sticky lg:top-4 lg:self-start">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">Categories</CardTitle>
					</CardHeader>
					<CardContent className="space-y-1">
						<CategoryButton
							label="All articles"
							count={articles.length}
							active={selectedCategory === "all"}
							onClick={() => setSelectedCategory("all")}
						/>
						{categories.map((c) => (
							<div key={c.id} className="group flex items-center gap-1">
								<div className="flex-1">
									<CategoryButton
										label={c.name}
										count={articles.filter((a) => a.category_id === c.id).length}
										active={selectedCategory === c.id}
										onClick={() => setSelectedCategory(c.id)}
									/>
								</div>
								<div className="hidden gap-0.5 group-hover:flex">
									<Button variant="ghost" size="icon" className="size-6" onClick={() => setCategoryMode({ type: "edit", category: c })}>
										<Pencil className="size-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-6 text-destructive"
										onClick={() => setDeletingCategory(c)}
									>
										<Trash2 className="size-3" />
									</Button>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card className="border-0 shadow-sm">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-sm font-semibold">Articles</CardTitle>
								<CardDescription className="text-xs">
									{visibleArticles.length} of {articles.length}
								</CardDescription>
							</div>
							<div className="relative w-64">
								<Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
								<Input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search title…"
									className="pl-8 h-8 rounded-lg text-xs"
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						{isLoading ? (
							<div className="p-6 text-center text-xs text-muted-foreground">Loading…</div>
						) : visibleArticles.length === 0 ? (
							<div className="flex flex-col items-center gap-2 py-10 text-center">
								<div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
									<BookOpen className="size-5 text-muted-foreground" />
								</div>
								<p className="text-sm font-medium">No articles</p>
							</div>
						) : (
							<ul className="divide-y">
								{visibleArticles.map((a) => (
									<li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<p className="truncate text-sm font-medium">{a.title}</p>
												<Badge variant={a.status === "published" ? "default" : "secondary"} className="text-[10px]">
													{a.status}
												</Badge>
												<Badge variant="outline" className="text-[10px]">{a.visibility}</Badge>
												{a.category_name && (
													<Badge variant="outline" className="text-[10px]">{a.category_name}</Badge>
												)}
											</div>
											{a.excerpt && <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.excerpt}</p>}
											<p className="mt-1 text-[10px] text-muted-foreground">
												{a.tags.length > 0 && `${a.tags.join(", ")} · `}
												updated {new Date(a.updated_at * 1000).toLocaleDateString()} · {a.view_count} views
											</p>
										</div>
										<div className="flex items-center gap-1">
											<Button variant="ghost" size="icon" onClick={() => setArticleMode({ type: "edit", article: a })} className="size-8">
												<Pencil className="size-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setDeletingArticle(a)}
												className="size-8 text-destructive"
											>
												<Trash2 className="size-3.5" />
											</Button>
										</div>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			</div>

			{articleMode.type === "create" && (
				<CreateArticleWrapper
					workspaceId={workspace.id}
					categories={categories}
					onClose={() => setArticleMode({ type: "closed" })}
				/>
			)}
			{articleMode.type === "edit" && (
				<EditArticleWrapper
					article={articleMode.article}
					workspaceId={workspace.id}
					categories={categories}
					onClose={() => setArticleMode({ type: "closed" })}
				/>
			)}
			{categoryMode.type === "create" && (
				<CreateCategoryWrapper
					workspaceId={workspace.id}
					onClose={() => setCategoryMode({ type: "closed" })}
				/>
			)}
			{categoryMode.type === "edit" && (
				<EditCategoryWrapper
					category={categoryMode.category}
					workspaceId={workspace.id}
					onClose={() => setCategoryMode({ type: "closed" })}
				/>
			)}

			<ConfirmDeleteModal
				open={!!deletingArticle}
				onOpenChange={(o) => !o && setDeletingArticle(null)}
				title="Delete article"
				description={`This will permanently delete "${deletingArticle?.title}".`}
				confirmLabel="Delete"
				onConfirm={() => {
					if (!deletingArticle) return;
					deleteArticleMutation.mutate(deletingArticle.id, {
						onSuccess: () => toast.success("Article deleted"),
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
					});
					setDeletingArticle(null);
				}}
			/>
			<ConfirmDeleteModal
				open={!!deletingCategory}
				onOpenChange={(o) => !o && setDeletingCategory(null)}
				title="Delete category"
				description={`Articles in "${deletingCategory?.name}" become uncategorized.`}
				confirmLabel="Delete"
				onConfirm={() => {
					if (!deletingCategory) return;
					deleteCategoryMutation.mutate(deletingCategory.id, {
						onSuccess: () => toast.success("Category deleted"),
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
					});
					setDeletingCategory(null);
				}}
			/>
		</div>
	);
}

function CategoryButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
				active ? "bg-primary text-primary-foreground" : "hover:bg-secondary/60"
			}`}
		>
			<span className="truncate">{label}</span>
			<span className={`text-[10px] ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{count}</span>
		</button>
	);
}

function SummaryCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
	return (
		<div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
			<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
				<Icon className="size-5 text-primary" />
			</div>
			<div>
				<p className="text-xl font-bold">{value}</p>
				<p className="text-[11px] text-muted-foreground">{label}</p>
			</div>
		</div>
	);
}

function CreateArticleWrapper({
	workspaceId,
	categories,
	onClose,
}: {
	workspaceId: string;
	categories: KbCategory[];
	onClose: () => void;
}) {
	const m = useCreateKbArticleMutation(workspaceId);
	return (
		<KbArticleFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			article={null}
			categories={categories}
			onSubmit={(v: KbArticleFormValues) => {
				m.mutate(
					{
						workspace_id: workspaceId,
						title: v.title.trim(),
						content: v.content,
						excerpt: v.excerpt.trim() || null,
						category_id: v.category_id,
						tags: v.tags,
						visibility: v.visibility,
						status: v.status,
					},
					{
						onSuccess: () => {
							toast.success("Article created");
							onClose();
						},
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
					},
				);
			}}
		/>
	);
}

function EditArticleWrapper({
	article,
	workspaceId,
	categories,
	onClose,
}: {
	article: KbArticle;
	workspaceId: string;
	categories: KbCategory[];
	onClose: () => void;
}) {
	const m = useUpdateKbArticleMutation(article.id, workspaceId);
	return (
		<KbArticleFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			article={article}
			categories={categories}
			onSubmit={(v) => {
				m.mutate(
					{
						title: v.title.trim(),
						content: v.content,
						excerpt: v.excerpt.trim() || null,
						category_id: v.category_id,
						tags: v.tags,
						visibility: v.visibility,
						status: v.status,
					},
					{
						onSuccess: () => {
							toast.success("Article updated");
							onClose();
						},
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
					},
				);
			}}
		/>
	);
}

function CreateCategoryWrapper({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
	const m = useCreateKbCategoryMutation(workspaceId);
	return (
		<KbCategoryFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			category={null}
			onSubmit={(v: KbCategoryFormValues) => {
				m.mutate(
					{
						workspace_id: workspaceId,
						name: v.name.trim(),
						description: v.description.trim() || null,
						display_order: v.display_order,
					},
					{
						onSuccess: () => {
							toast.success("Category created");
							onClose();
						},
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
					},
				);
			}}
		/>
	);
}

function EditCategoryWrapper({
	category,
	workspaceId,
	onClose,
}: {
	category: KbCategory;
	workspaceId: string;
	onClose: () => void;
}) {
	const m = useUpdateKbCategoryMutation(category.id, workspaceId);
	return (
		<KbCategoryFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			category={category}
			onSubmit={(v) => {
				m.mutate(
					{
						name: v.name.trim(),
						description: v.description.trim() || null,
						display_order: v.display_order,
					},
					{
						onSuccess: () => {
							toast.success("Category updated");
							onClose();
						},
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
					},
				);
			}}
		/>
	);
}
