import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OverviewView } from "@/features/overview";

export const Route = createFileRoute("/dashboard/overview")({
	component: OverviewViewRoute,
});

function OverviewViewRoute() {
	const navigate = useNavigate();
	return (
		<OverviewView onOpenTicket={(id) => navigate({ to: "/dashboard/tickets/$id", params: { id } })} />
	);
}
