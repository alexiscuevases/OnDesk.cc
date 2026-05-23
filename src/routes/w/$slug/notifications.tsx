import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/features/notifications";

export const Route = createFileRoute("/w/$slug/notifications")({
	component: NotificationsView,
});
