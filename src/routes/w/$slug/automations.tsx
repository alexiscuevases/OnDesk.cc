import { createFileRoute } from "@tanstack/react-router";
import { AutomationsView } from "@/features/automations";

export const Route = createFileRoute("/w/$slug/automations")({
	component: AutomationsRoute,
});

function AutomationsRoute() {
	return <AutomationsView />;
}
