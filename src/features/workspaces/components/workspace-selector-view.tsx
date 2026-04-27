import { useNavigate } from "@tanstack/react-router";
import { Plus, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useWorkspaces } from "../hooks/use-workspace-queries";
import { useAuth } from "@/context/auth-context";

const AVATAR_COLORS = [
	"bg-primary/10 text-primary",
	"bg-[#659815]/20 text-[#659815]",
	"bg-blue-500/10 text-blue-600",
	"bg-purple-500/10 text-purple-600",
	"bg-orange-500/10 text-orange-600",
	"bg-pink-500/10 text-pink-600",
];

function getAvatarColor(id: string) {
	let hash = 0;
	for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getRoleBadgeClass(role: string) {
	if (role === "owner") return "bg-primary/10 text-primary border-primary/20";
	if (role === "admin") return "bg-[#659815]/15 text-[#659815] border-[#659815]/25";
	return "bg-muted text-muted-foreground border-border";
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
		<div className="min-h-screen flex flex-col items-center justify-center hero-bg-gradient p-6 relative overflow-hidden">
			{/* Dot grid background */}
			<div className="dot-grid absolute inset-0 opacity-[0.035] pointer-events-none" />

			<div className="w-full max-w-lg relative">
				{/* Header */}
				<div className="text-center space-y-3 mb-8">
					<div className="mx-auto size-14 rounded-full bg-primary flex items-center justify-center shadow-sm ring-4 ring-primary/10 mb-4">
						<span className="text-base font-bold text-primary-foreground">{userInitials}</span>
					</div>
					<h1 className="text-2xl font-bold tracking-tight">
						Welcome back, {user?.name?.split(" ")[0]}
					</h1>
					<p className="text-sm text-muted-foreground">Select a workspace to continue</p>
				</div>

				{/* Workspace list */}
				<div className="space-y-2.5">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="size-5 animate-spin text-muted-foreground" />
						</div>
					) : workspaces.length === 0 ? (
						<div className="text-center py-10 rounded-2xl border border-dashed border-border bg-card/60">
							<div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
								<Sparkles className="size-5 text-primary/40" />
							</div>
							<p className="text-sm font-medium text-muted-foreground">No workspaces yet</p>
							<p className="text-xs text-muted-foreground/60 mt-1">Create one to get started</p>
						</div>
					) : (
						workspaces.map((ws) => (
							<button
								key={ws.id}
								onClick={() =>
									navigate({ to: "/w/$slug/overview", params: { slug: ws.slug } })
								}
								className="w-full flex items-center gap-4 p-4 rounded-2xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 text-left group">
								{ws.logo_url ? (
									<img
										src={ws.logo_url}
										alt={ws.name}
										className="size-11 rounded-xl object-cover flex-shrink-0 shadow-sm"
									/>
								) : (
									<div
										className={`size-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${getAvatarColor(ws.id)}`}>
										{ws.name.slice(0, 2).toUpperCase()}
									</div>
								)}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-0.5">
										<p className="font-semibold text-sm truncate">{ws.name}</p>
										<span
											className={`hidden sm:inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getRoleBadgeClass(ws.role)}`}>
											{ws.role}
										</span>
									</div>
									<p className="text-xs text-muted-foreground truncate">
										{ws.description ?? `/${ws.slug}`}
									</p>
								</div>
								<ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
							</button>
						))
					)}
				</div>

				{/* Create workspace */}
				<div className="mt-4">
					<button
						onClick={() => navigate({ to: "/workspaces/new" })}
						className="w-full flex items-center justify-center gap-2.5 p-4 rounded-2xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 text-sm text-muted-foreground hover:text-primary group">
						<div className="size-6 rounded-lg border border-dashed border-muted-foreground/40 group-hover:border-primary/50 flex items-center justify-center transition-colors">
							<Plus className="size-3.5" />
						</div>
						Create new workspace
					</button>
				</div>
			</div>
		</div>
	);
}
