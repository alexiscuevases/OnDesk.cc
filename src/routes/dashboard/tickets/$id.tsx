import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TicketDetailView } from "@/components/dashboard/ticket-detail-view";

export const Route = createFileRoute("/dashboard/tickets/$id")({
	component: TicketDetailRoute,
});

function TicketDetailRoute() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	return (
		<TicketDetailView
			ticketId={id}
			onBack={() => navigate({ to: "/dashboard/tickets" })}
		/>
	);
}
