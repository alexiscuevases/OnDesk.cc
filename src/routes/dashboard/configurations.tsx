import { createFileRoute } from "@tanstack/react-router";
import { ConfigurationsView } from "@/components/dashboard/configurations-view";

export const Route = createFileRoute("/dashboard/configurations")({
	component: ConfigurationsView,
});
