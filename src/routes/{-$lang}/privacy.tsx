import { createFileRoute } from "@tanstack/react-router";
import PrivacyPage from "@/features/frontend/privacy";

export const Route = createFileRoute("/{-$lang}/privacy")({
	component: () => <PrivacyPage />,
});
