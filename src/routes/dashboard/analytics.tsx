import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsView } from "@/features/analytics";

export const Route = createFileRoute("/dashboard/analytics")({
	component: AnalyticsView,
});
