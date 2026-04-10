import { createFileRoute } from "@tanstack/react-router";
import { SoloSmallTeamsPage } from "@/features/frontend/solution-page";

export const Route = createFileRoute("/solutions/solo-small-teams")({
	component: () => <SoloSmallTeamsPage />,
});
