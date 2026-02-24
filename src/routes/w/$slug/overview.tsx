import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OverviewView } from "@/features/overview";

export const Route = createFileRoute("/w/$slug/overview")({
	component: OverviewViewRoute,
});

function OverviewViewRoute() {
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	return (
		<OverviewView
			onOpenTicket={(id) => navigate({ to: "/w/$slug/tickets/$id", params: { slug, id } })}
		/>
	);
}
