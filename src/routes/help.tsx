import { createFileRoute } from "@tanstack/react-router";
import HelpCenterPage from "@/features/frontend/help";

export const Route = createFileRoute("/help")({
	component: () => <HelpCenterPage />,
});
