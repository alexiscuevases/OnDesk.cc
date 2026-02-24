import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TicketDetailView } from "@/features/ticket-detail";

export const Route = createFileRoute("/w/$slug/tickets/$id")({
	component: TicketDetailRoute,
});

function TicketDetailRoute() {
	const { slug, id } = Route.useParams();
	const navigate = useNavigate();
	return (
		<TicketDetailView
			ticketId={id}
			onBack={() => navigate({ to: "/w/$slug/tickets", params: { slug } })}
		/>
	);
}
