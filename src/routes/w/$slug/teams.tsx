import { createFileRoute } from "@tanstack/react-router";
import { TeamsView } from "@/features/teams";

export const Route = createFileRoute("/w/$slug/teams")({
	component: TeamsView,
});
