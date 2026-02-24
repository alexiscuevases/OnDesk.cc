import { useNavigate } from "@tanstack/react-router";
import { Building2, ArrowLeft } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspaceSchema, type CreateWorkspaceValues } from "../schemas/workspace.schema";
import { useCreateWorkspaceMutation } from "../hooks/use-workspace-mutations";

function toSlug(value: string) {
	return value
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.slice(0, 50);
}

export function CreateWorkspaceView() {
	const navigate = useNavigate();
	const createMutation = useCreateWorkspaceMutation();

	const form = useForm({
		defaultValues: { name: "", slug: "", description: "", logo_url: "" } as CreateWorkspaceValues,
		onSubmit: async ({ value }) => {
			await createMutation.mutateAsync({
				name: value.name,
				slug: value.slug,
				description: value.description || undefined,
				logo_url: value.logo_url || undefined,
			});
		},
		validators: { onChange: createWorkspaceSchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
			<div className="w-full max-w-md space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<div className="mx-auto size-12 rounded-2xl bg-primary flex items-center justify-center mb-4">
						<Building2 className="size-6 text-primary-foreground" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight">Create your workspace</h1>
					<p className="text-sm text-muted-foreground">
						A workspace is where your team manages tickets and customers.
					</p>
				</div>

				{/* Form */}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-5">
					{/* Name */}
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="name">Workspace name</Label>
								<Input
									id="name"
									placeholder="Acme Corp"
									value={field.state.value}
									onChange={(e) => {
										field.handleChange(e.target.value);
										// Auto-generate slug from name if slug hasn't been manually edited
										const slugField = form.getFieldValue("slug");
										const autoSlug = toSlug(field.state.value);
										if (!slugField || slugField === toSlug(field.state.value.slice(0, -1))) {
											form.setFieldValue("slug", toSlug(e.target.value));
										}
									}}
									onBlur={field.handleBlur}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive">
										{field.state.meta.errors[0]?.message}
									</p>
								)}
							</div>
						)}
					</form.Field>

					{/* Slug */}
					<form.Field name="slug">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="slug">
									Slug{" "}
									<span className="text-muted-foreground font-normal text-xs">(URL identifier)</span>
								</Label>
								<div className="flex items-center rounded-lg border bg-muted/40 overflow-hidden focus-within:ring-2 focus-within:ring-ring">
									<span className="px-3 text-sm text-muted-foreground border-r bg-muted/60 h-10 flex items-center select-none">
										/w/
									</span>
									<input
										id="slug"
										className="flex-1 h-10 px-3 text-sm bg-transparent outline-none"
										placeholder="acme-corp"
										value={field.state.value}
										onChange={(e) => field.handleChange(toSlug(e.target.value))}
										onBlur={field.handleBlur}
									/>
								</div>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive">
										{field.state.meta.errors[0]?.message}
									</p>
								)}
							</div>
						)}
					</form.Field>

					{/* Description */}
					<form.Field name="description">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="description">
									Description{" "}
									<span className="text-muted-foreground font-normal text-xs">(optional)</span>
								</Label>
								<Textarea
									id="description"
									placeholder="What does your team do?"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									rows={3}
									className="resize-none"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive">
										{field.state.meta.errors[0]?.message}
									</p>
								)}
							</div>
						)}
					</form.Field>

					{createMutation.error && (
						<p className="text-sm text-destructive text-center">
							{createMutation.error.message}
						</p>
					)}

					<div className="pt-2 space-y-3">
						<Button
							type="submit"
							className="w-full"
							size="lg"
							disabled={createMutation.isPending}>
							{createMutation.isPending ? "Creating..." : "Create workspace"}
						</Button>

						<Button
							type="button"
							variant="ghost"
							className="w-full gap-2 text-muted-foreground"
							onClick={() => navigate({ to: "/workspaces" })}>
							<ArrowLeft className="size-4" />
							Back to workspaces
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
