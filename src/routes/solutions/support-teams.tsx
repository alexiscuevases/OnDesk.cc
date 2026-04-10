import { createFileRoute } from "@tanstack/react-router";
import { SupportTeamsPage } from "@/features/frontend/solution-page";

export const Route = createFileRoute("/solutions/support-teams")({
	component: () => <SupportTeamsPage />,
});
