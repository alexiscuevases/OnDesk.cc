import { createFileRoute } from "@tanstack/react-router";
import IntegrationsPage from "@/features/frontend/integrations";

export const Route = createFileRoute("/{-$lang}/integrations")({
	component: () => <IntegrationsPage />,
});
