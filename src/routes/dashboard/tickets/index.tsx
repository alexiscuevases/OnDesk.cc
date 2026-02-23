import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TicketsView } from "@/features/tickets";

export const Route = createFileRoute("/dashboard/tickets/")({
	component: TicketsViewRoute,
});

function TicketsViewRoute() {
	const navigate = useNavigate();
	return (
		<TicketsView onOpenTicket={(id) => navigate({ to: "/dashboard/tickets/$id", params: { id } })} />
	);
}
