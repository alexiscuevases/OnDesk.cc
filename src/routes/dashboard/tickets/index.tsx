import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TicketsView } from "@/components/dashboard/tickets-view";

export const Route = createFileRoute("/dashboard/tickets/")({
	component: TicketsViewRoute,
});

function TicketsViewRoute() {
	const navigate = useNavigate();
	return (
		<TicketsView onOpenTicket={(id) => navigate({ to: "/dashboard/tickets/$id", params: { id } })} />
	);
}
