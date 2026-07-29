import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/features/frontend/landing";

export const Route = createFileRoute("/{-$lang}/")({
	component: () => <LandingPage />,
});
