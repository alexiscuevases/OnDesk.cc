import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspaceSchema, type CreateWorkspaceValues } from "../schemas/workspace.schema";
import { useCreateWorkspaceMutation } from "../hooks/use-workspace-mutations";
import { SelectPlanView } from "./select-plan-view";
import type { Workspace } from "../api/workspaces-api";

function toSlug(value: string) {
	return value
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.slice(0, 50);
}

function StepIndicator({ step }: { step: 1 | 2 }) {
	return (
		<div className="flex items-center gap-3 text-xs mb-8">
			<div className="flex items-center gap-2">
				<span
					className={`size-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
						step >= 1
							? "bg-primary text-primary-foreground"
							: "bg-muted text-muted-foreground"
					}`}>
					{step > 1 ? <Check className="size-3" /> : "1"}
				</span>
				<span className={step === 1 ? "font-semibold text-foreground" : "text-muted-foreground"}>
					Details
				</span>
			</div>
			<div className="flex-1 h-px bg-border" />
			<div className="flex items-center gap-2">
				<span
					className={`size-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
						step >= 2
							? "bg-primary text-primary-foreground"
							: "bg-muted text-muted-foreground"
					}`}>
					2
				</span>
				<span className={step === 2 ? "font-semibold text-foreground" : "text-muted-foreground"}>
					Plan
				</span>
			</div>
		</div>
	);
}

export function CreateWorkspaceView() {
	const navigate = useNavigate();
	const [createdWorkspace, setCreatedWorkspace] = useState<Workspace | null>(null);

	const createMutation = useCreateWorkspaceMutation((workspace) => {
		setCreatedWorkspace(workspace);
	});

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

	if (createdWorkspace) {
		return (
			<SelectPlanView
				workspaceId={createdWorkspace.id}
				workspaceName={createdWorkspace.name}
			/>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center hero-bg-gradient p-6 relative overflow-hidden">
			<div className="dot-grid absolute inset-0 opacity-[0.035] pointer-events-none" />

			<div className="w-full max-w-md relative">
				{/* Step indicator */}
				<StepIndicator step={1} />

				{/* Header */}
				<div className="text-center space-y-2 mb-8">
					<h1 className="text-2xl font-bold tracking-tight">Create your workspace</h1>
					<p className="text-sm text-muted-foreground">
						A workspace is where your team manages tickets and customers.
					</p>
				</div>

				{/* Form card */}
				<div className="bg-card border rounded-2xl p-6 shadow-sm">
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
											const slugField = form.getFieldValue("slug");
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
										URL identifier{" "}
										<span className="text-muted-foreground font-normal text-xs">(auto-generated)</span>
									</Label>
									<div className="flex items-center rounded-lg border bg-muted/40 overflow-hidden focus-within:ring-2 focus-within:ring-ring">
										<span className="px-3 text-sm text-muted-foreground border-r bg-muted/60 h-10 flex items-center select-none shrink-0">
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
									{field.state.value && (
										<p className="text-[11px] text-muted-foreground/70 font-mono">
											app.ondesk.cc/w/{field.state.value}
										</p>
									)}
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

						<div className="pt-1 space-y-2">
							<Button
								type="submit"
								className="w-full"
								size="lg"
								disabled={createMutation.isPending}>
								{createMutation.isPending ? "Creating..." : "Continue to plan →"}
							</Button>
						</div>
					</form>
				</div>

				{/* Back link */}
				<button
					onClick={() => navigate({ to: "/workspaces" })}
					className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
					<ArrowLeft className="size-3.5" />
					Back to workspaces
				</button>
			</div>
		</div>
	);
}
