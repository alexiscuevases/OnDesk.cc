import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsView } from "@/features/analytics";
import { useWorkspace } from "@/context/workspace-context";

export const Route = createFileRoute("/w/$slug/analytics")({
	component: AnalyticsViewRoute,
});

function AnalyticsViewRoute() {
	const { workspace } = useWorkspace();
	return <AnalyticsView workspaceId={workspace.id} />;
}
