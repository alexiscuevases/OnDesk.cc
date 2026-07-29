import { createFileRoute } from "@tanstack/react-router";
import HelpCenterPage from "@/features/frontend/help";

export const Route = createFileRoute("/{-$lang}/help")({
	component: () => <HelpCenterPage />,
});
