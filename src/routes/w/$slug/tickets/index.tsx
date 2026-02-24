import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TicketsView } from "@/features/tickets";

export const Route = createFileRoute("/w/$slug/tickets/")({
	component: TicketsViewRoute,
});

function TicketsViewRoute() {
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	return (
		<TicketsView
			onOpenTicket={(id) => navigate({ to: "/w/$slug/tickets/$id", params: { slug, id } })}
		/>
	);
}
