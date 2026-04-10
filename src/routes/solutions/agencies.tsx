import { createFileRoute } from "@tanstack/react-router";
import { AgenciesPage } from "@/features/frontend/solution-page";

export const Route = createFileRoute("/solutions/agencies")({
	component: () => <AgenciesPage />,
});
