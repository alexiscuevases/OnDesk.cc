import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/w/$slug/agents")({
	component: AgentsPage,
});

function AgentsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Agents</h1>
				<p className="text-muted-foreground mt-1">Manage your support agents.</p>
			</div>
			<div className="flex items-center justify-center h-64 rounded-xl border border-dashed text-muted-foreground gap-3">
				<Users className="size-5" />
				<span className="text-sm">Agents coming soon</span>
			</div>
		</div>
	);
}
