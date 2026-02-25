import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OverviewView } from "@/features/overview";
import { useWorkspace } from "@/context/workspace-context";

export const Route = createFileRoute("/w/$slug/overview")({
	component: OverviewViewRoute,
});

function OverviewViewRoute() {
	const { slug } = Route.useParams();
	const { workspace } = useWorkspace();
	const navigate = useNavigate();
	return (
		<OverviewView
			workspaceId={workspace.id}
			onOpenTicket={(id) => navigate({ to: "/w/$slug/tickets/$id", params: { slug, id } })}
			onViewAll={() => navigate({ to: "/w/$slug/tickets", params: { slug } })}
		/>
	);
}
