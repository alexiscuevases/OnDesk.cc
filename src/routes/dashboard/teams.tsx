import { createFileRoute } from "@tanstack/react-router";
import { TeamsView } from "@/features/teams";

export const Route = createFileRoute("/dashboard/teams")({
	component: TeamsView,
});
