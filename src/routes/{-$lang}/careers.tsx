import { createFileRoute } from "@tanstack/react-router";
import CareersPage from "@/features/frontend/careers";

export const Route = createFileRoute("/{-$lang}/careers")({
	component: () => <CareersPage />,
});
