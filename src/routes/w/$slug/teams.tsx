import { createFileRoute } from "@tanstack/react-router";
import { TeamsView } from "@/features/teams";

export const Route = createFileRoute("/w/$slug/teams")({
	validateSearch: (search: { team?: unknown }) => ({
		team: typeof search.team === "string" ? search.team : undefined,
	}),
	component: TeamsRoute,
});

function TeamsRoute() {
	const { team } = Route.useSearch();
	return <TeamsView initialTeamId={team} />;
}
