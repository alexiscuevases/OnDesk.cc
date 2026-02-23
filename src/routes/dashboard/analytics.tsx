import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsView } from "@/components/dashboard/analytics-view";

export const Route = createFileRoute("/dashboard/analytics")({
	component: AnalyticsView,
});
