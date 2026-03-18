import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TicketsView } from "@/features/tickets";

export const Route = createFileRoute("/w/$slug/tickets/")({
	validateSearch: (search: { assignee?: unknown; contact?: unknown }) => ({
		assignee: typeof search.assignee === "string" ? search.assignee : undefined,
		contact: typeof search.contact === "string" ? search.contact : undefined,
	}),
	component: TicketsViewRoute,
});

function TicketsViewRoute() {
	const { slug } = Route.useParams();
	const { assignee, contact } = Route.useSearch();
	const navigate = useNavigate();
	return (
		<TicketsView
			onOpenTicket={(id) => navigate({ to: "/w/$slug/tickets/$id", params: { slug, id } })}
			initialAssigneeId={assignee}
			initialRequesterId={contact}
		/>
	);
}
