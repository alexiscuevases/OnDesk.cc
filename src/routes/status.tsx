import { createFileRoute } from "@tanstack/react-router";
import StatusPage from "@/features/frontend/status";

export const Route = createFileRoute("/status")({
	component: () => <StatusPage />,
});
