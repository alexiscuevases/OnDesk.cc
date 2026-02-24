import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsView } from "@/features/analytics";

export const Route = createFileRoute("/w/$slug/analytics")({
	component: AnalyticsView,
});
