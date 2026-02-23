import { createFileRoute } from "@tanstack/react-router";
import { ConfigurationsView } from "@/features/configurations";

export const Route = createFileRoute("/dashboard/configurations")({
	component: ConfigurationsView,
});
