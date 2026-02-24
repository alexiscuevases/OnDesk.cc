import { createFileRoute } from "@tanstack/react-router";
import { ConfigurationsView } from "@/features/configurations";

export const Route = createFileRoute("/w/$slug/settings")({
	component: ConfigurationsView,
});
