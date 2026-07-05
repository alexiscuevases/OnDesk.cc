import { useNavigate } from "@tanstack/react-router";
import { Plus, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useWorkspaces } from "../hooks/use-workspace-queries";
import { useAuth } from "@/context/auth-context";
import { PulseLine } from "@/features/frontend/shared";

function getRoleBadgeClass(role: string) {
	if (role === "owner") return "border-primary/25 text-primary bg-primary/5 dark:border-accent/30 dark:text-accent dark:bg-accent/10";
	if (role === "admin") return "border-accent/30 text-accent bg-accent/8";
	return "border-border text-muted-foreground bg-muted";
}

export function WorkspaceSelectorView() {
	const { user } = useAuth();
	const { data: workspaces = [], isLoading } = useWorkspaces();
	const navigate = useNavigate();

	const userInitials = user?.name
		?.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase() ?? "?";

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
			<div className="w-full max-w-lg border border-border bg-card">
				{/* Header */}
				<div className="border-b border-border px-6 py-3 flex items-center justify-between">
					<span className="console-label text-primary dark:text-accent">
						00 — Workspaces<span className="blink-cursor text-accent">_</span>
					</span>
					<span className="console-label hidden sm:block">{workspaces.length} available</span>
				</div>

				<div className="px-6 pt-8 pb-6">
					<div className="flex items-center gap-4 mb-1">
						<div className="size-12 bg-primary flex items-center justify-center shrink-0">
							<span className="font-mono text-sm font-bold text-primary-foreground">{userInitials}</span>
						</div>
						<div>
							<h1 className="text-2xl font-black tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
							<p className="text-sm text-muted-foreground">Select a workspace to continue</p>
						</div>
					</div>
				</div>

				<PulseLine className="h-6 w-full text-primary/40 dark:text-accent/40" strokeWidth={1.2} />

				{/* Workspace list */}
				<div className="border-t border-border divide-y divide-border">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="size-5 animate-spin text-muted-foreground" />
						</div>
					) : workspaces.length === 0 ? (
						<div className="text-center py-10">
							<div className="size-10 border border-border bg-secondary/60 flex items-center justify-center mx-auto mb-3">
								<Sparkles className="size-4.5 text-muted-foreground" />
							</div>
							<p className="font-mono text-xs uppercase tracking-[0.12em] font-semibold text-muted-foreground">No workspaces yet</p>
							<p className="text-xs text-muted-foreground/60 mt-1">Create one to get started</p>
						</div>
					) : (
						workspaces.map((ws, i) => (
							<button
								key={ws.id}
								onClick={() => navigate({ to: "/w/$slug/overview", params: { slug: ws.slug } })}
								className="group relative w-full flex items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-secondary/50">
								<span className="console-label w-6 shrink-0 text-muted-foreground/50">{String(i + 1).padStart(2, "0")}</span>
								{ws.logo_url ? (
									<img src={ws.logo_url} alt={ws.name} className="size-10 object-cover flex-shrink-0" />
								) : (
									<div className="size-10 bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm">
										{ws.name.slice(0, 2).toUpperCase()}
									</div>
								)}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-0.5">
										<p className="font-semibold text-sm truncate">{ws.name}</p>
										<span
											className={`hidden sm:inline-flex shrink-0 items-center border px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] ${getRoleBadgeClass(ws.role)}`}>
											{ws.role}
										</span>
									</div>
									<p className="font-mono text-[11px] text-muted-foreground truncate">{ws.description ?? `/${ws.slug}`}</p>
								</div>
								<ArrowRight className="size-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
								<span className="scan-line" />
							</button>
						))
					)}
				</div>

				{/* Create workspace */}
				<button
					onClick={() => navigate({ to: "/workspaces/new" })}
					className="w-full flex items-center justify-center gap-2.5 border-t border-dashed border-border px-6 py-4 font-mono text-xs uppercase tracking-[0.12em] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 dark:hover:text-accent dark:hover:bg-accent/5 transition-colors group">
					<Plus className="size-3.5" />
					Create new workspace
				</button>
			</div>
		</div>
	);
}
