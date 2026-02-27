import { createFileRoute } from "@tanstack/react-router";
import IntegrationsPage from "@/features/frontend/integrations";

export const Route = createFileRoute("/integrations")({
	component: () => <IntegrationsPage />,
});
