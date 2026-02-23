import { createFileRoute } from "@tanstack/react-router";
import { TeamsView } from "@/components/dashboard/teams-view";

export const Route = createFileRoute("/dashboard/teams")({
	component: TeamsView,
});
