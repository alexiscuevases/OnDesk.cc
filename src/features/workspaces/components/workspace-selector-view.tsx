import { useNavigate } from "@tanstack/react-router";
import { Plus, Building2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaces } from "../hooks/use-workspace-queries";
import { useAuth } from "@/context/auth-context";

export function WorkspaceSelectorView() {
	const { user } = useAuth();
	const { data: workspaces = [], isLoading } = useWorkspaces();
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
			<div className="w-full max-w-md space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<div className="mx-auto size-12 rounded-2xl bg-primary flex items-center justify-center mb-4">
						<Building2 className="size-6 text-primary-foreground" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight">
						Welcome back, {user?.name?.split(" ")[0]}
					</h1>
					<p className="text-sm text-muted-foreground">
						Select a workspace to continue
					</p>
				</div>

				{/* Workspace list */}
				<div className="space-y-2">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="size-5 animate-spin text-muted-foreground" />
						</div>
					) : workspaces.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground text-sm">
							No workspaces found.
						</div>
					) : (
						workspaces.map((ws) => (
							<button
								key={ws.id}
								onClick={() =>
									navigate({ to: "/w/$slug/overview", params: { slug: ws.slug } })
								}
								className="w-full flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent transition-colors text-left group">
								{ws.logo_url ? (
									<img
										src={ws.logo_url}
										alt={ws.name}
										className="size-10 rounded-lg object-cover flex-shrink-0"
									/>
								) : (
									<div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
										<span className="text-sm font-bold text-primary">
											{ws.name.slice(0, 2).toUpperCase()}
										</span>
									</div>
								)}
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-sm truncate">{ws.name}</p>
									<p className="text-xs text-muted-foreground truncate">
										/{ws.slug} · {ws.role}
									</p>
								</div>
								<ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
							</button>
						))
					)}
				</div>

				{/* Create new */}
				<div className="pt-2">
					<Button
						variant="outline"
						className="w-full gap-2"
						onClick={() => navigate({ to: "/workspaces/new" })}>
						<Plus className="size-4" />
						Create new workspace
					</Button>
				</div>
			</div>
		</div>
	);
}
